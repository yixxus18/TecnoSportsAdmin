import { Module } from '@nestjs/common';
import { NotificationsService } from './notification-subscription.service';
import { NotificationSubscriptionController } from './notification-subscription.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationSubscription } from './entity/notification-subscription.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationSubscription])],
  controllers: [NotificationSubscriptionController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationSubscriptionModule {}
