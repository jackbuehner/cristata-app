import styled from '@emotion/styled/macro';
import { isSchemaDef } from '@jackbuehner/cristata-api/dist/api/v3/helpers/generators/genSchema';
import Color from 'color';
import { useDispatch } from 'react-redux';
import { Checkbox, SelectOne, Text } from '../../../../components/ContentField';
import { useAppSelector } from '../../../../redux/hooks';
import {
  setCanPublish,
  setName,
  setNavLabel,
  setPublicRules,
  setWithPermissions,
  setWithSubscription,
} from '../../../../redux/slices/collectionSlice';
import { colorType } from '../../../../utils/theme/theme';
import { getFieldTypes } from './getFieldTypes';

interface OptionsTabProps {}

function OptionsTab(props: OptionsTabProps) {
  const state = useAppSelector(({ collectionConfig }) => collectionConfig);
  const dispatch = useDispatch();

  const publicRules = state.collection?.publicRules;
  const name = state.collection?.name;
  const navLabel = state.collection?.navLabel;
  const canPublish = state.collection?.canPublish;
  const withPermissions = state.collection?.withPermissions;
  const withSubscription = state.collection?.withSubscription;

  const fieldTypes = getFieldTypes(state.collection?.schemaDef || {}, true);

  const hasSlugField =
    state.collection &&
    isSchemaDef(state.collection.schemaDef.slug) &&
    state.collection.schemaDef.slug.type === 'String';
  const dateFields = fieldTypes.filter(([key, label, type]) => type === 'Date');
  const slugDateFieldOptions = dateFields.map(([key, label]) => ({ value: key, label }));

  return (
    <div style={{ margin: 20 }}>
      <Card>
        <CardLabel>Name</CardLabel>
        {name ? (
          <Text
            isEmbedded
            label={'Schema name'}
            description={
              'The name for this schema that is used in the Cristata app and the API.\n<i>Schema names cannot be changed once they are set.</i>'
            }
            value={name}
            readOnly
            onChange={(e) => dispatch(setName(e.currentTarget.value))}
          />
        ) : null}
        {navLabel ? (
          <Text
            isEmbedded
            label={'Plural label'}
            description={`In certain places within Cristata, this label will be used for plural instances of this collection's name.\n<i>To organize this collection into a specific scope, prepend the plural label with <code>Scope::</code>. Scopes have no impact on the data of this collection, but they can help users understand which collections are related.</i>`}
            value={navLabel}
            onChange={(e) => dispatch(setNavLabel(e.currentTarget.value))}
          />
        ) : null}
      </Card>
      {publicRules !== undefined ? (
        <Card>
          <CardLabel>Public access</CardLabel>
          <Checkbox
            isEmbedded
            label={'Allow public access to select fields in this collection.'}
            description={
              'Enable public access to control which collection documents can be accessed without authentication.\n<i>Only fields that have been configured for public access are available through public queries.</i>'
            }
            checked={!!publicRules}
            onChange={(e) => {
              if (e.currentTarget.checked) {
                dispatch(setPublicRules({}));
                if (hasSlugField) dispatch(setPublicRules(slugDateFieldOptions[0].value));
              } else {
                dispatch(setPublicRules(false));
              }
            }}
          />
          {publicRules ? (
            <IndentField color={'primary'}>
              <>
                <Text
                  isEmbedded
                  label={'Filter publicly exposed documents'}
                  description={
                    'Only documents that match the filter will be available for public access. Use the <a href="https://www.mongodb.com/docs/v5.3/tutorial/query-documents/#std-label-read-operations-query-argument">MongoDB query syntax</a> to construct the filter. Use <code>{}</code> for no filter.'
                  }
                  value={JSON.stringify(publicRules.filter || {}, null, 2)}
                  onChange={(e) => {
                    dispatch(setPublicRules(JSON.parse(e.currentTarget.value)));
                  }}
                />
                {hasSlugField ? (
                  <SelectOne
                    isEmbedded
                    label={'Slug date field'}
                    description={
                      'When accessing documents by slug and date, check that the provided date also matches the value of the slug date field. This ensures the correct document is returned when multiple documents have the same slug but different date field values.'
                    }
                    type={'String'}
                    options={slugDateFieldOptions}
                    value={
                      slugDateFieldOptions.find((a) => a.value === publicRules.slugDateField) ||
                      slugDateFieldOptions[0]
                    }
                    onChange={(value) => {
                      if (value) {
                        dispatch(setPublicRules(`${value.value}`));
                      }
                    }}
                  />
                ) : null}
              </>
            </IndentField>
          ) : null}
        </Card>
      ) : null}
      <Card>
        <CardLabel>More options</CardLabel>
        {canPublish !== undefined ? (
          <Checkbox
            isEmbedded
            label={'Allow items to be published'}
            checked={canPublish}
            onChange={(e) => dispatch(setCanPublish(e.currentTarget.checked))}
          />
        ) : null}
        {withPermissions !== undefined ? (
          <Checkbox
            isEmbedded
            label={'Use granular permissions for each item'}
            checked={withPermissions}
            onChange={(e) => dispatch(setWithPermissions(e.currentTarget.checked))}
          />
        ) : null}
        {withSubscription !== undefined ? (
          <Checkbox
            isEmbedded
            label={'Allow subscriptions to changes (via websockets)'}
            checked={withSubscription}
            onChange={(e) => dispatch(setWithSubscription(e.currentTarget.checked))}
          />
        ) : null}
      </Card>
    </div>
  );
}

const Card = styled.div`
  margin: 16px 0;
  padding: 16px;
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

export { OptionsTab };
