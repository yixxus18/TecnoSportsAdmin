import { Controller } from '@nestjs/common';
import { NotificationSubscriptionService } from './notification-subscription.service';

@Controller('notification-subscription')
export class NotificationSubscriptionController {
  constructor(private readonly notificationSubscriptionService: NotificationSubscriptionService) {}
}
