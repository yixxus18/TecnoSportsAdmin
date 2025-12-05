import { Module } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';
import { Match } from './entities/match.entity';
import { Team } from '../teams/entities/team.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationSubscriptionModule } from 'src/notification-subscription/notification-subscription.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Match, Team]),
    NotificationSubscriptionModule,
  ],
  controllers: [MatchesController],
  providers: [MatchesService],
  exports: [MatchesService],
})
export class MatchesModule {}
