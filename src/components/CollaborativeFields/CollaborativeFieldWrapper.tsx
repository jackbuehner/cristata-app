import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import dompurify from 'dompurify';
import { get as getProperty } from '$utils/objectPath';
import type { CSSProperties } from 'react';
import { useEffect, useState } from 'react';
import ReactTooltip from 'react-tooltip';
import type { colorType, themeType } from '../../utils/theme/theme';
import type { useAwareness } from '../Tiptap/hooks';
import type { FieldY } from '../Tiptap/hooks/useY';

interface CollaborativeFieldWrapperProps {
  y: FieldY;
  children: React.ReactElement;
  label: string;
  description?: string;
  color?: colorType;
  font?: keyof themeType['font'];
  isEmbedded?: boolean;
  style?: CSSProperties;
  labelRowStyle?: CSSProperties;
  labelStyle?: CSSProperties;
  childWrapperStyle?: CSSProperties;
  disabled?: boolean;
}

function CollaborativeFieldWrapper(props: CollaborativeFieldWrapperProps) {
  const theme = useTheme() as themeType;

  const { field: yFieldName, wsProvider, user } = props.y;

  const handleFocus = () => {
    const focused = new Set((user?.__focused as string[]) || []);
    focused.add(yFieldName);
    wsProvider?.awareness.setLocalStateField('focused', Array.from(focused));
  };

  const handleBlur = () => {
    const focused = new Set((user?.__focused as string[]) || []);
    focused.delete(yFieldName);
    wsProvider?.awareness.setLocalStateField('focused', Array.from(focused));
  };

  // the users who have declared that they are focused on this field
  const [focusedUsers, setFocusedUsers] = useState<ReturnType<typeof useAwareness>>([]);
  useEffect(() => {
    if (wsProvider) {
      const listener = () => {
        const allAwarenessValues: ReturnType<typeof useAwareness> = Array.from(
          wsProvider.awareness.getStates().values()
        )
          .filter((value) => value.user)
          .map((value) => ({ ...value.user, __focused: value.focused || [] }));

        let awareness: ReturnType<typeof useAwareness> = [];
        allAwarenessValues.forEach((value: ReturnType<typeof useAwareness>[0]) => {
          // check whether session id is unique
          const isUnique = awareness.findIndex((session) => session.sessionId === value.sessionId) === -1;

          // check if focused on this field
          const isFocused = (getProperty(JSON.parse(JSON.stringify(value)), '__focused') as string[]).includes(
            yFieldName
          );

          // check that the value does not represent this client
          const isThisClient = value.sessionId === sessionStorage.getItem('sessionId');

          // only push to final awareness array if the session is unique and it is focused on this field
          // (also do not show current client's focus)
          if (isUnique && isFocused && !isThisClient) {
            awareness.push(value);
          }
        });

        setFocusedUsers(awareness);
      };
      wsProvider.awareness.on('change', listener);

      return () => wsProvider?.awareness.off('change', listener);
    }
  }, [wsProvider, yFieldName]);

  return (
    <CollaborativeFieldWrapperComponent
      theme={theme}
      isInSelect={props.label === '__in-select' || props.label === '__in-combobox'}
      isEmbedded={props.isEmbedded}
      style={props.style}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      {props.label !== '__in-select' && props.label !== '__in-combobox' ? (
        <div style={props.labelRowStyle}>
          <LabelRow theme={theme}>
            <Label
              theme={theme}
              font={props.font}
              style={props.labelStyle}
              htmlFor={props.label.replaceAll(' ', '-')}
            >
              {props.label}{' '}
              {focusedUsers.map((user, index) => (
                <FocusBullet key={index} user={user} />
              ))}
            </Label>
          </LabelRow>
          {props.description ? (
            <Description
              theme={theme}
              dangerouslySetInnerHTML={{ __html: dompurify.sanitize(props.description) }}
              disabled={props.disabled || false}
              color={props.color}
            />
          ) : null}
        </div>
      ) : null}
      <div style={props.childWrapperStyle}>{props.children}</div>
    </CollaborativeFieldWrapperComponent>
  );
}

const FocusBullet = ({ user }: { user: ReturnType<typeof useAwareness>[0] }) => {
  useEffect(() => {
    ReactTooltip.rebuild();
  }, [user]);

  return (
    <svg
      viewBox='0 0 100 100'
      xmlns='http://www.w3.org/2000/svg'
      fill={user.color}
      data-tip={user.name + ' is here'}
      width='8'
      height='8'
      style={{ marginLeft: 3 }}
    >
      <circle cx='50' cy='50' r='50' />
    </svg>
  );
};

const CollaborativeFieldWrapperComponent = styled.div<{
  theme: themeType;
  color?: colorType;
  isInSelect: boolean;
  isEmbedded?: boolean;
}>`
  padding: ${({ isInSelect, isEmbedded }) => (isInSelect ? `0` : `2px 0 12px ${isEmbedded ? '0' : '20px'}`)};
  margin: ${({ isInSelect, isEmbedded }) => (isInSelect ? `0` : `0 0 ${isEmbedded ? '0' : '16px'} 0`)};
  border-left: ${({ isInSelect, isEmbedded }) => (isInSelect || isEmbedded ? `0` : `2px`)} solid;
  border-left-color: ${({ theme }) => theme.color.neutral[theme.mode][300]};
  transition: border-left-color 240ms;
  &:focus-within {
    border-left-color: ${({ theme, color }) => {
      if (color === 'neutral') color = undefined;
      return theme.color[color || 'primary'][theme.mode === 'dark' ? 300 : 800];
    }};
  }
`;

const Label = styled.label<{ theme: themeType; font?: keyof themeType['font'] }>`
  line-height: 20px;
  font-family: ${({ theme, font }) => theme.font[font ? font : 'detail']};
  font-size: 13px;
  font-variant-numeric: lining-nums;
  font-weight: 500;
  color: ${({ theme }) => theme.color.neutral[theme.mode][1200]};
  margin: 0 0 10px 0;
  user-select: none;
`;

const Description = styled.div<{
  theme: themeType;
  font?: keyof themeType['font'];
  disabled: boolean;
  color?: colorType;
}>`
  line-height: 16px;
  font-family: ${({ theme, font }) => theme.font[font ? font : 'detail']};
  font-size: 13px;
  font-variant-numeric: lining-nums;
  font-weight: 400;
  color: ${({ disabled, theme }) =>
    disabled ? theme.color.neutral[theme.mode][600] : theme.color.neutral[theme.mode][1100]};
  a {
    color: ${({ disabled, theme, color }) => {
      if (disabled) return theme.color.neutral[theme.mode][600];
      if (color === 'neutral') color = undefined;
      return theme.color[color || 'primary'][theme.mode === 'dark' ? 300 : 800];
    }};
  }
  margin: -6px 0 14px 0;
  white-space: pre-line;
`;

const LabelRow = styled.div<{ theme: themeType }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

export type { CollaborativeFieldWrapperProps };
export { CollaborativeFieldWrapper };
