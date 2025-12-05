import { Controller } from '@nestjs/common';
import { NotificationsService } from './notification-subscription.service';

@Controller('notification-subscription')
export class NotificationSubscriptionController {
  constructor(
    private readonly notificationSubscriptionService: NotificationsService,
  ) {}
}
