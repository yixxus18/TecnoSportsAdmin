import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { found, notFound, saved, updated } from 'src/Utils/Responses';

const table = 'User';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  async create(createUserDto: CreateUserDto) {
    const userData = {
      ...createUserDto,
      roleId: 3, // Default to normal user
      isActive: true, // Default to active
    };
    const user = this.repo.create(userData);
    // Here you might want to hash the password before saving
    // For now, saving it as is.
    return saved(table, await this.repo.save(user));
  }

  async findAll() {
    return found(`${table}s`, await this.repo.find());
  }

  async findOne(id: number) {
    return found(table, await this.repo.findOneOrFail({ where: { id } }));
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(notFound(table, id));
    }
    Object.assign(user, updateUserDto);

    return updated(table, await this.repo.save(user));
  }

  async remove(id: number) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(notFound(table, id));
    }
    await this.repo.remove(user);
    return { message: `${table} with id ${id} has been removed` };
  }

  async toggleAdmin(id: number) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(notFound(table, id));
    }

    // Assuming roleId 2 is Admin and 3 is User
    user.roleId = user.roleId === 2 ? 3 : 2;

    return updated(table, await this.repo.save(user));
  }
}
