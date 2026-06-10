import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comment } from './schemas/comment.schema';
import { UserService } from '../user/user.service';
import { NotificationService } from '../notification/notification.service';
import { EventsGateway } from '../gateway/events.gateway';
import { User } from '../user/schemas/user.schema';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment.name) private readonly commentModel: Model<Comment>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly userService: UserService,
    private readonly notificationService: NotificationService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async createComment(authorId: string, content: string): Promise<Comment> {
    if (!content || content.trim() === '') {
      throw new BadRequestException('Comment content cannot be empty');
    }

    const newComment = new this.commentModel({
      author: new Types.ObjectId(authorId),
      content,
      parentComment: null,
      likes: [],
    });

    const saved = await newComment.save();
    const populated = await saved.populate('author', 'username email profilePicture');

    // Broadcast globally to all connected socket clients for instantaneous dashboard feed updates
    this.eventsGateway.broadcastComment(populated);

    // requirement: "Users can post comments and Notifications should be sent to all users"
    // Create notifications for all other users in database
    const allUsers = await this.userModel.find({ _id: { $ne: new Types.ObjectId(authorId) } }).exec();
    
    // We run notification generation asynchronously so it does not block the API response
    Promise.all(
      allUsers.map(u => 
        this.notificationService.createNotification({
          recipient: u._id.toString(),
          sender: authorId,
          type: 'comment',
          comment: populated._id.toString(),
          message: `${populated.author['username']} commented: "${content.substring(0, 30)}${content.length > 30 ? '...' : ''}"`,
        }).catch(err => console.log('Failed to notify user:', u._id, err.message))
      )
    );

    return populated;
  }

  async createReply(authorId: string, parentCommentId: string, content: string): Promise<Comment> {
    if (!content || content.trim() === '') {
      throw new BadRequestException('Reply content cannot be empty');
    }

    const parent = await this.commentModel.findById(parentCommentId).populate('author').exec();
    if (!parent) {
      throw new NotFoundException('Parent comment not found');
    }

    const newReply = new this.commentModel({
      author: new Types.ObjectId(authorId),
      content,
      parentComment: new Types.ObjectId(parentCommentId),
      likes: [],
    });

    const saved = await newReply.save();
    const populated = await saved.populate('author', 'username email profilePicture');

    // Emit live update event so the client gets the reply in real-time
    this.eventsGateway.server.emit('reply.created', {
      parentCommentId,
      reply: populated,
    });

    // requirement: "Don't notify everyone if replied. Just notify the user who got the reply."
    const parentAuthorId = parent.author._id.toString();
    if (parentAuthorId !== authorId) {
      const replier = await this.userService.findById(authorId);
      await this.notificationService.createNotification({
        recipient: parentAuthorId,
        sender: authorId,
        type: 'reply',
        comment: parentCommentId,
        message: `${replier?.username} replied to your comment: "${content.substring(0, 30)}${content.length > 30 ? '...' : ''}"`,
      });
    }

    return populated;
  }

  async toggleLike(userId: string, commentId: string): Promise<{ liked: boolean; likesCount: number }> {
    const comment = await this.commentModel.findById(commentId);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const userObjectId = new Types.ObjectId(userId);
    const index = comment.likes.indexOf(userObjectId);
    let liked = false;

    if (index > -1) {
      // Unlike
      comment.likes.splice(index, 1);
    } else {
      // Like
      comment.likes.push(userObjectId);
      liked = true;
    }

    await comment.save();

    // Broadcast like update so all clients get the like count refreshed in real-time
    this.eventsGateway.server.emit('comment.liked', {
      commentId,
      likesCount: comment.likes.length,
      likes: comment.likes,
    });

    // requirement: "Send real-time notifications for: When someone likes your comment."
    const commentAuthorId = comment.author.toString();
    if (liked && commentAuthorId !== userId) {
      const liker = await this.userService.findById(userId);
      await this.notificationService.createNotification({
        recipient: commentAuthorId,
        sender: userId,
        type: 'like',
        comment: commentId,
        message: `${liker?.username} liked your comment: "${comment.content.substring(0, 30)}${comment.content.length > 30 ? '...' : ''}"`,
      });
    }

    return { liked, likesCount: comment.likes.length };
  }

  async getAllComments(): Promise<any[]> {
    const allComments = await this.commentModel.find()
      .populate('author', 'username email profilePicture')
      .sort({ createdAt: -1 })
      .exec();

    // Map comments for easy threaded processing
    const mainComments = allComments.filter(c => c.parentComment === null);
    const replies = allComments.filter(c => c.parentComment !== null);

    return mainComments.map(main => {
      const mainObj = main.toObject() as any;
      mainObj.replies = replies
        .filter(r => r.parentComment?.toString() === main._id.toString())
        .map(r => r.toObject())
        .reverse(); // Show replies in chronological order
      return mainObj;
    });
  }
}
