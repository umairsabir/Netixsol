import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ default: 'user', enum: ['user', 'admin', 'superadmin'] })
  role: string;

  @Prop({ default: false })
  isBlocked: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
