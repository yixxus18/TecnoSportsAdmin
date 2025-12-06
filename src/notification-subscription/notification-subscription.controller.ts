/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Body,
  Controller,
  HttpCode,
  Post,
  Request,
  Logger,
} from '@nestjs/common';
import { NotificationsService } from './notification-subscription.service';
import { CreateSubscriptionDto } from './dto/create-subscription';
import { AuthGuard } from '@nestjs/passport';

@Controller('notification-subscription')
export class NotificationSubscriptionController {
  private readonly logger = new Logger(NotificationSubscriptionController.name);
  constructor(private readonly notificationsService: NotificationsService) {}

  // 2. LA RUTA DEBE SER POST 'subscribe'
  // URL Completa: /notification-subscription/subscribe
  @Post('subscribe')
  // @UseGuards(AuthGuard('jwt'))
  @HttpCode(201)
  async subscribe(
    @Body() subscriptionDto: CreateSubscriptionDto,
    @Request() req,
  ) {
    this.logger.log('📢 ¡PETICIÓN RECIBIDA EN /subscribe!');
    this.logger.log(`Datos recibidos: ${JSON.stringify(subscriptionDto)}`);
    // const userId = req.user.id;
    const userId = 1;

    return await this.notificationsService.saveSubscription(
      subscriptionDto,
      userId,
    );
  }
}
