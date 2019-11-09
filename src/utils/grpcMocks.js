// Taken from https://github.com/uw-labs/bloomrpc-mock (GNU LGPL License: https://github.com/uw-labs/bloomrpc-mock/blob/master/LICENSE)

import {Enum, Field, MapField, Method, OneOf, Service, Type} from 'protobufjs';
import * as uuid from 'uuid';

export interface MethodPayload {
  mock: any;
  schema: any;
  objType: string;
}

/**
 * Mock method response
 */
export function mockResponseMethod(service: Service, method: Method) {
  return mockMethodReturnType(
    service,
    method,
    false,
  );
}

/**
 * Mock methods request
 */
export function mockRequestMethod(service: Service, method: Method) {
  return mockMethodReturnType(
    service,
    method,
    true,
  );
}

function mockMethodReturnType(
  service: Service,
  serviceMethod: Method,
  isRequest: boolean,
): MethodPayload {
  const root = service.root;

    const methodMessageType = isRequest
      ? serviceMethod.requestType
      : serviceMethod.responseType;

    const messageType = root.lookupType(methodMessageType);
    return {mock: mockTypeFields(messageType), schema: JSON.parse(JSON.stringify(messageType.fields)), objType: methodMessageType};
}

/**
 * Mock a field type
 */
function mockTypeFields(type: Type): object {
  const fieldsData: { [key: string]: any } = {};

  return type.fieldsArray.reduce((data, field) => {
    field.resolve();

    if (field.parent !== field.resolvedType) {
      if (field.repeated) {
        data[field.name] = [mockField(field)];
      } else {
        data[field.name] = mockField(field);
      }
    }

    return data;
  }, fieldsData);
}

/**
 * Mock enum
 */
function mockEnum(enumType: Enum): number {
  const enumKey = Object.keys(enumType.values)[0];

  return enumType.values[enumKey];
}

/**
 * Mock a field
 */
function mockField(field: Field): any {
  if (field instanceof MapField) {
    let mockPropertyValue:any = null;
    if (field.resolvedType === null) {
      mockPropertyValue = mockScalar(field.type, field.name);
    }

    if (mockPropertyValue === null) {
      const resolvedType = field.resolvedType;

      if (resolvedType instanceof Type) {
        if (resolvedType.oneofs) {
          mockPropertyValue = pickOneOf(resolvedType.oneofsArray);
        } else {
          mockPropertyValue = mockTypeFields(resolvedType);
        }
      } else if (resolvedType instanceof Enum) {
        mockPropertyValue = mockEnum(resolvedType);
      } else if (resolvedType === null) {
        mockPropertyValue = {};
      }
    }

    return {
      [mockScalar(field.keyType, field.name)]: mockPropertyValue,
    };
  }

  if (field.resolvedType instanceof Type) {
    return mockTypeFields(field.resolvedType);
  }

  if (field.resolvedType instanceof Enum) {
    return mockEnum(field.resolvedType);
  }

  const mockPropertyValue = mockScalar(field.type, field.name);

  if (mockPropertyValue === null) {
    const resolvedField = field.resolve();

    return mockField(resolvedField);
  } else {
    return mockPropertyValue;
  }
}

function pickOneOf(oneofs: OneOf[]):any {
  return oneofs.reduce((fields: {[key: string]: any}, oneOf) => {
    fields[oneOf.name] = mockField(oneOf.fieldsArray[0]);
    return fields;
  }, {});
}

function mockScalar(type: string, fieldName: string): any {
  switch (type) {
  case 'string':
    return interpretMockViaFieldName(fieldName);
  case 'number':
    return 10;
  case 'bool':
    return true;
  case 'int32':
    return 10;
  case 'int64':
    return 20;
  case 'uint32':
    return 100;
  case 'uint64':
    return 100;
  case 'sint32':
    return 100;
  case 'sint64':
    return 1200;
  case 'fixed32':
    return 1400;
  case 'fixed64':
    return 1500;
  case 'sfixed32':
    return 1600;
  case 'sfixed64':
    return 1700;
  case 'double':
    return 1.4;
  case 'float':
    return 1.1;
  case 'bytes':
    return new Buffer('Hello');
  default:
    return null;
  }
}

/**
 * Tries to guess a mock value from the field name.
 * Default Hello.
 */
function interpretMockViaFieldName(fieldName: string): string {
  const fieldNameLower = fieldName.toLowerCase();

  if (fieldNameLower.startsWith('id') || fieldNameLower.endsWith('id')) {
    return uuid.v4();
  }

  return 'Hello';
}
