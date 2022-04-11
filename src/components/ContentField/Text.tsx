import { useTheme } from '@emotion/react';
import styled from '@emotion/styled/macro';
import { RefObject, TextareaHTMLAttributes, useEffect, useRef } from 'react';
import { colorType, themeType } from '../../utils/theme/theme';
import { Field, FieldProps } from './Field';

interface TextProps extends Omit<FieldProps, 'children'>, TextareaHTMLAttributes<HTMLTextAreaElement> {
  color?: colorType;
  font?: keyof themeType['font'];
  ref?: RefObject<HTMLTextAreaElement>;
}

function Text(props: TextProps) {
  const theme = useTheme() as themeType;
  const inputRef = useRef<HTMLTextAreaElement>(props.ref?.current || null);

  //make sure that the textarea height matches the content
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = `auto`;
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [props.value]);

  return (
    <Field
      label={props.label}
      description={props.description}
      color={props.color}
      font={props.font}
      isEmbedded={props.isEmbedded}
    >
      <TextInputComponent
        {...props}
        id={props.label.replaceAll(' ', '-')}
        ref={inputRef}
        theme={theme}
        rows={props.rows || 1}
        draggable={false}
        onKeyDown={(e) => {
          // prevent line breaks
          if (e.key === 'Enter') {
            e.preventDefault();
          }
          props.onKeyDown?.(e);
        }}
      />
    </Field>
  );
}

const TextInputComponent = styled.textarea<{
  theme: themeType;
  color?: colorType;
  font?: keyof themeType['font'];
}>`
  resize: none;
  padding: 10px 8px;
  line-height: 16px;
  background-color: transparent;
  color: ${({ theme }) => theme.color.neutral[theme.mode][1400]};
  width: 100%;
  box-sizing: border-box;
  border-radius: ${({ theme }) => theme.radius};
  border: none;
  appearance: none; /* override native appearance (safari fix) */
  box-shadow: ${({ theme }) => theme.color.neutral[theme.mode][400]} 0px 0px 0px 1px inset;
  transition: box-shadow 240ms;
  font-family: ${({ theme, font }) => theme.font[font ? font : 'detail']};
  font-size: 14px;
  font-variant-numeric: lining-nums;
  &:hover {
    box-shadow: ${({ theme }) => theme.color.neutral[theme.mode][1000]} 0px 0px 0px 1px inset;
  }
  &:focus {
    outline: none;
    box-shadow: ${({ theme, color }) => {
        if (color === 'neutral') color = undefined;
        return theme.color[color || 'primary'][theme.mode === 'dark' ? 300 : 800];
      }}
      0px 0px 0px 2px inset;
  }
`;

export { Text };
