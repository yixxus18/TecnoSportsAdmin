import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { User } from './api/users/entities/user.entity';
import { UsersModule } from './api/users/users.module';
import { TeamsModule } from './api/teams/teams.module';
import { PoolsModule } from './api/pools/pools.module';
import { MatchesModule } from './api/matches/matches.module';
import { PredictionsModule } from './api/predictions/predictions.module';
import { ConfederationsModule } from './api/confederations/confederations.module';
import { FavoritesModule } from './api/favorites/favorites.module';
import { NotificationsModule } from './api/notifications/notifications.module';
import { NotificationSubscriptionModule } from './notification-subscription/notification-subscription.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    UsersModule,
    TeamsModule,
    PoolsModule,
    MatchesModule,
    PredictionsModule,
    ConfederationsModule,
    FavoritesModule,
    NotificationsModule,
    NotificationSubscriptionModule,
  ],
  controllers: [AdminController],
  providers: [],
})
export class AdminModule {}
