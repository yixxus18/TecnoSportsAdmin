import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PredictionsService } from './predictions.service';
import { CreatePredictionDto } from './dto/create-prediction.dto';
import { UpdatePredictionDto } from './dto/update-prediction.dto';
import { env } from 'env';

@Controller(`${env.api_prefix}predictions`)
export class PredictionsController {
  constructor(private readonly predictionsService: PredictionsService) {}

  @Post()
  async create(@Body() createPredictionDto: CreatePredictionDto) {
    return await this.predictionsService.create(createPredictionDto);
  }

  @Get()
  async findAll() {
    return await this.predictionsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.predictionsService.findOne(+id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePredictionDto: UpdatePredictionDto,
  ) {
    return await this.predictionsService.update(+id, updatePredictionDto);
  }

  @Get('user/:userId')
  async getUserPredictions(@Param('userId') userId: string) {
    return await this.predictionsService.getUserPredictions(+userId);
  }

  @Get('pool/:poolId')
  async getPoolPredictions(@Param('poolId') poolId: string) {
    return await this.predictionsService.getPoolPredictions(+poolId);
  }

  @Get('match/:matchId')
  async getMatchPredictions(@Param('matchId') matchId: string) {
    return await this.predictionsService.getMatchPredictions(+matchId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.predictionsService.remove(+id);
  }
}
