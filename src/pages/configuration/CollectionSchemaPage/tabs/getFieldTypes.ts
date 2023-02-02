import type { SchemaDefType } from '@jackbuehner/cristata-generator-schema';
import { isTypeTuple, parseSchemaComponents } from '@jackbuehner/cristata-generator-schema';

const getFieldTypes = (
  schema: SchemaDefType,
  excludeArrays: boolean = true,
  prefix?: { id: string }
): [string, string, string, boolean][] => {
  const { schemaDefs, schemaRefs, arraySchemas, nestedSchemas } = parseSchemaComponents(schema);
  const returnValue: [string, string, string, boolean][] = [];

  schemaDefs.forEach(([key, def]) => {
    const schemaType = isTypeTuple(def.type) ? def.type[0] : def.type;
    let type = Array.isArray(schemaType) ? schemaType[0] + 's' : schemaType;
    if (type.includes('[') && type.includes(']')) type = type.replace('[', '').replace(']', '');

    const id = prefix ? `${prefix.id}.${key}` : key;

    returnValue.push([id, def.field?.label || id, type, def.unique || false]);
  });

  schemaRefs.forEach(([key, ref]) => {
    const schemaType = isTypeTuple(ref.fieldType) ? ref.fieldType[0] : ref.fieldType;
    let type = Array.isArray(schemaType) ? schemaType[0] + 's' : schemaType;
    if (type.includes('[') && type.includes(']')) type = type.replace('[', '').replace(']', '');

    const id = prefix ? `${prefix.id}.${key}` : key;

    returnValue.push([id, id, type, false]);
  });

  if (!excludeArrays) {
    arraySchemas.forEach(([key, arr]) => {
      const id = prefix ? `${prefix.id}.${key}.0` : `${key}.0`;
      returnValue.push(...getFieldTypes(arr[0], excludeArrays, { id }));
    });
  }

  nestedSchemas.forEach(([key, schema]) => {
    const id = prefix ? `${prefix.id}.${key}` : key;
    returnValue.push(...getFieldTypes(schema, excludeArrays, { id }));
  });

  return returnValue;
};

export { getFieldTypes };
