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

    // Find matches starting between 1 hour and 1 hour + 1 minute from now
    const upcomingMatches = await this.matchRepository.find({
      where: {
        matchDate: Between(oneHourLater, oneHourLaterPlusOneMinute),
      },
    });

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

    // Find matches that started in the last minute
    const startingMatches = await this.matchRepository.find({
      where: {
        matchDate: Between(oneMinuteAgo, now),
      },
    });

    for (const match of startingMatches) {
      await this.notifyFavorites(match, '¡El partido ha comenzado!');
    }
  }

  private async notifyFavorites(match: Match, message: string) {
    const favorites = await this.favoriteRepository.find({
      where: { matchId: match.id },
      relations: ['user'],
    });

    for (const favorite of favorites) {
      // Avoid duplicate notifications if possible (optional logic could be added here)
      await this.create({
        userId: favorite.userId,
        title: 'Recordatorio de Partido',
        message: `${message} (Match ID: ${match.id})`,
      });
      this.logger.log(
        `Notification sent to user ${favorite.userId} for match ${match.id}`,
      );
    }
  }
}
