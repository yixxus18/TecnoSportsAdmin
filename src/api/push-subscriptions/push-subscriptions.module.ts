import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PushSubscriptionsService } from './push-subscriptions.service';
import { PushSubscriptionsController } from './push-subscriptions.controller';
import { PushSubscription } from './entities/push-subscription.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PushSubscription]),
    forwardRef(() => NotificationsModule),
  ],
  controllers: [PushSubscriptionsController],
  providers: [PushSubscriptionsService],
  exports: [PushSubscriptionsService],
})
export class PushSubscriptionsModule {}

