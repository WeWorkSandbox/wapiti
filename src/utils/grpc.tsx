import {
  Enum,
  Field,
  MapField, Method,
  Namespace,
  OneOf,
  ReflectionObject,
  Root,
  Service,
  Service as ProtoService,
  Type,
} from 'protobufjs';

export function walkServices(root: Root, onService: (service: Service, serviceName: string) => void) {

  walkNamespace(root, namespace => {
    const nestedNamespaceTypes = namespace.nested;
    if (nestedNamespaceTypes) {
      Object.keys(nestedNamespaceTypes).forEach(nestedTypeName => {
        const fullNamespaceName = (namespace.fullName.startsWith('.'))
          ? namespace.fullName.replace('.', '')
          : namespace.fullName;

        const nestedType = root.lookup(`${fullNamespaceName}.${nestedTypeName}`);

        if (nestedType instanceof Service) {
          const serviceName = [
            ...fullNamespaceName.split('.'),
            nestedType.name
          ];

          const fullyQualifiedServiceName = serviceName.join('.');

          onService(nestedType as Service, fullyQualifiedServiceName);
        }
      });
    }
  });

//  Object.keys(ast)
//    .forEach(serviceName => {
//      const lookupType = root.lookup(serviceName);
//      if (lookupType instanceof Service) {
//        // No namespace, root services
//        onService(serviceByName(root, serviceName), ast[serviceName], serviceName);
//      }
//    });
}

export function walkNamespace(root: Root, onNamespace: (namespace: Namespace) => void, parentNamespace?: Namespace) {
  const nestedType = (parentNamespace && parentNamespace.nested) || root.nested;

  if (nestedType) {
    Object.keys(nestedType).forEach((typeName: string) => {
      if (parentNamespace && parentNamespace.name === typeName) {
        // TODO: traverse recursively for identical namespace name
        typeName = typeName + '.' + typeName;
      }
      const nestedNamespace = root.lookup(typeName);
      if (nestedNamespace && isNamespace(nestedNamespace)) {
        onNamespace(nestedNamespace as Namespace);
        walkNamespace(root, onNamespace, nestedNamespace as Namespace);
      }
    });
  }
}

export function serviceByName(root: Root, serviceName: string): ProtoService {
  if (!root.nested) {
    throw new Error('Empty PROTO!');
  }

  const serviceLeaf = root.nested[serviceName];
  return root.lookupService(serviceLeaf.fullName);
}

function isNamespace(lookupType: ReflectionObject) {
  if (
    (lookupType instanceof Namespace) &&
    !(lookupType instanceof Service) &&
    !(lookupType instanceof Type) &&
    !(lookupType instanceof Enum) &&
    !(lookupType instanceof Field) &&
    !(lookupType instanceof MapField) &&
    !(lookupType instanceof OneOf) &&
    !(lookupType instanceof Method)
  ) {
    return true;
  }

  return false;
}
