import { Controller, Get, Patch, Param, UseGuards, Post } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { SupabaseAuthGuard } from 'src/supabase-auth/supabase-auth.guard';
import { env } from 'env';

@Controller(`${env.api_prefix}notifications`)
@UseGuards(SupabaseAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('user/:userId')
  findAll(@Param('userId') userId: string) {
    return this.notificationsService.findAllByUser(+userId);
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(+id);
  }
  @Get('debug/cron')
  debugCron() {
    return this.notificationsService.debugCron();
  }

  @Post('test/:userId')
  sendTest(@Param('userId') userId: string) {
    return this.notificationsService.sendTestNotification(+userId);
  }
}
