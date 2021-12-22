import { useTheme } from '@emotion/react';
import styled from '@emotion/styled/macro';
import { themeType } from '../../utils/theme/theme';

interface ITextInputBase {
  font?: 'headline' | 'body' | 'detail';
  isDisabled?: boolean;
  lineHeight?: string;
  textColor?: { default: string; focused: string };
  backgroundColor?: { default: string; focused: string };
  borderColor?: { default: string; hovered: string; focused: string };
}

interface ITextInputComponent extends ITextInputBase {
  theme: themeType;
}

interface ITextInput extends ITextInputBase {
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  value?: string;
  name?: string;
  title?: string;
  id?: string;
  placeholder?: string;
  type?: 'text' | 'number' | 'password';
}

const TextInputComponent = styled.input<ITextInputComponent>`
  padding: 8px;
  line-height: ${({ lineHeight }) => lineHeight || '16px'};
  background-color: ${({ backgroundColor }) => backgroundColor?.default || 'transparent'};
  color: ${({ textColor, theme }) => textColor?.default || theme.color.neutral[theme.mode][1400]};
  width: 100%;
  box-sizing: border-box;
  border-radius: ${({ theme }) => theme.radius};
  border: none;
  appearance: none; /* override native appearance (safari fix) */
  box-shadow: ${({ borderColor, theme }) => borderColor?.default || theme.color.neutral[theme.mode][800]} 0px
    0px 0px 1px inset;
  transition: box-shadow 240ms;
  font-family: ${({ theme, font }) => theme.font[font ? font : 'detail']};
  font-size: 14px;
  font-variant-numeric: lining-nums;
  &:hover {
    box-shadow: ${({ borderColor, theme }) => borderColor?.hovered || theme.color.neutral[theme.mode][1000]} 0px
      0px 0px 1px inset;
  }
  &:focus {
    outline: none;
    box-shadow: ${({ borderColor, theme }) => borderColor?.focused || theme.color.primary[800]} 0px 0px 0px 2px
      inset;
    background-color: ${({ backgroundColor }) => backgroundColor?.focused || '#ffffff'};
    color: ${({ textColor, theme }) => textColor?.focused || theme.color.neutral['light'][1400]};
  }
`;

function TextInput(props: ITextInput) {
  const theme = useTheme() as themeType;
  return (
    <TextInputComponent
      theme={theme}
      font={props.font}
      onFocus={props.onFocus}
      onChange={props.onChange}
      onBlur={props.onBlur}
      onKeyPress={props.onKeyPress}
      value={props.value}
      name={props.name}
      title={props.title}
      id={props.id}
      placeholder={props.placeholder}
      disabled={props.isDisabled}
      type={props.type || 'text'}
      lineHeight={props.lineHeight}
      textColor={props.textColor}
      backgroundColor={props.backgroundColor}
      borderColor={props.borderColor}
    />
  );
}

export { TextInput };
