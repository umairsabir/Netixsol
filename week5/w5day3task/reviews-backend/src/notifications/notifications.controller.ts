import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getUserNotifications(@Req() req: any) {
    const userId = req.user._id;
    return this.notificationsService.getUserNotifications(userId.toString());
  }

  @Patch(':id/read')
  @UseGuards(JwtAuthGuard)
  async markAsRead(@Req() req: any, @Param('id') notificationId: string) {
    const userId = req.user._id;
    return this.notificationsService.markAsRead(userId.toString(), notificationId);
  }

  @Post('webhook/product-update')
  async handleProductUpdateWebhook(
    @Body('productId') productId: string,
    @Body('updatedFields') updatedFields: any,
  ) {
    return this.notificationsService.processProductUpdateWebhook(productId, updatedFields);
  }
}
