import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { themeType } from '../../utils/theme/theme';

interface ITextInputBase {
  font?: 'headline' | 'body' | 'detail';
}

interface ITextInputComponent extends ITextInputBase {
  theme: themeType;
}

interface ITextInput extends ITextInputBase {
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value?: string;
  name?: string;
  title?: string;
  id?: string;
  placeholder?: string;
}

const TextInputComponent = styled.input<ITextInputComponent>`
  padding: 8px;
  line-height: 1.2;
  width: 100%;
  box-sizing: border-box;
  border-radius: ${({ theme }) => theme.radius};
  border: none;
  box-shadow: ${({ theme }) => theme.color.neutral[theme.mode][800]} 0px 0px 0px 1px inset;
  transition: box-shadow 240ms;
  font-family: ${({ theme, font }) => theme.font[font ? font : 'detail']};
  font-size: 14px;
  font-variant-numeric: lining-nums;
  &:hover {
    box-shadow: ${({ theme }) => theme.color.neutral[theme.mode][1000]} 0px 0px 0px 1px inset;
  }
  &:focus {
    outline: none;
    box-shadow: ${({ theme }) => theme.color.primary[800]} 0px 0px 0px 2px inset;
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
      value={props.value}
      name={props.name}
      title={props.title}
      id={props.id}
      placeholder={props.placeholder}
    />
  );
}

export { TextInput };
