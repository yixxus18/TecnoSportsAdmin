/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// src/notifications/notifications.service.ts
import { Injectable, Logger } from '@nestjs/common';
import * as webPush from 'web-push';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { env } from 'env';
import { NotificationSubscription } from './entity/notification-subscription.entity';
import { CreateSubscriptionDto } from './dto/create-subscription';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(NotificationSubscription)
    private subsRepo: Repository<NotificationSubscription>,
  ) {
    // ⚠️ Asegúrate de que estas variables de entorno existan
    webPush.setVapidDetails(
      'mailto: <rs795384@hotmail.com>',
      env.vapid.public_key ?? '',
      env.vapid.private_key ?? '',
    );
  }

  async saveSubscription(
    subscriptionDto: CreateSubscriptionDto,
    userId: number,
  ) {
    const { endpoint, keys } = subscriptionDto;

    // 1. Intentamos encontrar una suscripción existente con el mismo endpoint
    const existingSub = await this.subsRepo.findOne({
      where: { endpoint },
    });

    // 2. Preparamos los datos
    const subData = {
      endpoint: endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
      userId: userId, // Usamos el ID del usuario
    };

    if (existingSub) {
      // 3. Si existe, actualizamos
      await this.subsRepo.update(existingSub.id, subData);
      return { message: 'Subscription updated successfully.', endpoint };
    } else {
      // 4. Si no existe, creamos una nueva
      await this.subsRepo.save(subData);
      return { message: 'Subscription saved successfully.', endpoint };
    }
  }

  async sendBroadcastNotification(payload: {
    title: string;
    body: string;
    url?: string;
  }) {
    const subscriptions = await this.subsRepo.find();
    const notificationPayload = JSON.stringify(payload);

    // Mapeamos las suscripciones a promesas de envío
    const promises = subscriptions.map(async (sub) => {
      try {
        await webPush.sendNotification(
          {
            endpoint: sub.endpoint,
            // Reconstruimos el objeto de llaves
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          notificationPayload,
        );
      } catch (error) {
        this.logger.error(
          `Error al enviar a ${sub.id}. Status: ${error.statusCode}`,
        );
        // Limpia suscripciones obsoletas (código 410 Gone o 404 Not Found)
        if (error.statusCode === 410 || error.statusCode === 404) {
          await this.subsRepo.delete(sub.id);
          this.logger.warn(`Suscripción obsoleta borrada: ${sub.id}`);
        }
      }
    });

    // Usamos allSettled para que el proceso no se detenga si una falla
    await Promise.allSettled(promises);
  }
}
