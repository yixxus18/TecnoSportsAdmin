import { PartialType } from '@nestjs/mapped-types';
import { CreateTeamDto } from './create-team.dto';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { IsExists } from 'src/validations/exists.constraint';

export class UpdateTeamDto extends PartialType(CreateTeamDto) {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  logoUrl: string;

  @IsOptional()
  @IsExists({ tableName: 'confederations', column: 'id' })
  confederationId: number;
}
