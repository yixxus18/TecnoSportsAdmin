import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateConfederationDto } from './dto/create-confederation.dto';
import { UpdateConfederationDto } from './dto/update-confederation.dto';
import { Confederation } from './entities/confederation.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { found, notFound, saved, updated } from 'src/Utils/Responses';

const table = 'Confederation';

@Injectable()
export class ConfederationsService {
  constructor(
    @InjectRepository(Confederation)
    private readonly repo: Repository<Confederation>,
  ) {}

  async create(createConfederationDto: CreateConfederationDto) {
    return saved(table, await this.repo.save(createConfederationDto));
  }

  async findAll() {
    return found(`${table}s`, await this.repo.find());
  }

  async findOne(id: number) {
    const confederation = await this.repo.findOne({ where: { id } });
    if (!confederation) {
      throw new NotFoundException(notFound(table, id));
    }
    return found(table, confederation);
  }

  async update(id: number, updateConfederationDto: UpdateConfederationDto) {
    const confederation = await this.repo.findOne({ where: { id } });

    if (!confederation) {
      throw new NotFoundException(notFound(table, id));
    }

    Object.assign(confederation, updateConfederationDto);

    return updated(table, await this.repo.save(confederation));
  }

  async remove(id: number) {
    const confederation = await this.repo.findOne({ where: { id } });

    if (!confederation) {
      throw new NotFoundException(notFound(table, id));
    }

    await this.repo.remove(confederation);
    return { message: `${table} with id ${id} has been removed` };
  }
}
