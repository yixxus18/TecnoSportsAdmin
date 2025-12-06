import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { Team } from './entities/team.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { deleted, found, notFound, saved, updated } from 'src/Utils/Responses';

const table = 'Team';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team) private readonly repo: Repository<Team>,
  ) {}

  async create(createTeamDto: CreateTeamDto) {
    // Asignar valores por defecto si no se proporcionan
    const teamData = {
      ...createTeamDto,
      logoUrl: createTeamDto.logoUrl || undefined,
      isActive:
        createTeamDto.isActive !== undefined ? createTeamDto.isActive : true,
    };
    return saved(table, await this.repo.save(teamData));
  }

  async findAll() {
    return found(
      `${table}s`,
      await this.repo.find({
        relations: {
          confederation: true,
        },
      }),
    );
  }

  async findOne(id: number) {
    const team = await this.repo.findOne({
      where: { id },
      relations: {
        confederation: true,
      },
    });
    if (!team) {
      throw new NotFoundException(notFound(table, id));
    }
    return found(table, team);
  }

  async update(id: number, updateTeamDto: UpdateTeamDto) {
    const team = await this.repo.findOne({
      where: { id },
      relations: {
        confederation: true,
      },
    });
    if (!team) {
      throw new NotFoundException(notFound(table, id));
    }

    Object.assign(team, updateTeamDto);

    return updated(table, await this.repo.save(team));
  }

  async remove(id: number) {
    const team = await this.repo.findOne({
      where: { id },
      relations: {
        confederation: true,
      },
    });
    if (!team) {
      throw new NotFoundException(notFound(table, id));
    }
    const status = (team.isActive = !team.isActive);
    return deleted(table, await this.repo.save(team), status);
  }
}
