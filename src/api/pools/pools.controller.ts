import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PoolsService } from './pools.service';
import { CreatePoolDto } from './dto/create-pool.dto';
import { UpdatePoolDto } from './dto/update-pool.dto';
import { JoinPoolDto } from './dto/join-pool.dto';
import { env } from 'env';

@Controller(`${env.api_prefix}pools`)
export class PoolsController {
  constructor(private readonly poolsService: PoolsService) {}

  @Post()
  async create(@Body() createPoolDto: CreatePoolDto) {
    return await this.poolsService.create(createPoolDto);
  }

  @Get()
  async findAll() {
    return await this.poolsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.poolsService.findOne(+id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updatePoolDto: UpdatePoolDto) {
    return await this.poolsService.update(+id, updatePoolDto);
  }

  @Get('user/:userId')
  async getUserPools(@Param('userId') userId: string) {
    return await this.poolsService.getUserPools(+userId);
  }

  @Get('user/:userId/joined')
  async getUserJoinedPools(@Param('userId') userId: string) {
    return await this.poolsService.getUserJoinedPools(+userId);
  }

  @Get('user/:userId/owned')
  async getUserOwnedPools(@Param('userId') userId: string) {
    return await this.poolsService.getUserOwnedPools(+userId);
  }

  @Post('join')
  async joinPool(@Body() joinPoolDto: JoinPoolDto) {
    return await this.poolsService.joinPool(joinPoolDto);
  }

  @Get(':poolId/participants/:userId')
  async getPoolParticipants(
    @Param('poolId') poolId: string,
    @Param('userId') userId: string,
  ) {
    return await this.poolsService.getPoolParticipants(+poolId, +userId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.poolsService.remove(+id);
  }
}
