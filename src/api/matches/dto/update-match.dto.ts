import { PartialType } from '@nestjs/mapped-types';
import { CreateMatchDto } from './create-match.dto';
import {
  IsDate,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { IsExists } from 'src/validations/exists.constraint';

export class UpdateMatchDto extends PartialType(CreateMatchDto) {
  @IsOptional()
  @IsString()
  status: string;

  @IsOptional()
  @IsInt()
  scoreHome: number;

  @IsOptional()
  @IsInt()
  scoreAway: number;

  @IsNotEmpty()
  @IsDate()
  matchDate: Date;

  @IsNotEmpty()
  @IsInt()
  weekNumber: number;

  @IsNotEmpty()
  @IsInt()
  @IsExists({ tableName: 'teams', column: 'id' })
  homeTeamId: number;

  @IsNotEmpty()
  @IsInt()
  @IsExists({ tableName: 'teams', column: 'id' })
  awayTeamId: number;
}
