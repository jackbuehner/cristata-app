import styled from '@emotion/styled/macro';
import { CollectionPermissionsActions } from '@jackbuehner/cristata-api/dist/types/config';
import { isSchemaDef, isSchemaDefOrType } from '@jackbuehner/cristata-generator-schema';
import Color from 'color';
import { get as getProperty } from 'object-path';
import { useDispatch } from 'react-redux';
import { Button } from '../../../../components/Button';
import {
  Checkbox,
  Code,
  ReferenceMany,
  SelectMany,
  SelectOne,
  Text,
} from '../../../../components/ContentField';
import { Field } from '../../../../components/ContentField/Field';
import { useAppSelector } from '../../../../redux/hooks';
import {
  setActionAccess,
  setCanPublish,
  setMandatoryWatchers,
  setName,
  setNavLabel,
  setPublicRules,
  setRootSchemaProperty,
  setWatcherNotices,
  setWithPermissions,
} from '../../../../redux/slices/collectionSlice';
import { capitalize } from '../../../../utils/capitalize';
import { colorType } from '../../../../utils/theme/theme';
import { useConfirmDelete } from '../hooks/useConfirmDelete';
import { getFieldTypes } from './getFieldTypes';

interface OptionsTabProps {}

function OptionsTab(props: OptionsTabProps) {
  const state = useAppSelector(({ collectionConfig }) => collectionConfig);
  const dispatch = useDispatch();
  const [DangerDeleteWindow, openDangerDeleteWindow] = useConfirmDelete({ name: state.collection?.name });

  const publicRules = state.collection?.publicRules;
  const rootSchemaDef = state.collection?.schemaDef;
  const name = state.collection?.name;
  const navLabel = state.collection?.navLabel;
  const canPublish = state.collection?.canPublish;
  const withPermissions = state.collection?.withPermissions;
  const mandatoryWatchers = state.collection?.options?.mandatoryWatchers;
  const watcherNotices = state.collection?.options?.watcherNotices;
  const actionAccess = state.collection?.actionAccess;

  const fieldTypes = getFieldTypes(state.collection?.schemaDef || {}, true);
  const dateFields = fieldTypes.filter(([key, label, type]) => type === 'Date');
  const stringFields = fieldTypes.filter(([key, label, type]) => type === 'String');
  const objectIdFields = fieldTypes.filter(([key, label, type]) => type === 'ObjectId');
  const objectIdsFields = fieldTypes.filter(([key, label, type]) => type === 'ObjectIds');

  const hasSlugField =
    state.collection &&
    isSchemaDef(state.collection.schemaDef.slug) &&
    state.collection.schemaDef.slug.type === 'String';
  const hasStageField = state.collection && isSchemaDef(state.collection.schemaDef.stage);

  const slugDateFieldOptions = dateFields.map(([key, label]) => ({ value: key, label }));
  const stringFieldOptions = stringFields.map(([key, label]) => ({ value: key, label }));
  const userFieldOptions = [...objectIdFields, ...objectIdsFields].map(([key, label]) => ({
    value: key,
    label,
  }));

  // get the stage options from the stage field (if it exists)
  // prefer the column chip options, but fallback to the field options
  const stageFieldOptions =
    state.collection && isSchemaDef(state.collection.schemaDef.stage)
      ? Array.isArray(state.collection.schemaDef.stage.column?.chips)
        ? state.collection.schemaDef.stage.column?.chips.map((opt) => ({
            label: opt.label || `${opt.value}`,
            value: parseFloat(`${opt.value}`),
          }))
        : state.collection.schemaDef.stage.field?.options?.map((opt) => ({
            label: opt.label,
            value: parseFloat(`${opt.value}`),
          }))
      : undefined;

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
                <Code
                  isEmbedded
                  type={'json'}
                  height={140}
                  label={'Filter publicly exposed documents'}
                  description={
                    'Only documents that match the filter will be available for public access. Use the <a href="https://www.mongodb.com/docs/v5.3/tutorial/query-documents/#std-label-read-operations-query-argument">MongoDB query syntax</a> to construct the filter. Use <code>{}</code> for no filter.'
                  }
                  value={JSON.stringify(publicRules.filter || {}, null, 2)}
                  onChange={(value) => {
                    if (value) dispatch(setPublicRules(JSON.parse(value)));
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
                <Field isEmbedded label={'Public fields'}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                    {fieldTypes.map(([key, label], index) => {
                      return (
                        <Checkbox
                          isEmbedded
                          key={index}
                          label={label}
                          style={{ padding: '0 0 6px 0' }}
                          checked={getProperty(rootSchemaDef || {}, key)?.public}
                          onChange={(e) => {
                            dispatch(setRootSchemaProperty(key, 'public', e.currentTarget.checked));
                          }}
                        />
                      );
                    })}
                  </div>
                </Field>
              </>
            </IndentField>
          ) : null}
        </Card>
      ) : null}
      {hasStageField && stageFieldOptions ? (
        <Card>
          <CardLabel>Change notices</CardLabel>
          <Checkbox
            isEmbedded
            label={'Allow users to watch documents for changes'}
            checked={!!watcherNotices}
            onChange={(e) => {
              if (state.collection && hasStageField) {
                if (!e.currentTarget.checked) dispatch(setWatcherNotices(undefined));
                else {
                  // construct the stage map from the options in the stage field
                  const stageMap: Record<number, string> = {};
                  stageFieldOptions.forEach((opt) => {
                    stageMap[opt.value] = opt.label;
                  });
                  dispatch(
                    setWatcherNotices({
                      subjectField: stringFieldOptions[0].value,
                      stageField: 'stage',
                      stageMap: stageMap,
                      fields: [],
                    })
                  );
                  dispatch(setMandatoryWatchers([]));
                }
              }
            }}
          />
          {!!watcherNotices && !!mandatoryWatchers ? (
            <IndentField color={'primary'}>
              <CardLabel style={{ marginTop: 10, fontSize: 14 }}>Configure email alerts</CardLabel>
              <SelectOne
                isEmbedded
                label={'Subject field'}
                description={`The email subject line will include the value of this field.`}
                type={'String'}
                options={stringFieldOptions}
                value={
                  stringFieldOptions.find((a) => a.value === watcherNotices.subjectField) ||
                  stringFieldOptions[0]
                }
                onChange={(opt) => {
                  if (opt) {
                    const copy = JSON.parse(JSON.stringify(watcherNotices));
                    copy.subjectField = opt.value;
                    dispatch(setWatcherNotices(copy));
                  }
                }}
              />
              <SelectMany
                isEmbedded
                label={'Body fields'}
                description={`The value of each of these fields will be included in the email body.`}
                type={'String'}
                options={stringFieldOptions}
                values={
                  stringFieldOptions.filter((opt) =>
                    watcherNotices.fields.find((field) => field.name === opt.value)
                  ) || []
                }
                onChange={(opts) => {
                  if (opts) {
                    const copy = JSON.parse(JSON.stringify(watcherNotices));
                    copy.fields = opts.map((opt) => ({ name: opt.value, label: opt.label }));
                    dispatch(setWatcherNotices(copy));
                  }
                }}
              />
              <SelectMany
                isEmbedded
                label={'Required recipients'}
                description={
                  'Users who are referenced in these document fields are required to receive email alerts.'
                }
                type={'String'}
                options={userFieldOptions}
                values={userFieldOptions.filter((opt) => mandatoryWatchers.includes(opt.value)) || []}
                onChange={(opts) => {
                  if (opts) {
                    dispatch(setMandatoryWatchers(opts.map((opt) => `${opt.value}`).filter((v) => !!v)));
                  }
                }}
              />
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
        {withPermissions ? (
          <IndentField color={'primary'}>
            <ReferenceMany
              isEmbedded
              label={`Teams with default access`}
              values={
                state.collection?.schemaDef.permissions &&
                isSchemaDefOrType(state.collection.schemaDef.permissions) &&
                !isSchemaDef(state.collection.schemaDef.permissions) &&
                isSchemaDef(state.collection.schemaDef.permissions.teams) &&
                Array.isArray(state.collection.schemaDef.permissions.teams.default || [])
                  ? // @ts-expect-error default is an array
                    (state.collection.schemaDef.permissions.teams.default || []).map((value) =>
                      value === 0
                        ? { _id: 'any', label: 'Any team' }
                        : {
                            _id: `${value}`,
                          }
                    )
                  : []
              }
              injectOptions={[{ value: 'any', label: 'Any team' }]}
              collection={'Team'}
              onChange={(newValues) => {
                if (newValues !== undefined) {
                  if (
                    !state.collection?.schemaDef.permissions ||
                    !isSchemaDefOrType(state.collection.schemaDef.permissions) ||
                    (!isSchemaDef(state.collection.schemaDef.permissions) &&
                      !state.collection.schemaDef.permissions.teams)
                  ) {
                    dispatch(setRootSchemaProperty('permissions.teams', 'type', ['ObjectId']));
                    dispatch(setRootSchemaProperty('permissions.teams', 'required', true));
                  }
                  dispatch(
                    setRootSchemaProperty(
                      'permissions.teams',
                      'default',
                      newValues.map((val) => (val._id === 'any' ? 0 : val._id))
                    )
                  );
                }
              }}
            />
            <ReferenceMany
              isEmbedded
              label={`Users with default access`}
              values={
                state.collection?.schemaDef.permissions &&
                isSchemaDefOrType(state.collection.schemaDef.permissions) &&
                !isSchemaDef(state.collection.schemaDef.permissions) &&
                isSchemaDef(state.collection.schemaDef.permissions.users) &&
                Array.isArray(state.collection.schemaDef.permissions.users.default || [])
                  ? // @ts-expect-error default is an array
                    (state.collection.schemaDef.permissions.users.default || []).map((value) =>
                      value === 0
                        ? { _id: 'any', label: 'Any user' }
                        : {
                            _id: `${value}`,
                          }
                    )
                  : []
              }
              injectOptions={[{ value: 'any', label: 'Any user' }]}
              collection={'Team'}
              onChange={(newValues) => {
                if (newValues !== undefined) {
                  if (
                    !state.collection?.schemaDef.permissions ||
                    !isSchemaDefOrType(state.collection.schemaDef.permissions) ||
                    (!isSchemaDef(state.collection.schemaDef.permissions) &&
                      !state.collection.schemaDef.permissions.users)
                  ) {
                    dispatch(setRootSchemaProperty('permissions.users', 'type', ['ObjectId']));
                    dispatch(setRootSchemaProperty('permissions.users', 'required', true));
                  }
                  dispatch(
                    setRootSchemaProperty(
                      'permissions.users',
                      'default',
                      newValues.map((val) => (val._id === 'any' ? 0 : val._id))
                    )
                  );
                }
              }}
            />
          </IndentField>
        ) : null}
      </Card>
      <Card>
        <CardLabel>Action access</CardLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {(
            [
              'get',
              'create',
              'modify',
              'hide',
              'lock',
              'watch',
              'archive',
              'delete',
              canPublish ? 'publish' : null,
              'bypassDocPermissions',
            ] as unknown as CollectionPermissionsActions[]
          )
            .filter((a) => !!a)
            .map((action) => {
              return (
                <Card key={'action'} noMargin>
                  <CardLabel>{capitalize(action)}</CardLabel>
                  <ReferenceMany
                    isEmbedded
                    label={`Users`}
                    values={
                      actionAccess?.[action]?.users.map((user) =>
                        user === 0 ? { _id: 'any', label: 'Any user' } : { _id: user }
                      ) || []
                    }
                    injectOptions={[{ value: 'any', label: 'Any user' }]}
                    collection={'User'}
                    onChange={(newValues) => {
                      const current = actionAccess?.[action];
                      if (newValues !== undefined && current) {
                        dispatch(
                          setActionAccess(action, {
                            users: newValues.map((value) => (value._id === 'any' ? 0 : value._id)),
                            teams: current.teams,
                          })
                        );
                      }
                    }}
                  />
                  <ReferenceMany
                    isEmbedded
                    label={`Teams`}
                    values={
                      actionAccess?.[action]?.teams.map((team) =>
                        team === 0 ? { _id: 'any', label: 'Any team' } : { _id: team }
                      ) || []
                    }
                    injectOptions={[{ value: 'any', label: 'Any team' }]}
                    collection={'Team'}
                    onChange={(newValues) => {
                      const current = actionAccess?.[action];
                      if (newValues !== undefined && current) {
                        dispatch(
                          setActionAccess(action, {
                            users: current.users,
                            teams: newValues.map((value) => (value._id === 'any' ? 0 : value._id)),
                          })
                        );
                      }
                    }}
                  />
                </Card>
              );
            })}
        </div>
      </Card>
      <Card>
        <CardLabel>Danger zone</CardLabel>
        {DangerDeleteWindow}
        <Button color={'red'} onClick={openDangerDeleteWindow}>
          Delete this collection
        </Button>
      </Card>
    </div>
  );
}

const Card = styled.div<{ noMargin?: boolean }>`
  margin: ${({ noMargin }) => (noMargin ? 0 : 16)}px 0;
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
