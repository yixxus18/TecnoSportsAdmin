import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { MatchesService } from './matches.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { env } from 'env';

@Controller(`${env.api_prefix}matches`)
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Post()
  async create(@Body() createMatchDto: CreateMatchDto) {
    return await this.matchesService.create(createMatchDto);
  }

  @Get()
  async findAll() {
    return await this.matchesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.matchesService.findOne(+id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateMatchDto: UpdateMatchDto,
  ) {
    return await this.matchesService.update(+id, updateMatchDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.matchesService.remove(+id);
  }
}
