import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

/**
 * Validates that a date string property is on or after another date property
 * on the same object. Used to enforce dueDate >= invoiceDate server-side.
 */
export function IsOnOrAfter(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      name: 'isOnOrAfter',
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments): boolean {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as Record<string, unknown>)[
            relatedPropertyName
          ];
          if (typeof value !== 'string' || typeof relatedValue !== 'string') {
            return false;
          }
          const a = new Date(value).getTime();
          const b = new Date(relatedValue).getTime();
          if (Number.isNaN(a) || Number.isNaN(b)) return false;
          return a >= b;
        },
        defaultMessage(args: ValidationArguments): string {
          const [relatedPropertyName] = args.constraints;
          return `${args.property} must be on or after ${relatedPropertyName}`;
        },
      },
    });
  };
}
