import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Leaderboard, LeaderboardDocument } from './schemas/leaderboard.schema';
import { Pool } from '../pools/entities/pool.entity';
import { Prediction } from '../predictions/entities/prediction.entity';
import { User } from '../users/entities/user.entity';
import { Match } from '../matches/entities/match.entity';

@Injectable()
export class LeaderboardService {
  constructor(
    @InjectModel(Leaderboard.name)
    private leaderboardModel: Model<LeaderboardDocument>,
    @InjectRepository(Pool) private poolRepo: Repository<Pool>,
    @InjectRepository(Prediction)
    private predictionRepo: Repository<Prediction>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Match) private matchRepo: Repository<Match>,
  ) {}

  async create(createLeaderboardDto: any) {
    const createdLeaderboard = new this.leaderboardModel(createLeaderboardDto);
    return createdLeaderboard.save();
  }

  async findAll() {
    return this.leaderboardModel.find().exec();
  }

  async findOne(id: string) {
    return this.leaderboardModel.findById(id).exec();
  }

  async findByPool(poolId: number) {
    return this.leaderboardModel.findOne({ poolId }).exec();
  }

  async update(id: string, updateLeaderboardDto: any) {
    return this.leaderboardModel
      .findByIdAndUpdate(id, updateLeaderboardDto, { new: true })
      .exec();
  }

  async remove(id: string) {
    return this.leaderboardModel.findByIdAndDelete(id).exec();
  }

  async calculateAllLeaderboards() {
    const allPools = await this.poolRepo.find();
    for (const pool of allPools) {
      await this.calculatePoolLeaderboard(pool.id);
    }
  }

  async calculatePoolLeaderboard(poolId: number) {
    // Verificar que la pool existe
    const pool = await this.poolRepo.findOne({
      where: { id: poolId },
      relations: ['participants'],
    });

    if (!pool) {
      throw new NotFoundException(`Pool with id ${poolId} not found`);
    }

    // Obtener todas las predicciones de la pool con relaciones
    const predictions = await this.predictionRepo.find({
      where: { pool: { id: poolId } },
      relations: ['user', 'match'],
    });

    // Calcular puntos por usuario
    const userPoints = new Map<
      number,
      { user: User; points: number; predictions: number }
    >();

    // Inicializar todos los participantes con 0 puntos
    pool.participants.forEach((participant) => {
      userPoints.set(participant.id, {
        user: participant,
        points: 0,
        predictions: 0,
      });
    });

    // Calcular puntos basados en predicciones correctas
    for (const prediction of predictions) {
      const userData = userPoints.get(prediction.user.id);
      if (userData) {
        userData.predictions += 1;

        // Solo calcular puntos si el partido ya terminó
        if (prediction.match.status === 'finished') {
          // Determinar el resultado real del partido
          const actualResult =
            prediction.match.scoreHome > prediction.match.scoreAway
              ? 'home'
              : prediction.match.scoreHome < prediction.match.scoreAway
                ? 'away'
                : 'draw';

          // Lógica de puntos: 3 puntos por acierto exacto, 1 por resultado correcto
          if (prediction.prediction === actualResult) {
            userData.points += 3; // Acierto exacto
          } else if (
            (prediction.prediction === 'home' &&
              prediction.match.scoreHome > prediction.match.scoreAway) ||
            (prediction.prediction === 'away' &&
              prediction.match.scoreHome < prediction.match.scoreAway) ||
            (prediction.prediction === 'draw' &&
              prediction.match.scoreHome === prediction.match.scoreAway)
          ) {
            userData.points += 1; // Resultado correcto
          }
        }
      }
    }

    // Convertir a array y ordenar por puntos (descendente)
    const positions = Array.from(userPoints.values())
      .map((userData, index) => ({
        userId: userData.user.id,
        username: userData.user.name,
        email: userData.user.email,
        points: userData.points,
        predictions: userData.predictions,
        position: 0, // Se calculará después del sort
      }))
      .sort((a, b) => b.points - a.points || b.predictions - a.predictions);

    // Asignar posiciones
    positions.forEach((pos, index) => {
      pos.position = index + 1;
    });

    // Actualizar o crear leaderboard en MongoDB
    const leaderboardData = {
      poolId,
      positions,
      updated_at: new Date(),
    };

    const existingLeaderboard = await this.leaderboardModel
      .findOne({ poolId })
      .exec();

    if (existingLeaderboard) {
      await this.leaderboardModel
        .findByIdAndUpdate(existingLeaderboard._id, leaderboardData, {
          new: true,
        })
        .exec();
      return this.leaderboardModel.findById(existingLeaderboard._id).exec();
    } else {
      const newLeaderboard = new this.leaderboardModel({
        ...leaderboardData,
        created_at: new Date(),
      });
      return newLeaderboard.save();
    }
  }

  async getPoolLeaderboard(poolId: number) {
    // Calcular leaderboard actualizado
    await this.calculatePoolLeaderboard(poolId);

    // Obtener el leaderboard calculado
    const leaderboard = await this.leaderboardModel.findOne({ poolId }).exec();

    if (!leaderboard) {
      throw new NotFoundException(`Leaderboard for pool ${poolId} not found`);
    }

    // Obtener información de la pool
    const pool = await this.poolRepo.findOne({
      where: { id: poolId },
      relations: ['creator'],
    });

    if (!pool) {
      throw new NotFoundException(`Pool with id ${poolId} not found`);
    }

    return {
      pool: {
        id: pool.id,
        name: pool.name,
        description: pool.description,
        creator: {
          id: pool.creator.id,
          name: pool.creator.name,
        },
        totalParticipants: leaderboard.positions.length,
      },
      leaderboard: {
        lastUpdated: leaderboard.updated_at,
        positions: leaderboard.positions,
      },
    } as any;
  }

  async updateLeaderboardAfterPrediction(predictionId: number) {
    // Obtener la predicción con relaciones
    const prediction = await this.predictionRepo.findOne({
      where: { id: predictionId },
      relations: ['pool'],
    });

    if (prediction && prediction.pool) {
      // Recalcular leaderboard de la pool
      await this.calculatePoolLeaderboard(prediction.pool.id);
    }
  }

  async updateLeaderboardAfterMatchResult(matchId: number) {
    // Obtener todas las predicciones del partido
    const predictions = await this.predictionRepo.find({
      where: { match: { id: matchId } },
      relations: ['pool'],
    });

    // Obtener pools únicas
    const poolIds = [
      ...new Set(predictions.map((p) => p.pool?.id).filter((id) => id)),
    ];

    // Recalcular leaderboard para cada pool
    for (const poolId of poolIds) {
      await this.calculatePoolLeaderboard(poolId);
    }
  }
}
