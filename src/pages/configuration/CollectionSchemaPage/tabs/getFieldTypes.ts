import { GenCollectionInput } from '@jackbuehner/cristata-api/dist/api/v3/helpers/generators/genCollection';
import { isTypeTuple } from '@jackbuehner/cristata-api/dist/api/v3/helpers/generators/genSchema';
import { parseSchemaComponents } from '@jackbuehner/cristata-api/dist/api/v3/helpers/generators/genTypeDefs/parseSchemaComponents';

const getFieldTypes = (
  schema: GenCollectionInput['schemaDef'],
  prefix?: { id: string }
): [string, string, string][] => {
  const { schemaDefs, schemaRefs, arraySchemas, nestedSchemas } = parseSchemaComponents(schema);
  const returnValue: [string, string, string][] = [];

  schemaDefs.forEach(([key, def], index) => {
    const schemaType = isTypeTuple(def.type) ? def.type[0] : def.type;
    let type = Array.isArray(schemaType) ? schemaType[0] + 's' : schemaType;
    if (type.includes('[') && type.includes(']')) type = type.replace('[', '').replace(']', '');

    const id = prefix ? `${prefix.id}.${key}` : key;

    returnValue.push([id, def.field?.label || id, type]);
  });

  schemaRefs.forEach(([key, ref], index) => {
    const schemaType = isTypeTuple(ref.fieldType) ? ref.fieldType[0] : ref.fieldType;
    let type = Array.isArray(schemaType) ? schemaType[0] + 's' : schemaType;
    if (type.includes('[') && type.includes(']')) type = type.replace('[', '').replace(']', '');

    const id = prefix ? `${prefix.id}.${key}` : key;

    returnValue.push([id, id, type]);
  });

  arraySchemas.forEach(([key, arr], index) => {
    const id = prefix ? `${prefix.id}.${key}.0` : `${key}.0`;
    returnValue.push(...getFieldTypes(arr[0], { id }));
  });

  nestedSchemas.forEach(([key, schema], index) => {
    const id = prefix ? `${prefix.id}.${key}` : key;
    returnValue.push(...getFieldTypes(schema, { id }));
  });

  return returnValue;
};

export { getFieldTypes };
