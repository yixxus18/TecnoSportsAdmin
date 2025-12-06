/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { EntityManager } from 'typeorm';

export type IsExistsInterface = {
  tableName: string;
  column: string;
};

@ValidatorConstraint({ name: 'IsExistsConstraint', async: true })
@Injectable()
export class IsExistsConstraint implements ValidatorConstraintInterface {
  constructor(private readonly entityManager: EntityManager) {}

  async validate(value: any, args?: ValidationArguments): Promise<boolean> {
    const { tableName, column }: IsExistsInterface = args?.constraints[0];

    const dataExist = await this.entityManager
      .getRepository(tableName)
      .createQueryBuilder(tableName)
      .where({ [column]: value })
      .getExists();

    return dataExist;
  }

  defaultMessage?(validationArguments?: ValidationArguments): string {
    const field = validationArguments?.property;
    const value = validationArguments?.value;
    console.log(validationArguments);
    if (field && value) {
      return `${field} with ID ${value} doesn't exists!`;
    }
    return '';
  }
}

export function IsExists(
  options: IsExistsInterface,
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'IsExists',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [options],
      validator: IsExistsConstraint,
    });
  };
}
