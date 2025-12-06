import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ConfederationsService } from './confederations.service';
import { CreateConfederationDto } from './dto/create-confederation.dto';
import { UpdateConfederationDto } from './dto/update-confederation.dto';
import { env } from 'env';
import { SupabaseAuthGuard } from 'src/supabase-auth/supabase-auth.guard';

@Controller(`${env.api_prefix}confederations`)
@UseGuards(SupabaseAuthGuard)
export class ConfederationsController {
  constructor(private readonly confederationsService: ConfederationsService) {}

  @Post()
  async create(@Body() createConfederationDto: CreateConfederationDto) {
    return await this.confederationsService.create(createConfederationDto);
  }

  @Get()
  async findAll() {
    return await this.confederationsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.confederationsService.findOne(+id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateConfederationDto: UpdateConfederationDto,
  ) {
    return await this.confederationsService.update(+id, updateConfederationDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.confederationsService.remove(+id);
  }
}
