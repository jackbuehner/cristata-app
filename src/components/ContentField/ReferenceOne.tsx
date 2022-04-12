import { gql } from '@apollo/client';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled/macro';
import { Dismiss24Regular, Open24Regular } from '@fluentui/react-icons';
import Color from 'color';
import pluralize from 'pluralize';
import { useEffect, useState } from 'react';
import { Combobox } from '.';
import { client } from '../../graphql/client';
import { capitalize } from '../../utils/capitalize';
import { colorType, themeType } from '../../utils/theme/theme';
import { buttonEffect } from '../Button';
import { Field, FieldProps } from './Field';
import { populateReferenceValues } from './populateReferenceValues';

interface ReferenceOneProps extends Omit<FieldProps, 'children'> {
  value: UnpopulatedValue | null;
  onChange?: (newValues: PopulatedValue | null) => void;
  disabled?: boolean;
  /**
   * Singular collection name.
   */
  collection: string;
  fields?: { _id?: string; name?: string };
}

type UnpopulatedValue = { _id: string; label?: string };
type PopulatedValue = { _id: string; label: string };

function ReferenceOne({ onChange, ...props }: ReferenceOneProps) {
  const theme = useTheme() as themeType;

  const [internalState, _setInternalState] = useState<PopulatedValue | null>(null);
  const setInternalState = (newState: PopulatedValue | null) => {
    _setInternalState(newState);
    onChange?.(newState);
  };

  // keep internal state in sync with changes made by parent
  useEffect(() => {
    (async () => {
      if (props.value === null) _setInternalState(null);
      else if (internalState === null || props.value._id !== internalState._id) {
        _setInternalState((await populateReferenceValues([props.value], props.collection, props.fields))[0]);
      }
    })();
  }, [internalState, props.collection, props.fields, props.value]);

  const [textValue, setTextValue] = useState<string>('');
  const [options, setOptions] = useState<{ value: string; label: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  useEffect(() => {
    setLoading(true);
    setOptions([]);
    const query = client.watchQuery<{ result: { docs: { value: string; label: string }[] } }>({
      query: gql`{
            result: ${pluralize(props.collection).toLowerCase()}(limit: 6, filter: "{ \\\"${
        props.fields?.name || 'name'
      }\\\": { \\\"$regex\\\": \\\"${textValue}\\\", \\\"$options\\\": \\\"i\\\" } }") {
              docs {
                value: ${props.fields?._id || '_id'}
                label: ${props.fields?.name || 'name'}
              }
            }
          }`,
      fetchPolicy: 'no-cache',
    });

    const observable = query.subscribe(({ data }) => {
      setOptions(data.result.docs);
      setLoading(false);
    });

    return () => observable.unsubscribe();
  }, [props.collection, props.fields?._id, props.fields?.name, textValue]);

  return (
    <Field
      label={props.label}
      description={props.description}
      color={props.color}
      font={props.font}
      isEmbedded={props.isEmbedded}
    >
      <div style={{ position: 'relative' }}>
        {internalState ? (
          <SelectItem theme={theme}>
            <SelectContent>
              <SelectText theme={theme} font={props.font}>
                {internalState.label}
              </SelectText>
              <SelectText theme={theme} font={props.font}>
                {capitalize(props.collection)} ID:{' '}
                {
                  // if the ID is a URL, use everything after the first '/' in the URL (exlcuding the protocol)
                  isURL(internalState._id)
                    ? internalState._id.replace('://', '').split('/')[1]
                    : internalState._id
                }
              </SelectText>
            </SelectContent>
            <OpenIcon
              theme={theme}
              color={props.color || 'primary'}
              disabled={false}
              onClick={() => {
                if (isURL(internalState._id)) {
                  window.open(internalState._id, props.collection + internalState._id, 'location=no');
                } else if (props.collection.toLowerCase() === 'user') {
                  window.open(
                    `/profile/${internalState._id}`,
                    props.collection + internalState._id,
                    'location=no'
                  );
                } else if (props.collection.toLowerCase() === 'team') {
                  window.open(
                    `/teams/${internalState._id}`,
                    props.collection + internalState._id,
                    'location=no'
                  );
                } else if (props.collection.toLowerCase() === 'photo') {
                  window.open(
                    `/cms/photo/library/${internalState._id}`,
                    props.collection + internalState._id,
                    'location=no'
                  );
                } else {
                  window.open(
                    `/cms/collection/${pluralize(props.collection.toLowerCase())}/item/${internalState._id}`,
                    props.collection + internalState._id,
                    'location=no'
                  );
                }
              }}
            />
            <RemoveIcon
              theme={theme}
              color={props.color || 'primary'}
              disabled={false}
              onClick={() => {
                setInternalState(null);
              }}
            />
          </SelectItem>
        ) : (
          <Combobox
            label={props.label}
            description={props.description}
            disabled={props.disabled}
            options={options}
            values={[]}
            many={true}
            color={props.color}
            font={props.font}
            onChange={(values) => {
              setInternalState({ _id: values[0].value.toString(), label: values[0].label });
            }}
            onTextChange={(value) => setTextValue(value)}
            notFoundContent={loading && textValue ? 'Loading...' : undefined}
          />
        )}
      </div>
    </Field>
  );
}

function isURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

const SelectItem = styled.div<{ theme: themeType }>`
  display: flex;
  flex-direction: row;
  align-items: stretch;
  margin-bottom: 6px;
  box-shadow: ${({ theme }) => theme.color.neutral[theme.mode][200]} 0px 0px 0px 1px inset;
  background-color: ${({ theme }) =>
    theme.mode === 'dark'
      ? Color(theme.color.neutral.dark[100]).lighten(0.2).string()
      : Color('#ffffff').darken(0.2).string()};
  border-radius: ${({ theme }) => theme.radius};
  color: ${({ theme }) => theme.color.neutral[theme.mode][1400]};
`;

const SelectContent = styled.div`
  flex-grow: 1;
`;

const SelectText = styled.div<{ theme: themeType; font?: keyof themeType['font'] }>`
  font-family: ${({ theme, font }) => theme.font[font ? font : 'detail']};
  font-size: 14px;
  font-variant-numeric: lining-nums;
  line-height: 16px;
  padding: 0 10px;
  flex-wrap: nowrap;
  word-break: break-word;
  &:first-of-type {
    padding-top: 10px;
  }
  &:last-of-type {
    padding-bottom: 10px;
    font-size: 11px;
    color: ${({ theme }) => theme.color.neutral[theme.mode][1000]};
  }
`;

const RemoveIcon = styled(Dismiss24Regular)<{ theme: themeType; color: colorType; disabled?: boolean }>`
  ${({ color, theme, disabled }) =>
    buttonEffect(color, theme.mode === 'light' ? 700 : 300, theme, disabled, { base: 'transparent' })}
  border: none !important;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  justify-content: center;
  width: 34px;
  min-height: 36px;
  margin: 0 1px 0 0;
  border-left: 1px solid ${({ theme }) => theme.color.neutral[theme.mode][200]};
  border-radius: ${({ theme }) => theme.radius};
  > svg {
    width: 16px;
    height: 16px;
  }
`;

const OpenIcon = RemoveIcon.withComponent(Open24Regular);

export { ReferenceOne };
