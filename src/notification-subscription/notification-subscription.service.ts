/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// src/notifications/notifications.service.ts
import { Injectable, Logger } from '@nestjs/common';
import * as webPush from 'web-push';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { env } from 'env';
import { NotificationSubscription } from './entity/notification-subscription.entity';

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
