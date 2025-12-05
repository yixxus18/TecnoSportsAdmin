import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './api/users/users.module';
import { RolesModule } from './api/roles/roles.module';
import { ConfederationsModule } from './api/confederations/confederations.module';
import { TeamsModule } from './api/teams/teams.module';
import { MatchesModule } from './api/matches/matches.module';
import { PoolsModule } from './api/pools/pools.module';
import { PredictionsModule } from './api/predictions/predictions.module';
import { LeaderboardModule } from './api/leaderboard/leaderboard.module';
import { MongooseModule } from '@nestjs/mongoose';
import { SupabaseModule } from './supabase/supabase.module';
import supabaseConfig from './config/supabase.config';
import { validationSchema } from './config/env.validation';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin.module';
import { HomeModule } from './home.module';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificationSubscriptionModule } from './notification-subscription/notification-subscription.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [supabaseConfig],
      isGlobal: true,
      validationSchema,
    }),
    MongooseModule.forRoot(process.env.MONGO_URL ? process.env.MONGO_URL : ''),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: true, // 🔒 Desactivado - No crear tablas automáticamente
      dropSchema: false, // 🔒 Desactivado - No eliminar tablas
      logging: false, // 🔕 Sin logs detallados
      extra: {
        ssl: {
          rejectUnauthorized: false,
        },
      },
    }),
    NotificationSubscriptionModule,
    UsersModule,
    RolesModule,
    ConfederationsModule,
    TeamsModule,
    MatchesModule,
    PoolsModule,
    PredictionsModule,
    LeaderboardModule,
    SupabaseModule,
    AuthModule,
    AdminModule,
    AdminModule,
    HomeModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
