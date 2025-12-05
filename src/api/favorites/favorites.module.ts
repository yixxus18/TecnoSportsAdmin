import { Module } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { FavoritesController } from './favorites.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Favorite } from './entities/favorite.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    // 👈 1. Usa forFeature para registrar la entidad y su repositorio
    TypeOrmModule.forFeature([Favorite]),
    UsersModule,
  ],
  controllers: [FavoritesController],
  providers: [FavoritesService],
})
export class FavoritesModule {}
