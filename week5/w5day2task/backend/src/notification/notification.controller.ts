import { Controller, Get, Put, Param, UseGuards, Request } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async getNotifications(@Request() req: any) {
    return this.notificationService.getNotificationsForUser(req.user._id);
  }

  @Put('read-all')
  async markAllAsRead(@Request() req: any) {
    return this.notificationService.markAllAsRead(req.user._id);
  }

  @Put(':id/read')
  async markAsRead(@Request() req: any, @Param('id') id: string) {
    return this.notificationService.markAsRead(id, req.user._id);
  }
}
