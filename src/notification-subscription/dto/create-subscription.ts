// src/notifications/dto/create-subscription.dto.ts

import {
  IsNotEmpty,
  IsString,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

// 1. DTO para las llaves internas de la suscripción
class KeysDto {
  @IsNotEmpty()
  @IsString()
  p256dh: string; // Llave pública del navegador

  @IsNotEmpty()
  @IsString()
  auth: string; // Token de autenticación
}

// 2. DTO principal para la suscripción
export class CreateSubscriptionDto {
  @IsNotEmpty()
  @IsString()
  endpoint: string; // URL del servidor Push Service (Google, Mozilla, etc.)

  @IsNotEmpty()
  @IsObject()
  @ValidateNested() // Le dice a class-validator que revise la clase KeysDto
  @Type(() => KeysDto) // Indica qué clase debe usar para la validación
  keys: KeysDto;

  // Opcional: Si manejas la autenticación en el frontend, podrías incluir el userId
  // @IsOptional()
  // @IsNumber()
  // userId?: number;
}
