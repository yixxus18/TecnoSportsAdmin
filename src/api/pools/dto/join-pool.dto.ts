import { IsNotEmpty, IsNumber } from 'class-validator';

export class JoinPoolDto {
  @IsNotEmpty()
  @IsNumber()
  invitationCode: number;

  @IsNotEmpty()
  @IsNumber()
  userId: number;
}
