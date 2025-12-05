import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { Match } from './entities/match.entity';
import { Team } from '../teams/entities/team.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { found, notFound, saved, updated } from 'src/Utils/Responses';
import { NotificationsService } from 'src/notification-subscription/notification-subscription.service';

const table = 'Match';

@Injectable()
export class MatchesService {
  private readonly logger = new Logger(MatchesService.name);

  constructor(
    @InjectRepository(Match) private readonly repo: Repository<Match>,
    @InjectRepository(Team) private readonly teamRepo: Repository<Team>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(createMatchDto: CreateMatchDto) {
    // Validar que los equipos existen
    const homeTeam = await this.teamRepo.findOne({
      where: { id: createMatchDto.homeTeamId },
    });
    if (!homeTeam) {
      throw new BadRequestException(
        `Home team with id ${createMatchDto.homeTeamId} does not exist`,
      );
    }

    const awayTeam = await this.teamRepo.findOne({
      where: { id: createMatchDto.awayTeamId },
    });
    if (!awayTeam) {
      throw new BadRequestException(
        `Away team with id ${createMatchDto.awayTeamId} does not exist`,
      );
    }

    // Asignar valores por defecto si no se proporcionan
    const matchData = {
      ...createMatchDto,
      scoreHome:
        createMatchDto.scoreHome !== undefined ? createMatchDto.scoreHome : 0,
      scoreAway:
        createMatchDto.scoreAway !== undefined ? createMatchDto.scoreAway : 0,
      status: createMatchDto.status || 'pending',
    };

    const notificationPayload = {
      title: '⚽ ¡NUEVO ENCUENTRO!',
      body: `¡Se ha programado el partido ${homeTeam.name} vs ${awayTeam.name}!`,
    };
    this.notificationsService
      .sendBroadcastNotification(notificationPayload)
      .catch((error) =>
        this.logger.error(
          'Error al iniciar broadcast de notificaciones:',
          error,
        ),
      );
    return saved(table, await this.repo.save(matchData));
  }

  async findAll() {
    return found(`${table}s`, await this.repo.find());
  }

  async findOne(id: number) {
    const match = await this.repo.findOne({ where: { id } });
    if (!match) {
      throw new NotFoundException(notFound(table, id));
    }
    return found(table, match);
  }

  async update(id: number, updateMatchDto: UpdateMatchDto) {
    const match = await this.repo.findOne({ where: { id } });

    if (!match) {
      throw new NotFoundException(notFound(table, id));
    }

    Object.assign(match, updateMatchDto);

    return updated(table, await this.repo.save(match));

    // Actualizar leaderboards después de actualizar resultado del partido
    // await this.updateLeaderboardsAfterMatchUpdate(match.id);
  }

  async remove(id: number) {
    const match = await this.repo.findOne({ where: { id } });

    if (!match) {
      throw new NotFoundException(notFound(table, id));
    }

    await this.repo.remove(match);
    return { message: `${table} with id ${id} has been removed` };
  }
}
