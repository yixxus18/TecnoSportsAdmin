import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { IsUnique } from 'src/validations/unique.constraint';

export class CreateUserDto {
  @IsEmail()
  @Matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
    message: 'Invalid email format',
  })
  @IsNotEmpty()
  @IsUnique({ tableName: 'users', column: 'email' })
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+]).{8,}$/, {
    message:
      'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character',
  })
  password: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^[a-zA-Z]+(?: [a-zA-Z]+)+$/, {
    message: "Isn't a valid Name",
  })
  name: string;
}
