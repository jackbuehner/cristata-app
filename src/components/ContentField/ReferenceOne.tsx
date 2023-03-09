import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Dismiss24Regular, Open24Regular } from '@fluentui/react-icons';
import type { FieldDef } from '@jackbuehner/cristata-generator-schema';
import Color from 'color';
import pluralize from 'pluralize';
import { useEffect, useState } from 'react';
import { capitalize } from '../../utils/capitalize';
import type { colorType, themeType } from '../../utils/theme/theme';
import { buttonEffect } from '../Button';
import { Combobox } from './';
import type { FieldProps } from './Field';
import { Field } from './Field';
import { populateReferenceValues } from './populateReferenceValues';
import { useOptions } from './useOptions';

import { openWindow } from '$utils/openWindow';
import * as apolloRaw from '@apollo/client';
const { useApolloClient } = ((apolloRaw as any).default ?? apolloRaw) as typeof apolloRaw;

interface ReferenceOneProps extends Omit<FieldProps, 'children'> {
  value: UnpopulatedValue | null;
  onChange?: (newValues: PopulatedValue | null) => void;
  disabled?: boolean;
  /**
   * Singular collection name.
   */
  collection: string;
  reference?: FieldDef['reference'];
}

type UnpopulatedValue = { _id: string; label?: string };
type PopulatedValue = { _id: string; label: string };

function ReferenceOne({ onChange, ...props }: ReferenceOneProps) {
  const [textValue, setTextValue, { options, loading }] = useOptions(props.collection, props.reference);
  const theme = useTheme() as themeType;
  const client = useApolloClient();
  const tenant = location.pathname.split('/')[1];

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
        _setInternalState(
          (await populateReferenceValues(client, [props.value], props.collection, props.reference?.fields))[0]
        );
      }
    })();
  }, [client, internalState, props.collection, props.reference?.fields, props.value]);

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
            <IconWrapper
              theme={theme}
              color={props.color || 'primary'}
              disabled={false}
              onClick={() => {
                if (isURL(internalState._id)) {
                  openWindow(internalState._id, props.collection + internalState._id, 'location=no');
                } else if (props.collection.toLowerCase() === 'user') {
                  openWindow(
                    `/${tenant}/profile/${internalState._id}`,
                    props.collection + internalState._id,
                    'location=no'
                  );
                } else if (props.collection.toLowerCase() === 'team') {
                  openWindow(
                    `/${tenant}/teams/${internalState._id}`,
                    props.collection + internalState._id,
                    'location=no'
                  );
                } else if (props.collection.toLowerCase() === 'photo') {
                  openWindow(
                    `/${tenant}/cms/photo/library/${internalState._id}`,
                    props.collection + internalState._id,
                    'location=no'
                  );
                } else {
                  openWindow(
                    `/${tenant}/cms/collection/${pluralize(props.collection.toLowerCase())}/${
                      internalState._id
                    }`,
                    props.collection + internalState._id,
                    'location=no'
                  );
                }
              }}
            >
              <Open24Regular />
            </IconWrapper>
            <IconWrapper
              theme={theme}
              color={props.color || 'primary'}
              disabled={false}
              onClick={() => {
                setInternalState(null);
              }}
            >
              <Dismiss24Regular />
            </IconWrapper>
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
              // get value without children because the children contain circular references
              const { children, ...firstValue } = values[0];
              setInternalState({
                ...firstValue,
                _id: firstValue.value.toString(),
                label: firstValue.label,
              });
            }}
            onTextChange={(value) => setTextValue(value)}
            notFoundContent={
              loading && textValue ? 'Loading...' : !textValue ? 'Start typing to search.' : undefined
            }
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
      : Color('#ffffff').darken(0.03).string()};
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

const IconWrapper = styled.span<{ theme: themeType; color: colorType; disabled?: boolean }>`
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

export { ReferenceOne };
