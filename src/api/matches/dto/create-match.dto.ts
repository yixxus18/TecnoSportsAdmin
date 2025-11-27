import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateMatchDto {
  @IsNotEmpty()
  @IsNumber()
  weekNumber: number;

  @IsNotEmpty()
  @IsDateString()
  matchDate: string;

  @IsNotEmpty()
  @IsNumber()
  homeTeamId: number;

  @IsNotEmpty()
  @IsNumber()
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
