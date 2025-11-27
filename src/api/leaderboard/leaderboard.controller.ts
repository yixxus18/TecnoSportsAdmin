import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
} from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { env } from 'env';

@Controller(`${env.api_prefix}leaderboard`)
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Post()
  async create(@Body() createLeaderboardDto: any) {
    return await this.leaderboardService.create(createLeaderboardDto);
  }

  @Post('update-all')
  async updateAllLeaderboards() {
    await this.leaderboardService.calculateAllLeaderboards();
    return { message: 'All leaderboards updated successfully.' };
  }

  @Get()
  async findAll() {
    await this.leaderboardService.calculateAllLeaderboards();
    return await this.leaderboardService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const leaderboard = await this.leaderboardService.findOne(id);
    if (!leaderboard) {
      throw new NotFoundException(`Leaderboard with id ${id} not found`);
    }
    // Recalculate before returning
    await this.leaderboardService.calculatePoolLeaderboard(leaderboard.poolId);
    return await this.leaderboardService.findOne(id);
  }

  @Get('pool/:poolId')
  async findByPool(@Param('poolId') poolId: string) {
    await this.leaderboardService.calculatePoolLeaderboard(+poolId);
    return await this.leaderboardService.findByPool(+poolId);
  }

  @Get('pool/:poolId/calculate')
  async calculatePoolLeaderboard(@Param('poolId') poolId: string) {
    return await this.leaderboardService.calculatePoolLeaderboard(+poolId);
  }

  @Get('pool/:poolId/ranking')
  async getPoolLeaderboard(@Param('poolId') poolId: string): Promise<any> {
    return await this.leaderboardService.getPoolLeaderboard(+poolId);
  }

  @Post('update/prediction/:predictionId')
  async updateLeaderboardAfterPrediction(
    @Param('predictionId') predictionId: string,
  ) {
    return await this.leaderboardService.updateLeaderboardAfterPrediction(
      +predictionId,
    );
  }

  @Post('update/match/:matchId')
  async updateLeaderboardAfterMatchResult(@Param('matchId') matchId: string) {
    return await this.leaderboardService.updateLeaderboardAfterMatchResult(
      +matchId,
    );
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateLeaderboardDto: any) {
    return await this.leaderboardService.update(id, updateLeaderboardDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.leaderboardService.remove(id);
  }
}
