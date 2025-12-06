import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsInt,
} from 'class-validator';
import { IsExists } from 'src/validations/exists.constraint';

export class CreateMatchDto {
  @IsNotEmpty()
  @IsNumber()
  weekNumber: number;

  @IsNotEmpty()
  @IsDateString()
  matchDate: Date;

  @IsNotEmpty()
  @IsInt()
  @IsExists({ tableName: 'teams', column: 'id' })
  homeTeamId: number;

  @IsNotEmpty()
  @IsInt()
  @IsExists({ tableName: 'teams', column: 'id' })
  awayTeamId: number;

  @IsOptional()
  @IsNumber()
  scoreHome?: number;

  @IsOptional()
  @IsNumber()
  scoreAway?: number;

  @IsOptional()
  @IsString()
  status?: string;
}
