import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreatePredictionDto } from './dto/create-prediction.dto';
import { UpdatePredictionDto } from './dto/update-prediction.dto';
import { Prediction } from './entities/prediction.entity';
import { User } from '../users/entities/user.entity';
import { Pool } from '../pools/entities/pool.entity';
import { Match } from '../matches/entities/match.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { found, notFound, saved, updated } from 'src/Utils/Responses';

const table = 'Prediction';

@Injectable()
export class PredictionsService {
  constructor(
    @InjectRepository(Prediction) private readonly repo: Repository<Prediction>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Pool) private readonly poolRepo: Repository<Pool>,
    @InjectRepository(Match) private readonly matchRepo: Repository<Match>,
  ) {}

  async create(createPredictionDto: CreatePredictionDto) {
    const { userId, matchId, poolId, prediction } = createPredictionDto;

    // 1. Verificar que el usuario existe
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException(`User with id ${userId} does not exist`);
    }

    // 2. Verificar que el partido existe
    const match = await this.matchRepo.findOne({ where: { id: matchId } });
    if (!match) {
      throw new BadRequestException(`Match with id ${matchId} does not exist`);
    }

    // 3. Verificar que la pool existe
    const pool = await this.poolRepo.findOne({
      where: { id: poolId },
      relations: ['participants'],
    });
    if (!pool) {
      throw new BadRequestException(`Pool with id ${poolId} does not exist`);
    }

    // 4. Verificar que el usuario es participante de la pool O es el creador
    const isParticipant = pool.participants.some(
      (participant) => participant.id === userId,
    );
    const isCreator = pool.creatorId === userId;
    
    if (!isParticipant && !isCreator) {
      throw new BadRequestException(
        `User with id ${userId} is not a participant or creator in pool ${poolId}`,
      );
    }

    // 5. Verificar que no existe una predicción previa para este usuario/partido/pool
    const existingPrediction = await this.repo.findOne({
      where: {
        user: { id: userId },
        match: { id: matchId },
        pool: { id: poolId },
      },
    });
    if (existingPrediction) {
      throw new BadRequestException(
        `User has already made a prediction for this match in this pool`,
      );
    }

    // 6. Verificar que el partido no ha empezado (opcional - dependiendo de las reglas)
    const now = new Date();
    if (match.matchDate <= now && match.status !== 'pending') {
      throw new BadRequestException(
        `Cannot make prediction for a match that has already started or finished`,
      );
    }

    // Crear la predicción
    const newPrediction = this.repo.create({
      prediction,
      points: 0, // Inicialmente 0 puntos
      user,
      match,
      pool,
    });

    console.log('🔍 DEBUG: Creating prediction:', {
      userId,
      matchId,
      poolId,
      prediction,
    });

    return saved(table, await this.repo.save(newPrediction));

    // Actualizar leaderboard después de crear predicción
    // await this.updateLeaderboardAfterPrediction(newPrediction.id);
  }

  async findAll() {
    return found(
      `${table}s`,
      await this.repo.find({ relations: ['user', 'pool', 'match'] }),
    );
  }

  async findOne(id: number) {
    const prediction = await this.repo.findOne({
      where: { id },
      relations: ['user', 'pool', 'match'],
    });
    if (!prediction) {
      throw new NotFoundException(notFound(table, id));
    }
    return found(table, prediction);
  }

  async update(id: number, updatePredictionDto: UpdatePredictionDto) {
    const prediction = await this.repo.findOne({ where: { id } });

    if (!prediction) {
      throw new NotFoundException(notFound(table, id));
    }

    Object.assign(prediction, updatePredictionDto);

    return updated(table, await this.repo.save(prediction));
  }

  async remove(id: number) {
    const prediction = await this.repo.findOne({ where: { id } });

    if (!prediction) {
      throw new NotFoundException(notFound(table, id));
    }

    await this.repo.remove(prediction);
    return { message: `${table} with id ${id} has been removed` };
  }

  async getUserPredictions(userId: number) {
    // Verificar que el usuario existe
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    // Obtener las predicciones del usuario con relaciones
    const predictions = await this.repo.find({
      where: { user: { id: userId } },
      relations: ['user', 'match', 'pool'],
      order: { created_at: 'DESC' },
    });

    return found(`Predictions for user ${user.name}`, {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      predictions: predictions.map((prediction) => ({
        id: prediction.id,
        prediction: prediction.prediction,
        points: prediction.points,
        created_at: prediction.created_at,
        updated_at: prediction.updated_at,
        match: {
          id: prediction.match.id,
          weekNumber: prediction.match.weekNumber,
          matchDate: prediction.match.matchDate,
          status: prediction.match.status,
          homeTeam: prediction.match.homeTeam
            ? {
                id: prediction.match.homeTeam.id,
                name: prediction.match.homeTeam.name,
              }
            : null,
          awayTeam: prediction.match.awayTeam
            ? {
                id: prediction.match.awayTeam.id,
                name: prediction.match.awayTeam.name,
              }
            : null,
          scoreHome: prediction.match.scoreHome,
          scoreAway: prediction.match.scoreAway,
        },
        pool: {
          id: prediction.pool.id,
          name: prediction.pool.name,
          invitationCode: prediction.pool.invitationCode,
        },
      })),
      totalPredictions: predictions.length,
      totalPoints: predictions.reduce((sum, pred) => sum + pred.points, 0),
    });
  }

  async getPoolPredictions(poolId: number) {
    // Verificar que la pool existe
    const pool = await this.poolRepo.findOne({ where: { id: poolId } });
    if (!pool) {
      throw new NotFoundException(`Pool with id ${poolId} not found`);
    }

    // Obtener todas las predicciones de la pool
    const predictions = await this.repo.find({
      where: { pool: { id: poolId } },
      relations: ['user', 'match'],
      order: {
        created_at: 'ASC',
      },
    });

    return found(`Predictions for pool ${pool.name}`, {
      pool: {
        id: pool.id,
        name: pool.name,
        invitationCode: pool.invitationCode,
      },
      predictions: predictions.map((prediction) => ({
        id: prediction.id,
        prediction: prediction.prediction,
        points: prediction.points,
        created_at: prediction.created_at,
        user: {
          id: prediction.user.id,
          name: prediction.user.name,
          email: prediction.user.email,
        },
        match: {
          id: prediction.match.id,
          weekNumber: prediction.match.weekNumber,
          matchDate: prediction.match.matchDate,
          status: prediction.match.status,
          homeTeam: prediction.match.homeTeam
            ? {
                id: prediction.match.homeTeam.id,
                name: prediction.match.homeTeam.name,
              }
            : null,
          awayTeam: prediction.match.awayTeam
            ? {
                id: prediction.match.awayTeam.id,
                name: prediction.match.awayTeam.name,
              }
            : null,
          scoreHome: prediction.match.scoreHome,
          scoreAway: prediction.match.scoreAway,
        },
      })),
      totalPredictions: predictions.length,
    });
  }

  async getMatchPredictions(matchId: number) {
    // Verificar que el partido existe
    const match = await this.matchRepo.findOne({
      where: { id: matchId },
      relations: ['homeTeam', 'awayTeam'],
    });
    if (!match) {
      throw new NotFoundException(`Match with id ${matchId} not found`);
    }

    // Obtener todas las predicciones del partido
    const predictions = await this.repo.find({
      where: { match: { id: matchId } },
      relations: ['user', 'pool'],
      order: { created_at: 'ASC' },
    });

    return found(`Predictions for match ${matchId}`, {
      match: {
        id: match.id,
        weekNumber: match.weekNumber,
        matchDate: match.matchDate,
        status: match.status,
        homeTeam: match.homeTeam
          ? {
              id: match.homeTeam.id,
              name: match.homeTeam.name,
            }
          : null,
        awayTeam: match.awayTeam
          ? {
              id: match.awayTeam.id,
              name: match.awayTeam.name,
            }
          : null,
        scoreHome: match.scoreHome,
        scoreAway: match.scoreAway,
      },
      predictions: predictions.map((prediction) => ({
        id: prediction.id,
        prediction: prediction.prediction,
        points: prediction.points,
        created_at: prediction.created_at,
        user: {
          id: prediction.user.id,
          name: prediction.user.name,
          email: prediction.user.email,
        },
        pool: {
          id: prediction.pool.id,
          name: prediction.pool.name,
          invitationCode: prediction.pool.invitationCode,
        },
      })),
      totalPredictions: predictions.length,
      predictionStats: {
        home: predictions.filter((p) => p.prediction === 'home').length,
        draw: predictions.filter((p) => p.prediction === 'draw').length,
        away: predictions.filter((p) => p.prediction === 'away').length,
      },
    });
  }
}
