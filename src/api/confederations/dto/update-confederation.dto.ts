import { PartialType } from '@nestjs/mapped-types';
import { CreateConfederationDto } from './create-confederation.dto';

export class UpdateConfederationDto extends PartialType(
  CreateConfederationDto,
) {}
