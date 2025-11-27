import { IsIn, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreatePredictionDto {
  @IsNotEmpty()
  @IsIn(['home', 'draw', 'away'], {
    message: 'Prediction must be one of: home, draw, away',
  })
  prediction: 'home' | 'draw' | 'away';

  @IsOptional()
  @IsNumber()
  points?: number;

  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @IsNotEmpty()
  @IsNumber()
  matchId: number;

  @IsNotEmpty()
  @IsNumber()
  poolId: number;
}
