import { useTheme } from '@emotion/react';
import styled from '@emotion/styled/macro';
import { themeType } from '../../utils/theme/theme';

interface ICheckbox {
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isChecked?: boolean;
  name?: string;
  title?: string;
  id?: string;
  isDisabled?: boolean;
}

function Checkbox(props: ICheckbox) {
  const theme = useTheme() as themeType;
  return (
    <Component
      theme={theme}
      type={'checkbox'}
      defaultChecked={props.isChecked}
      onChange={props.onChange}
      name={props.name}
      title={props.title}
      id={props.id}
    />
  );
}

const Component = styled.input<{ theme: themeType }>`
  height: 18px;
  width: 18px;
  margin: 0;
  border-radius: ${({ theme }) => theme.radius};
  &::before {
    content: '';
    box-shadow: inset 0 0 0 1px #b5b5b5;
    background-color: #fff;
    height: 18px;
    width: 18px;
    margin: 0;
    display: block;
    border-radius: ${({ theme }) => theme.radius};
  }
  &:hover::before,
  &:checked:hover::before {
    box-shadow: inset 0 0 0 1px #121212;
  }
  &:checked:hover::before {
    box-shadow: inset 0 0 0 2px #121212;
  }
  &:active::before,
  &:checked:active::before {
    box-shadow: inset 0 0 0 2px #787878;
    background-color: #787878;
  }
  &:checked::before {
    box-shadow: inset 0 0 0 2px ${({ theme }) => theme.color.primary[800]};
    background-color: ${({ theme }) => theme.color.primary[800]};
    background-image: url(data:image/svg+xml;utf8;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDI0IiBoZWlnaHQ9IjEwMjQiIHZpZXdCb3g9IjAgMCAxMDI0IDEwMjQiIGZpbGw9IiNmZmYiPjx0aXRsZS8+PGcgaWQ9Imljb21vb24taWdub3JlIi8+PHBhdGggZD0iTTg3My41IDIzMy41bDQ1IDQ1LTUzNC41IDUzNS0yNzguNS0yNzkgNDUtNDUgMjMzLjUgMjMzIDQ4OS41LTQ4OXoiLz48L3N2Zz4=);
    background-size: 18px;
  }
`;

export { Checkbox };
