import styled from '@emotion/styled/macro';
import Color from 'color';
import { Button } from '../../../../components/Button';
import { Checkbox, SelectOne, Text } from '../../../../components/ContentField';
import { useAppDispatch, useAppSelector } from '../../../../redux/hooks';
import { setCustomMutations, setDefaultMutationOption } from '../../../../redux/slices/collectionSlice';
import { colorType } from '../../../../utils/theme/theme';
import { uncapitalize } from '../../../../utils/uncapitalize';
import { getFieldTypes } from './getFieldTypes';

function MutationsTab() {
  const state = useAppSelector(({ collectionConfig }) => collectionConfig);
  const dispatch = useAppDispatch();

  const name = state.collection?.name;
  const customMutations = state.collection?.customMutations;
  const disableCreateMutation = state.collection?.options?.disableCreateMutation;
  const disableModifyMutation = state.collection?.options?.disableModifyMutation;
  const disableHideMutation = state.collection?.options?.disableHideMutation;
  const disableArchiveMutation = state.collection?.options?.disableArchiveMutation;
  const disableLockMutation = state.collection?.options?.disableLockMutation;
  const disableWatchMutation = state.collection?.options?.disableWatchMutation;
  const disableDeleteMutation = state.collection?.options?.disableDeleteMutation;
  const disablePublishMutation = state.collection?.options?.disablePublishMutation;

  const fieldTypes = getFieldTypes(state.collection?.schemaDef || {});

  const actionOptions = [{ label: 'Increment', value: 'inc' }];
  const incActionTypes = fieldTypes.filter(([key, label, type]) => type === 'Number' || type === 'Int');
  const incActionOptions = incActionTypes.map(([key, label]) => ({ value: key, label }));

  return (
    <div style={{ margin: 20 }}>
      <Card>
        <CardLabel>Default mutations</CardLabel>
        <Checkbox
          isEmbedded
          label={`Disable Create mutation`}
          checked={disableCreateMutation}
          onChange={(e) => dispatch(setDefaultMutationOption('disableCreateMutation', e.currentTarget.checked))}
        />
        <Checkbox
          isEmbedded
          label={`Disable Modify mutation`}
          checked={disableModifyMutation}
          onChange={(e) => dispatch(setDefaultMutationOption('disableModifyMutation', e.currentTarget.checked))}
        />
        <Checkbox
          isEmbedded
          label={`Disable Hide mutation`}
          checked={disableHideMutation}
          onChange={(e) => dispatch(setDefaultMutationOption('disableHideMutation', e.currentTarget.checked))}
        />
        <Checkbox
          isEmbedded
          label={`Disable Archive mutation`}
          checked={disableArchiveMutation}
          onChange={(e) =>
            dispatch(setDefaultMutationOption('disableArchiveMutation', e.currentTarget.checked))
          }
        />
        <Checkbox
          isEmbedded
          label={`Disable Lock mutation`}
          checked={disableLockMutation}
          onChange={(e) => dispatch(setDefaultMutationOption('disableLockMutation', e.currentTarget.checked))}
        />
        <Checkbox
          isEmbedded
          label={`Disable Watch mutation`}
          checked={disableWatchMutation}
          onChange={(e) => dispatch(setDefaultMutationOption('disableWatchMutation', e.currentTarget.checked))}
        />
        <Checkbox
          isEmbedded
          label={`Disable Delete mutation`}
          checked={disableDeleteMutation}
          onChange={(e) => dispatch(setDefaultMutationOption('disableDeleteMutation', e.currentTarget.checked))}
        />
        <Checkbox
          isEmbedded
          label={`Disable Publish mutation`}
          checked={disablePublishMutation}
          onChange={(e) =>
            dispatch(setDefaultMutationOption('disablePublishMutation', e.currentTarget.checked))
          }
        />
      </Card>
      <Card>
        <CardLabel>Custom mutations</CardLabel>
        {incActionTypes.length < 1 ? (
          <CardLabelCaption>
            No fields were found that are compatable with currently available custom mutations.
          </CardLabelCaption>
        ) : null}
        {customMutations?.map((cm, index, arr) => {
          if (cm) {
            return (
              <Card color={'primary'}>
                <Text
                  isEmbedded
                  label={`Name‗‗${index}`}
                  description={`camelCase name of the custom mutation.
                    The mutation name will be capitalized and the name of the collection will be prepended to the mutation name.
                    For example, <code>myCustomMutation</code> becomes <code>${uncapitalize(
                      name || ''
                    )}MyCustomMutation</code>.
                  `}
                  value={cm.name}
                  onChange={(e) => {
                    const copy = JSON.parse(JSON.stringify(arr));
                    copy[index].name = e.currentTarget.value;
                    dispatch(setCustomMutations(copy));
                  }}
                />
                <Text
                  isEmbedded
                  label={`Description‗‗${index}`}
                  description={`The description of the mutation. Be sure to use a helpful description so someone else can know what this mutation does. Can be seen in GraphQL introspection.`}
                  value={cm.description}
                  onChange={(e) => {
                    const copy = JSON.parse(JSON.stringify(arr));
                    copy[index].description = e.currentTarget.value;
                    dispatch(setCustomMutations(copy));
                  }}
                />
                <SelectOne
                  isEmbedded
                  label={`Action‗‗${index}`}
                  description={'The action performed by this query'}
                  type={'String'}
                  options={actionOptions}
                  value={
                    actionOptions.find((a) => a.value === Object.keys(cm.action)[0] || 'inc') ||
                    actionOptions[0]
                  }
                  onChange={(value) => {
                    if (value) {
                      const copy = JSON.parse(JSON.stringify(arr));
                      copy[index].action = { [value.value]: ['', ''] };
                      dispatch(setCustomMutations(copy));
                    }
                  }}
                />
                {cm.action?.inc ? (
                  <IndentField color={'primary'}>
                    <SelectOne
                      isEmbedded
                      label={`Field to increment‗‗${index}`}
                      description={'Increment any numeric field by one (1).'}
                      type={'String'}
                      options={incActionOptions}
                      value={
                        incActionOptions.find((a) => a.value === Object.keys(cm.action.inc)[0] || 'inc') ||
                        incActionOptions[0]
                      }
                      onChange={(value) => {
                        if (value) {
                          const valueType = incActionTypes.find(
                            ([key, label, type]) => key === value.value
                          )?.[2];
                          if (valueType) {
                            const copy = JSON.parse(JSON.stringify(arr));
                            copy[index].action.inc = [value.value, valueType === 'Number' ? 'Int' : valueType];
                            dispatch(setCustomMutations(copy));
                          }
                        }
                      }}
                    />
                  </IndentField>
                ) : null}
                <Button
                  onClick={() => {
                    const copy = JSON.parse(JSON.stringify(arr));
                    delete copy[index];
                    dispatch(setCustomMutations(copy));
                  }}
                >
                  Remove custom mutation
                </Button>
              </Card>
            );
          }
          return null;
        })}
        <Button
          disabled={incActionTypes.length < 1}
          onClick={() => {
            const newM = {
              name: 'customMutation',
              description: 'A description for a custom mutation',
              action: {
                inc: [
                  incActionTypes[0][0],
                  incActionTypes[0][2] === 'Number' ? 'Int' : incActionTypes[0][2],
                ] as [string, string],
              },
            };
            if (!customMutations) dispatch(setCustomMutations([newM]));
            else dispatch(setCustomMutations([...customMutations, newM]));
          }}
        >
          Add custom mutation
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

const CardLabelCaption = styled.div`
  line-height: 15px;
  font-family: ${({ theme }) => theme.font.detail};
  font-size: 13px;
  font-variant-numeric: lining-nums;
  font-weight: 500;
  color: ${({ theme }) => theme.color.neutral[theme.mode][1100]};
  margin: -12px 0 16px 0;
  user-select: none;
`;

const IndentField = styled.div<{ color: colorType }>`
  padding: 10px;
  margin-left: 28px;
  margin-bottom: 10px;
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

export { MutationsTab };
