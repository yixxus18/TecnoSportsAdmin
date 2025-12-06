/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Body, Controller, HttpCode, Post, Request } from '@nestjs/common';
import { NotificationsService } from './notification-subscription.service';
import { CreateSubscriptionDto } from './dto/create-subscription';

@Controller('notification-subscription')
export class NotificationSubscriptionController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // 2. LA RUTA DEBE SER POST 'subscribe'
  // URL Completa: /notification-subscription/subscribe
  @Post('subscribe')
  @HttpCode(201)
  async subscribe(
    @Body() subscriptionDto: CreateSubscriptionDto,
    @Request() req,
  ) {
    const userId = req.user.id; // Reemplaza esto con tu lógica de autenticación (ej: req.user.id)

    return await this.notificationsService.saveSubscription(
      subscriptionDto,
      userId,
    );
  }
}
