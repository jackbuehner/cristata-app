import styled from '@emotion/styled/macro';
import { GenCollectionInput } from '@jackbuehner/cristata-api/dist/api/v3/helpers/generators/genCollection';
import {
  isSchemaDef,
  isTypeTuple,
  SchemaDefType,
} from '@jackbuehner/cristata-api/dist/api/v3/helpers/generators/genSchema';
import { parseSchemaComponents } from '@jackbuehner/cristata-api/dist/api/v3/helpers/generators/genTypeDefs/parseSchemaComponents';
import Color from 'color';
import { SchemaCard, SchemaCardProps } from './SchemaCard';

interface SchemaTabProps {
  collection: GenCollectionInput;
}

function SchemaTab(props: SchemaTabProps) {
  const generateItems = (
    schema: SchemaDefType = props.collection.schemaDef,
    prefix?: { label: string; id: string },
    items: { node: React.ReactNode; id: string; order: number }[] = []
  ) => {
    const { schemaDefs, schemaRefs, arraySchemas, nestedSchemas } = parseSchemaComponents(schema);

    schemaDefs.forEach(([key, def], index) => {
      const schemaType = isTypeTuple(def.type) ? def.type[0] : def.type;
      let type = Array.isArray(schemaType) ? schemaType[0] + 's' : schemaType;
      if (type.includes('[') && type.includes(']')) type = type.replace('[', '').replace(']', '');

      const tags = [type];

      const isReference = def.field?.reference?.collection || isTypeTuple(def.type);

      if (key === 'body' && def.field?.tiptap) tags.push('Rich text');
      if (isReference) tags.push('Reference');
      if (def.required) tags.push('Required');
      if (def.unique) tags.push('Unique');
      if (def.public) tags.push('Public');
      if (!def.modifiable) tags.push('Read only');
      if (def.textSearch) tags.push('Searchable');
      if (def.setter) tags.push('Modified on condition');

      const id = prefix ? `${prefix.id}.${key}` : key;

      let icon: SchemaCardProps['icon'];
      if (type === 'String' || type === 'Strings') {
        if (key === 'body' && def.field?.tiptap) icon = 'richtext';
        else icon = 'text';
      }
      if (type === 'Float' || type === 'Floats') icon = 'decimal';
      if (type === 'Number' || type === 'Numbers') icon = 'number';
      if (type === 'Boolean' || type === 'Booleans') icon = 'boolean';
      if (type === 'Date' || type === 'Dates') icon = 'datetime';
      if (type === 'ObjectId' || type === 'ObjectIds') icon = 'objectid';
      if (isReference) icon = 'reference';

      items.push({
        node: <SchemaCard key={key + index} icon={icon} label={def.field?.label || key} id={id} tags={tags} />,
        id,
        order: def.field?.order || 999,
      });
    });

    schemaRefs.forEach(([key, ref], index) => {
      const schemaType = isTypeTuple(ref.fieldType) ? ref.fieldType[0] : ref.fieldType;
      let type = Array.isArray(schemaType) ? schemaType[0] + 's' : schemaType;
      if (type.includes('[') && type.includes(']')) type = type.replace('[', '').replace(']', '');

      const tags = [type];

      const id = prefix ? `${prefix.id}.${key}` : key;

      items.push({
        node: (
          <SchemaCard
            key={key + index}
            icon={'reference'}
            label={ref.model + ': ' + ref.field}
            id={id}
            tags={tags}
          />
        ),
        id,
        order: 999,
      });
    });

    arraySchemas.forEach(([key, arr], index) => {
      const id = prefix ? `${prefix.id}.${key}` : key;

      const labelDef = isSchemaDef(arr[0]['#label']) ? arr[0]['#label'] : undefined;
      const order = labelDef?.field?.order || 999;

      const generated = generateItems(arr[0], { label: key, id })
        .filter(({ id: thisID }) => thisID !== `${id}.#label`) // do not show label schema
        .sort((a, b) => (a.order > b.order ? 1 : -1))
        .map(({ node }) => node);

      items.push({
        node: (
          <Card key={key + index}>
            <CardLabel>{labelDef?.field?.label || key}</CardLabel>
            {generated}
          </Card>
        ),
        id,
        order: order,
      });
    });

    nestedSchemas.forEach(([key, schema], index) => {
      const id = prefix ? `${prefix.id}.${key}` : key;
      generateItems(schema, { label: key, id });
    });

    return items;
  };

  const items = generateItems()
    .sort((a, b) => (a.order > b.order ? 1 : -1))
    .map(({ node }) => node);

  return <>{items}</>;
}

const Card = styled.div`
  margin: 16px;
  padding: 16px 0 1px 0;
  box-shadow: ${({ theme }) => theme.color.neutral[theme.mode][200]} 0px 0px 0px 1px inset;
  background-color: ${({ theme }) =>
    theme.mode === 'dark'
      ? Color(theme.color.neutral.dark[100]).lighten(0.2).string()
      : Color('#ffffff').darken(0.03).string()};
  border-radius: ${({ theme }) => theme.radius};
`;

const CardLabel = styled.div`
  font-family: ${({ theme }) => theme.font.detail};
  font-weight: 600;
  font-size: 16px;
  color: ${({ theme }) => theme.color.neutral[theme.mode][1400]};
  margin: 0 16px;
`;

export { SchemaTab };
