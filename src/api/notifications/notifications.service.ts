import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { Notification } from './entities/notification.entity';
import { Favorite } from '../favorites/entities/favorite.entity';
import { Match } from '../matches/entities/match.entity';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,
    @InjectRepository(Match)
    private readonly matchRepository: Repository<Match>,
  ) {}

  async create(createNotificationDto: CreateNotificationDto) {
    const notification = this.notificationRepository.create(
      createNotificationDto,
    );
    return await this.notificationRepository.save(notification);
  }

  async findAllByUser(userId: number) {
    return await this.notificationRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async markAsRead(id: number) {
    return await this.notificationRepository.update(id, { isRead: true });
  }

  // Check every minute for matches starting in 1 hour
  @Cron(CronExpression.EVERY_MINUTE)
  async checkUpcomingMatches() {
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
    const oneHourLaterPlusOneMinute = new Date(
      oneHourLater.getTime() + 60 * 1000,
    );

    this.logger.log(`Checking upcoming matches between ${oneHourLater.toISOString()} and ${oneHourLaterPlusOneMinute.toISOString()}`);

    // Find matches starting between 1 hour and 1 hour + 1 minute from now
    const upcomingMatches = await this.matchRepository.find({
      where: {
        matchDate: Between(oneHourLater, oneHourLaterPlusOneMinute),
      },
    });

    this.logger.log(`Found ${upcomingMatches.length} upcoming matches`);

    for (const match of upcomingMatches) {
      await this.notifyFavorites(
        match,
        '¡Tu partido favorito comienza en 1 hora!',
      );
    }
  }

  // Check every minute for matches starting now
  @Cron(CronExpression.EVERY_MINUTE)
  async checkStartingMatches() {
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);

    this.logger.log(`Checking starting matches between ${oneMinuteAgo.toISOString()} and ${now.toISOString()}`);

    // Find matches that started in the last minute
    const startingMatches = await this.matchRepository.find({
      where: {
        matchDate: Between(oneMinuteAgo, now),
      },
    });

    this.logger.log(`Found ${startingMatches.length} starting matches`);

    for (const match of startingMatches) {
      await this.notifyFavorites(match, '¡El partido ha comenzado!');
    }
  }

  private async notifyFavorites(match: Match, message: string) {
    const favorites = await this.favoriteRepository.find({
      where: { matchId: match.id },
      relations: ['user'],
    });

    this.logger.log(`Found ${favorites.length} favorites for match ${match.id}`);

    const userIdsToSend: string[] = [];

    for (const favorite of favorites) {
      // Create DB notification
      const notification = await this.create({
        userId: favorite.userId,
        title: 'Recordatorio de Partido',
        message: `${message} (Match ID: ${match.id})`,
      });
      this.logger.log(
        `Notification created: ${notification.id} for user ${favorite.userId}`,
      );
      
      if (favorite.userId) {
        userIdsToSend.push(String(favorite.userId));
      }
    }

    if (userIdsToSend.length > 0) {
      await this.sendOneSignalNotification(
        userIdsToSend,
        'Recordatorio de Partido',
        message,
      );
    }
  }

  private async sendOneSignalNotification(
    userIds: string[],
    title: string,
    message: string,
  ) {
    const appId =
      process.env.ONESIGNAL_APP_ID || 'a24bda3d-8ab0-4059-95cf-10a8c60bac9a';
    const apiKey = process.env.ONESIGNAL_API_KEY;

    if (!apiKey) {
      this.logger.warn(
        'OneSignal API Key not found. Skipping push notification.',
      );
      return;
    }

    try {
      const response = await fetch(
        'https://onesignal.com/api/v1/notifications',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${apiKey}`,
          },
          body: JSON.stringify({
            app_id: appId,
            include_aliases: { external_id: userIds },
            target_channel: 'push',
            headings: { en: title, es: title },
            contents: { en: message, es: message },
          }),
        },
      );

      const data = (await response.json()) as {
        id: string;
        recipients: number;
      };

      if (!response.ok) {
        this.logger.error(`OneSignal Error: ${JSON.stringify(data)}`);
      } else {
        this.logger.log(
          `OneSignal Notification sent. ID: ${data.id}, Recipients: ${data.recipients}`,
        );
      }
    } catch (error) {
      this.logger.error('Error sending OneSignal notification', error);
    }
  }

  async debugCron() {
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
    const oneHourLaterPlusOneMinute = new Date(oneHourLater.getTime() + 60 * 1000);
    
    const upcomingMatches = await this.matchRepository.find({
      where: {
        matchDate: Between(oneHourLater, oneHourLaterPlusOneMinute),
      },
    });

    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
    const startingMatches = await this.matchRepository.find({
      where: {
        matchDate: Between(oneMinuteAgo, now),
      },
    });

    return {
      serverTime: now.toISOString(),
      upcomingWindow: {
        start: oneHourLater.toISOString(),
        end: oneHourLaterPlusOneMinute.toISOString(),
        matchesFound: upcomingMatches.length,
        matches: upcomingMatches
      },
      startingWindow: {
        start: oneMinuteAgo.toISOString(),
        end: now.toISOString(),
        matchesFound: startingMatches.length,
        matches: startingMatches
      }
    };
  }

  async sendTestNotification(userId: number) {
    return await this.create({
      userId,
      title: 'Test Notification',
      message: 'Esta es una notificación de prueba para verificar el sistema.',
    });
  }
}
