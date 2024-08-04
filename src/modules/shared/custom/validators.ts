import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

export function IsNumberOrStringifiedNumber(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsNumberOrStringifiedNumber',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value === 'number') return true
          else if (typeof value === 'string') return !isNaN(Number(value))
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a number or a string`;
        }
      }
    });
  };
}

export function IsBooleanOrStringifiedBoolean(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsBooleanOrStringifiedBoolean',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value === 'boolean') return true
          else if (typeof value === 'string') return value === 'true' || value === 'false';
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a boolean value`;
        }
      }
    });
  };
}

type dataTypes = "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function";
interface IArrayValidationOptions {
  allowEmptyArray?: boolean;
  typeOfArrayItems?: dataTypes[];
}

export function IsArrayOrStringifiedArray(
  arrayValidationOptions: IArrayValidationOptions = {
    allowEmptyArray: true
  },
  validationOptions?: ValidationOptions
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsArrayOrStringifiedArray',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {

          if (typeof value === 'string') value = JSON.parse(String(value).includes("'") ? String(value).replace(/'/g, '"') : value)
          if (!Array.isArray(value)) return false;

          if (!arrayValidationOptions?.allowEmptyArray && !value.length) return false;

          if (arrayValidationOptions?.typeOfArrayItems?.length && value.length) {
            const isTypeValid = value.every((item) => arrayValidationOptions.typeOfArrayItems.includes(typeof item));
            if (!isTypeValid) return false
          }

          return true;
        },
        defaultMessage(args: ValidationArguments) {
          if (typeof args.value === 'string') args.value = JSON.parse(String(args.value).replace(/'/g, '"'))
          if (!Array.isArray(args.value)) return `${args.property} must be an array`;

          if (!arrayValidationOptions.allowEmptyArray && !args.value.length)
            return `${args.property} cannot be an empty array`;

          if (arrayValidationOptions.typeOfArrayItems.length && args.value.length) {
            const isTypeValid = args.value.every((item) => arrayValidationOptions.typeOfArrayItems.includes(typeof item));
            if (!isTypeValid) return `${args.property} must contain only ${arrayValidationOptions.typeOfArrayItems} values`
          }
          return `${args.property} is invalid`;
        }
      }
    });
  };
}

export function IsOneOf(allowedValues: any[], validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isOneOf',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [allowedValues],
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [allowedValues] = args.constraints;
          return allowedValues.includes(value);
        },
        defaultMessage(args: ValidationArguments) {
          const [allowedValues] = args.constraints;
          return `${args.property} must be one of the following values: ${allowedValues.join(', ')}`;
        },
      },
    });
  };
}