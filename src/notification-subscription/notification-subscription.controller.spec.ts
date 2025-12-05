import { Test, TestingModule } from '@nestjs/testing';
import { NotificationSubscriptionController } from './notification-subscription.controller';
import { NotificationSubscriptionService } from './notification-subscription.service';

describe('NotificationSubscriptionController', () => {
  let controller: NotificationSubscriptionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationSubscriptionController],
      providers: [NotificationSubscriptionService],
    }).compile();

    controller = module.get<NotificationSubscriptionController>(NotificationSubscriptionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
