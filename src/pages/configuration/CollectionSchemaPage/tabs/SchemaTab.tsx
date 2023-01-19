import {
  isSchemaDef,
  isTypeTuple,
  parseSchemaComponents,
  SchemaDefType,
} from '@jackbuehner/cristata-generator-schema';
import { Fragment } from 'react';
import { useAppSelector } from '../../../../redux/hooks';
import { BranchCard } from './BranchCard';
import { DocArrayCard } from './DocArrayCard';
import { SchemaCard, SchemaCardProps } from './SchemaCard';

interface SchemaTabProps {}

function SchemaTab(props: SchemaTabProps) {
  const state = useAppSelector(({ collectionConfig }) => collectionConfig);

  const generateItems = (
    schema: SchemaDefType = state.collection?.schemaDef || {},
    prefix?: { label: string; id: string },
    items: { node: React.ReactNode; id: string; order: number }[] = []
  ) => {
    const { schemaDefs, schemaRefs, arraySchemas, nestedSchemas } = parseSchemaComponents(schema);

    schemaDefs
      .filter(([key]) => {
        const id = prefix ? `${prefix.id}.${key}` : key;
        return id !== 'timestamps.updated_at' && id !== 'timestamps.published_at';
      })
      .forEach(([key, def], index) => {
        const schemaType = isTypeTuple(def.type) ? def.type[0] : def.type;
        let type = Array.isArray(schemaType) ? schemaType[0] + 's' : schemaType;
        if (type.includes('[') && type.includes(']')) type = type.replace('[', '').replace(']', '');

        const tags = [type];

        const isReference = def.field?.reference?.collection || isTypeTuple(def.type);
        const isBranching = type === 'JSON' && def.field?.custom;
        const isMarkdown = type === 'String' && def.field?.markdown;
        const isHidden = def.field?.hidden === true;
        const isPublishOnly = def.field?.hidden === 'publish-only';
        const isCollasped = def.field?.collapsed;

        if (key === 'body' && def.field?.tiptap) tags.push('Rich text');
        if (isReference) tags.push('Reference');
        if (isBranching) tags.push('Branching');
        if (isMarkdown) tags.push('Markdown');
        if (def.required) tags.push('Required');
        if (def.unique) tags.push('Unique');
        if (def.public) tags.push('Public');
        if (!def.modifiable) tags.push('Read only');
        if (def.textSearch) tags.push('Searchable');
        if (def.setter) tags.push('Modified on condition');
        if (isHidden) tags.push('Hidden');
        if (isPublishOnly) tags.push('On publish only');
        if (isCollasped) tags.push('Collapsed');

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
        if (isBranching) icon = 'branching';

        items.push({
          node: (
            <Fragment key={key + index}>
              <SchemaCard key={key + index} icon={icon} label={def.field?.label || key} id={id} tags={tags} />
              {isBranching ? (
                <BranchCard
                  id={id}
                  branches={
                    def.field?.custom?.map((branch, index) => {
                      return {
                        name: branch.name,
                        fields: generateItems(branch.fields, {
                          label: key,
                          id: `${id}.field.custom.${index}.fields`,
                        })
                          .sort((a, b) => {
                            const orderA = parseInt(`${a.order}`);
                            const orderB = parseInt(`${b.order}`);
                            return orderA > orderB ? 1 : -1;
                          })
                          .map(({ node }) => node),
                      };
                    }) || []
                  }
                />
              ) : null}
            </Fragment>
          ),
          id,
          order: (() => {
            let order = def.field?.order || 999;
            if (isCollasped) order += 1000;
            return order;
          })(),
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
            isRef
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
      const id = prefix ? `${prefix.id}.${key}.0` : `${key}.0`;

      const labelDef = isSchemaDef(arr[0]['#label']) ? arr[0]['#label'] : undefined;

      const tags = ['Document Array'];

      const isHidden = labelDef?.field?.hidden === true;
      const isPublishOnly = labelDef?.field?.hidden === 'publish-only';
      const isCollasped = labelDef?.field?.collapsed;

      if (isHidden) tags.push('Hidden');
      if (isPublishOnly) tags.push('On publish only');
      if (isCollasped) tags.push('Collapsed');

      const generated = generateItems(arr[0], { label: key, id })
        .filter(({ id: thisID }) => thisID !== `${id}.#label`) // do not show label schema
        .sort((a, b) => {
          const orderA = parseInt(`${a.order}`);
          const orderB = parseInt(`${b.order}`);
          return orderA > orderB ? 1 : -1;
        })
        .map(({ node }) => node);

      items.push({
        node: (
          <Fragment key={key + index}>
            <SchemaCard
              key={key + index}
              icon={'docarray'}
              label={labelDef?.field?.label || key}
              id={id.replace('.0', '.0.#label')}
              tags={tags}
            />
            <DocArrayCard id={id}>
              <>{generated}</>
            </DocArrayCard>
          </Fragment>
        ),
        id,
        order: (() => {
          let order = labelDef?.field?.order || 999;
          if (isCollasped) order += 1000;
          return order;
        })(),
      });
    });

    nestedSchemas
      .filter(([key]) => key !== 'permissions')
      .forEach(([key, schema], index) => {
        const id = prefix ? `${prefix.id}.${key}` : key;
        items.push(...generateItems(schema, { label: key, id }));
      });

    return items;
  };

  const items = generateItems()
    .sort((a, b) => {
      const orderA = parseInt(`${a.order}`);
      const orderB = parseInt(`${b.order}`);
      return orderA > orderB ? 1 : -1;
    })
    .map(({ node }) => node);

  return <>{items}</>;
}

export { SchemaTab };
