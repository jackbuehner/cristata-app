import styled from '@emotion/styled/macro';
import { isSchemaDef } from '@jackbuehner/cristata-generator-schema';
import Color from 'color';
import { Button } from '../../../../components/Button';
import { Checkbox, Code, Text } from '../../../../components/ContentField';
import { Field } from '../../../../components/ContentField/Field';
import { useAppSelector, useAppDispatch } from '../../../../redux/hooks';
import { setDefaultQueryOption, setCustomQueries } from '../../../../redux/slices/collectionSlice';
import pluralize from 'pluralize';
import { uncapitalize } from '../../../../utils/uncapitalize';
import { colorType } from '../../../../utils/theme/theme';

function QueriesTab() {
  const state = useAppSelector(({ collectionConfig }) => collectionConfig);
  const dispatch = useAppDispatch();

  const name = state.collection?.name;
  const customQueries = state.collection?.customQueries;
  const disableFindOneQuery = state.collection?.options?.disableFindOneQuery;
  const disableFindManyQuery = state.collection?.options?.disableFindManyQuery;
  const disableActionAccessQuery = state.collection?.options?.disableActionAccessQuery;
  const disablePublicFindOneQuery = state.collection?.options?.disablePublicFindOneQuery;
  const disablePublicFindOneBySlugQuery = state.collection?.options?.disablePublicFindOneBySlugQuery;
  const disablePublicFindManyQuery = state.collection?.options?.disablePublicFindManyQuery;
  const slugFieldDef =
    state.collection?.schemaDef?.slug && isSchemaDef(state.collection.schemaDef.slug)
      ? state.collection.schemaDef.slug
      : undefined;

  return (
    <div style={{ margin: 20 }}>
      <Card>
        <CardLabel>Default queries</CardLabel>
        <Checkbox
          isEmbedded
          label={`Disable FindOne query (${uncapitalize(name || '')})`}
          checked={disableFindOneQuery}
          onChange={(e) => dispatch(setDefaultQueryOption('disableFindOneQuery', e.currentTarget.checked))}
        />
        <Checkbox
          isEmbedded
          label={`Disable FindMany query (${pluralize(uncapitalize(name || ''))})`}
          checked={disableFindManyQuery}
          onChange={(e) => dispatch(setDefaultQueryOption('disableFindManyQuery', e.currentTarget.checked))}
        />
        <Checkbox
          isEmbedded
          label={`Disable ActionAccess query (${uncapitalize(name || '')}ActionAccess)`}
          checked={disableActionAccessQuery}
          onChange={(e) => dispatch(setDefaultQueryOption('disableActionAccessQuery', e.currentTarget.checked))}
        />
        <Checkbox
          isEmbedded
          label={`Disable public FindOne query (${uncapitalize(name || '')}Public)`}
          checked={disablePublicFindOneQuery}
          onChange={(e) =>
            dispatch(setDefaultQueryOption('disablePublicFindOneQuery', e.currentTarget.checked))
          }
        />
        {slugFieldDef ? (
          <Checkbox
            isEmbedded
            label={`Disable public FindOneBySlug query (${uncapitalize(name || '')}BySlugPublic)`}
            checked={disablePublicFindOneBySlugQuery}
            onChange={(e) =>
              dispatch(setDefaultQueryOption('disablePublicFindOneBySlugQuery', e.currentTarget.checked))
            }
          />
        ) : null}
        <Checkbox
          isEmbedded
          label={`Disable public FindMany query (${pluralize(uncapitalize(name || ''))}Public)`}
          checked={disablePublicFindManyQuery}
          onChange={(e) =>
            dispatch(setDefaultQueryOption('disablePublicFindManyQuery', e.currentTarget.checked))
          }
        />
      </Card>
      <Card>
        <CardLabel>Custom queries</CardLabel>
        {customQueries?.map((cq, index, arr) => {
          if (cq) {
            return (
              <Card color={'primary'}>
                <Text
                  isEmbedded
                  label={'Name'}
                  description={`camelCase name of the custom query.
                    The query name will be capitalized and the name of the collection will be prepended to the query name.
                    For example, <code>myCustomQuery</code> becomes <code>${uncapitalize(
                      name || ''
                    )}MyCustomQuery</code>.
                  `}
                  value={cq.name}
                  onChange={(e) => {
                    const copy = JSON.parse(JSON.stringify(arr));
                    copy[index].name = e.currentTarget.value;
                    dispatch(setCustomQueries(copy));
                  }}
                />
                <Text
                  isEmbedded
                  label={'Description'}
                  description={`The description of the query. Be sure to use a helpful description so someone else can know what this query does. Can be seen in GraphQL introspection.`}
                  value={cq.description}
                  onChange={(e) => {
                    const copy = JSON.parse(JSON.stringify(arr));
                    copy[index].description = e.currentTarget.value;
                    dispatch(setCustomQueries(copy));
                  }}
                />
                <Field isEmbedded label={'Query input'}>
                  <>
                    <Checkbox
                      isEmbedded
                      label={'Accept input arguments'}
                      checked={cq.accepts !== undefined}
                      onChange={(e) => {
                        const copy = JSON.parse(JSON.stringify(arr));
                        if (e.currentTarget.checked) {
                          copy[index].accepts = '';
                        } else {
                          copy[index].accepts = undefined;
                        }
                        dispatch(setCustomQueries(copy));
                      }}
                    />
                    {cq.accepts !== undefined ? (
                      <IndentField color={'primary'}>
                        <Text
                          isEmbedded
                          label={'Accepts'}
                          description={`A string list of arguments for the query.\nExample: <code>name: String!, slug: String</code>`}
                          value={cq.accepts}
                          onChange={(e) => {
                            const copy = JSON.parse(JSON.stringify(arr));
                            copy[index].accepts = e.currentTarget.value;
                            dispatch(setCustomQueries(copy));
                          }}
                        />
                      </IndentField>
                    ) : null}
                  </>
                </Field>
                <Text
                  isEmbedded
                  label={'Return type'}
                  description={`An un-named object type that represents the returned values from the pipeline.
                    If you want to specify a type that already exists, provide it without curly brackets.
                    Example: <code>{ _id: Float!, count: Int! }</code>
                  `}
                  value={cq.returns}
                  onChange={(e) => {
                    const copy = JSON.parse(JSON.stringify(arr));
                    copy[index].returns = e.currentTarget.value;
                    dispatch(setCustomQueries(copy));
                  }}
                />
                <Checkbox
                  isEmbedded
                  label={'Return a specific path'}
                  description={`Choose a specific path from the pipeline result to send to clients.`}
                  checked={cq.path !== undefined}
                  onChange={(e) => {
                    const copy = JSON.parse(JSON.stringify(arr));
                    if (e.currentTarget.checked) {
                      copy[index].path = '';
                    } else {
                      copy[index].path = undefined;
                    }
                    dispatch(setCustomQueries(copy));
                  }}
                />
                {cq.path !== undefined ? (
                  <IndentField color={'primary'}>
                    <Text
                      isEmbedded
                      label={'Path'}
                      value={cq.path}
                      onChange={(e) => {
                        const copy = JSON.parse(JSON.stringify(arr));
                        copy[index].path = e.currentTarget.value;
                        dispatch(setCustomQueries(copy));
                      }}
                    />
                  </IndentField>
                ) : null}
                <Checkbox
                  isEmbedded
                  label={'Make this query publically available'}
                  description={`This query will not require Cristata authentication. 'Public' is appended to the query name when this is enabled`}
                  checked={cq.public}
                  onChange={(e) => {
                    const copy = JSON.parse(JSON.stringify(arr));
                    if (e.currentTarget.checked) {
                      copy[index].public = true;
                    } else {
                      copy[index].public = false;
                    }
                    dispatch(setCustomQueries(copy));
                  }}
                />
                <Code
                  isEmbedded
                  type={'json'}
                  label={'Pipeline'}
                  description={`A MongoDB aggregation pipeline. Pipelines always return an array of results. <a href="https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline/#aggregation-pipeline-stages">Pipeline stage reference</a>`}
                  value={typeof cq.pipeline === 'string' ? cq.pipeline : JSON.stringify(cq.pipeline, null, 2)}
                  onChange={(value) => {
                    if (value) {
                      const copy = JSON.parse(JSON.stringify(arr));
                      copy[index].pipeline = JSON.parse(value);
                      dispatch(setCustomQueries(copy));
                    }
                  }}
                />
                <Button
                  onClick={() => {
                    const copy = JSON.parse(JSON.stringify(arr));
                    delete copy[index];
                    dispatch(setCustomQueries(copy));
                  }}
                >
                  Remove custom query
                </Button>
              </Card>
            );
          }
          return null;
        })}
        <Button
          onClick={() => {
            const newQ = {
              name: 'customQuery',
              description: 'A description for a custom query',
              returns: '{ fieldName: String! }',
              pipeline: [],
            };
            if (!customQueries) dispatch(setCustomQueries([newQ]));
            else dispatch(setCustomQueries([...customQueries, newQ]));
          }}
        >
          Add custom query
        </Button>
      </Card>
    </div>
  );
}

const Card = styled.div<{ color?: colorType }>`
  margin: 16px 0;
  padding: 16px;
  box-shadow: ${({ theme }) => theme.color.neutral[theme.mode][200]} 0px 0px 0px 1px inset;
  ${({ theme, color }) => {
    if (color) {
      return `
        &:focus-within {
          box-shadow: ${(() => {
            if (color === 'neutral') color = undefined;
            return theme.color[color || 'primary'][theme.mode === 'dark' ? 300 : 800];
          })()}
            0px 0px 0px 2px inset;
        }
      `;
    }
    return ``;
  }};
  transition: box-shadow 240ms;
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
  margin: 0 0 16px 0;
`;

const IndentField = styled.div<{ color: colorType }>`
  padding: 10px;
  margin-left: 28px;
  width: calc(100% - 28px);
  box-sizing: border-box;
  background: ${({ theme, color }) =>
    Color(
      color === 'neutral'
        ? theme.color.neutral[theme.mode][600]
        : theme.color[color][theme.mode === 'light' ? 900 : 300]
    )
      .alpha(0.08)
      .string()};
  border-radius: ${({ theme }) => theme.radius};
`;

export { QueriesTab };
