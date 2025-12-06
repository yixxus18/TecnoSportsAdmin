import { Controller, Post, Delete, Body, Query, Get, Inject, forwardRef } from '@nestjs/common';
import { PushSubscriptionsService } from './push-subscriptions.service';
import { CreatePushSubscriptionDto } from './dto/create-push-subscription.dto';
import { NotificationsService } from '../notifications/notifications.service';

// Note: This controller doesn't use AuthGuard to allow anonymous subscriptions
@Controller('notification-subscription')
export class PushSubscriptionsController {
  constructor(
    private readonly pushSubscriptionsService: PushSubscriptionsService,
    @Inject(forwardRef(() => NotificationsService))
    private readonly notificationsService: NotificationsService,
  ) {}

  @Post('subscribe')
  subscribe(@Body() createPushSubscriptionDto: CreatePushSubscriptionDto) {
    return this.pushSubscriptionsService.subscribe(createPushSubscriptionDto);
  }

  @Delete('unsubscribe')
  unsubscribe(@Query('endpoint') endpoint: string) {
    return this.pushSubscriptionsService.unsubscribe(endpoint);
  }

  @Get('list')
  listAll() {
    return this.pushSubscriptionsService.findAll();
  }

  @Post('test')
  async testNotification(@Body() body: { userId?: number; title: string; message: string }) {
    if (body.userId) {
      return await this.pushSubscriptionsService.sendNotificationToUser(
        body.userId,
        body.title,
        body.message,
      );
    }
    return await this.pushSubscriptionsService.sendNotificationToAll(
      body.title,
      body.message,
    );
  }

  // Manual trigger for the cron jobs (for debugging)
  @Post('trigger-cron')
  async triggerCron() {
    const upcomingResult = await this.notificationsService.checkUpcomingMatches();
    const startingResult = await this.notificationsService.checkStartingMatches();
    return {
      upcoming: upcomingResult,
      starting: startingResult,
      triggeredAt: new Date().toISOString(),
    };
  }
}
