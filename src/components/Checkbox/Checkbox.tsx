import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { themeType } from '../../utils/theme/theme';

interface ICheckbox {
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isChecked?: boolean;
  name?: string;
  title?: string;
  id?: string;
  isDisabled?: boolean;
  className?: string;
  indeterminate?: boolean;
}

function Checkbox(props: ICheckbox) {
  const theme = useTheme() as themeType;
  return (
    <Component
      theme={theme}
      type={'checkbox'}
      checked={props.isChecked}
      indeterminate={props.indeterminate || false}
      onChange={props.onChange}
      name={props.name}
      title={props.title}
      id={props.id}
      onClick={(e) => e.stopPropagation()}
      className={props.isChecked ? `checked ${props.className}` : `${props.className}`}
    />
  );
}

const Component = styled.input<{ theme: themeType; indeterminate: boolean }>`
  height: 18px;
  width: 18px;
  margin: 0;
  border-radius: ${({ theme }) => theme.radius};
  &::before {
    content: '';
    box-shadow: inset 0 0 0 1px ${({ theme }) => theme.color.neutral[theme.mode][800]};
    background-color: ${({ theme }) => (theme.mode === 'light' ? 'white' : theme.color.neutral.dark[100])};
    height: 18px;
    width: 18px;
    margin: 0;
    display: block;
    border-radius: ${({ theme }) => theme.radius};
    background-size: 18px;
  }
  &:hover::before,
  &:checked:hover::before {
    box-shadow: inset 0 0 0 1px ${({ theme }) => theme.color.neutral[theme.mode][1000]};
  }
  &:checked:hover::before {
    box-shadow: inset 0 0 0 2px ${({ theme }) => theme.color.neutral[theme.mode][1500]};
  }
  &:active::before,
  &:checked:active::before {
    box-shadow: inset 0 0 0 2px ${({ theme }) => theme.color.neutral[theme.mode][800]};
    background-color: ${({ theme }) => theme.color.neutral[theme.mode][800]};
  }
  &:checked::before {
    box-shadow: inset 0 0 0 2px ${({ theme }) => theme.color.primary[theme.mode === 'light' ? 800 : 300]};
    background-color: ${({ theme }) => theme.color.primary[theme.mode === 'light' ? 800 : 300]};
    background-image: ${({ theme }) =>
      theme.mode === 'dark'
        ? `url(data:image/svg+xml;utf8;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDI0IiBoZWlnaHQ9IjEwMjQiIHZpZXdCb3g9IjAgMCAxMDI0IDEwMjQiIGZpbGw9IiMwMDAiPjx0aXRsZS8+PGcgaWQ9Imljb21vb24taWdub3JlIi8+PHBhdGggZD0iTTg3My41IDIzMy41bDQ1IDQ1LTUzNC41IDUzNS0yNzguNS0yNzkgNDUtNDUgMjMzLjUgMjMzIDQ4OS41LTQ4OXoiLz48L3N2Zz4=)`
        : `url(data:image/svg+xml;utf8;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDI0IiBoZWlnaHQ9IjEwMjQiIHZpZXdCb3g9IjAgMCAxMDI0IDEwMjQiIGZpbGw9IiNmZmYiPjx0aXRsZS8+PGcgaWQ9Imljb21vb24taWdub3JlIi8+PHBhdGggZD0iTTg3My41IDIzMy41bDQ1IDQ1LTUzNC41IDUzNS0yNzguNS0yNzkgNDUtNDUgMjMzLjUgMjMzIDQ4OS41LTQ4OXoiLz48L3N2Zz4=)`};
  }
  ${({ indeterminate, theme }) =>
    indeterminate
      ? `
    &::before {
      background-color: ${theme.color.primary[theme.mode === 'light' ? 800 : 300]};
      box-shadow: inset 0 0 0 2px ${theme.color.primary[theme.mode === 'light' ? 800 : 300]};
      background-image: ${
        theme.mode === 'dark'
          ? `url(data:image/svg+xml;utf8;base64,PHN2ZyAgIHdpZHRoPSIxMDI0IiAgIGhlaWdodD0iMTAyNCIgICB2aWV3Qm94PSIwIDAgMTAyNCAxMDI0IiAgIGZpbGw9IiMwMDAiICAgdmVyc2lvbj0iMS4xIiAgIGlkPSJzdmc3IiAgIHNvZGlwb2RpOmRvY25hbWU9ImNoZWNrYm94LnN2ZyIgICBpbmtzY2FwZTp2ZXJzaW9uPSIxLjEuMiAoMGEwMGNmNTMzOSwgMjAyMi0wMi0wNCwgY3VzdG9tKSIgICB4bWxuczppbmtzY2FwZT0iaHR0cDovL3d3dy5pbmtzY2FwZS5vcmcvbmFtZXNwYWNlcy9pbmtzY2FwZSIgICB4bWxuczpzb2RpcG9kaT0iaHR0cDovL3NvZGlwb2RpLnNvdXJjZWZvcmdlLm5ldC9EVEQvc29kaXBvZGktMC5kdGQiICAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiAgIHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPiAgPGRlZnMgICAgIGlkPSJkZWZzMTEiIC8+ICA8c29kaXBvZGk6bmFtZWR2aWV3ICAgICBpZD0ibmFtZWR2aWV3OSIgICAgIHBhZ2Vjb2xvcj0iI2ZmZmZmZiIgICAgIGJvcmRlcmNvbG9yPSIjNjY2NjY2IiAgICAgYm9yZGVyb3BhY2l0eT0iMS4wIiAgICAgaW5rc2NhcGU6cGFnZXNoYWRvdz0iMiIgICAgIGlua3NjYXBlOnBhZ2VvcGFjaXR5PSIwLjAiICAgICBpbmtzY2FwZTpwYWdlY2hlY2tlcmJvYXJkPSIwIiAgICAgc2hvd2dyaWQ9ImZhbHNlIiAgICAgaW5rc2NhcGU6em9vbT0iMC4xNzU1MzcxMSIgICAgIGlua3NjYXBlOmN4PSItMTA1Ni43NTY2IiAgICAgaW5rc2NhcGU6Y3k9IjMzOC45NTk2NyIgICAgIGlua3NjYXBlOndpbmRvdy13aWR0aD0iMTkyMCIgICAgIGlua3NjYXBlOndpbmRvdy1oZWlnaHQ9IjExMzMiICAgICBpbmtzY2FwZTp3aW5kb3cteD0iLTkiICAgICBpbmtzY2FwZTp3aW5kb3cteT0iMjkiICAgICBpbmtzY2FwZTp3aW5kb3ctbWF4aW1pemVkPSIxIiAgICAgaW5rc2NhcGU6Y3VycmVudC1sYXllcj0ic3ZnNyIgLz4gIDx0aXRsZSAgICAgaWQ9InRpdGxlMiIgLz4gIDxyZWN0ICAgICBzdHlsZT0iZmlsbC1ydWxlOmV2ZW5vZGQ7c3Ryb2tlLXdpZHRoOjEuNDc4ODE7c3Ryb2tlLW1pdGVybGltaXQ6NDtzdHJva2UtZGFzaGFycmF5Om5vbmU7ZmlsbC1vcGFjaXR5OjEiICAgICBpZD0icmVjdDM1IiAgICAgd2lkdGg9IjgxNC4wMzc2IiAgICAgaGVpZ2h0PSI2NC40OTY1MjkiICAgICB4PSItOTE4LjMyNDEiICAgICB5PSItNTQ0LjQ3ODA5IiAgICAgdHJhbnNmb3JtPSJtYXRyaXgoLTAuOTk5OTk5OSw0LjQ4NTc0NzNlLTQsLTAuMDAxMzU2MjgsLTAuOTk5OTk5MDgsMCwwKSIgLz4gIDxnICAgICBpZD0iaWNvbW9vbi1pZ25vcmUiIC8+PC9zdmc+) !important;`
          : `url(data:image/svg+xml;utf8;base64,PHN2ZyAgIHdpZHRoPSIxMDI0IiAgIGhlaWdodD0iMTAyNCIgICB2aWV3Qm94PSIwIDAgMTAyNCAxMDI0IiAgIGZpbGw9IiNmZmYiICAgdmVyc2lvbj0iMS4xIiAgIGlkPSJzdmc3IiAgIHNvZGlwb2RpOmRvY25hbWU9ImNoZWNrYm94LnN2ZyIgICBpbmtzY2FwZTp2ZXJzaW9uPSIxLjEuMiAoMGEwMGNmNTMzOSwgMjAyMi0wMi0wNCwgY3VzdG9tKSIgICB4bWxuczppbmtzY2FwZT0iaHR0cDovL3d3dy5pbmtzY2FwZS5vcmcvbmFtZXNwYWNlcy9pbmtzY2FwZSIgICB4bWxuczpzb2RpcG9kaT0iaHR0cDovL3NvZGlwb2RpLnNvdXJjZWZvcmdlLm5ldC9EVEQvc29kaXBvZGktMC5kdGQiICAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiAgIHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPiAgPGRlZnMgICAgIGlkPSJkZWZzMTEiIC8+ICA8c29kaXBvZGk6bmFtZWR2aWV3ICAgICBpZD0ibmFtZWR2aWV3OSIgICAgIHBhZ2Vjb2xvcj0iI2ZmZmZmZiIgICAgIGJvcmRlcmNvbG9yPSIjNjY2NjY2IiAgICAgYm9yZGVyb3BhY2l0eT0iMS4wIiAgICAgaW5rc2NhcGU6cGFnZXNoYWRvdz0iMiIgICAgIGlua3NjYXBlOnBhZ2VvcGFjaXR5PSIwLjAiICAgICBpbmtzY2FwZTpwYWdlY2hlY2tlcmJvYXJkPSIwIiAgICAgc2hvd2dyaWQ9ImZhbHNlIiAgICAgaW5rc2NhcGU6em9vbT0iMC4xNzU1MzcxMSIgICAgIGlua3NjYXBlOmN4PSItMTA1Ni43NTY2IiAgICAgaW5rc2NhcGU6Y3k9IjMzOC45NTk2NyIgICAgIGlua3NjYXBlOndpbmRvdy13aWR0aD0iMTkyMCIgICAgIGlua3NjYXBlOndpbmRvdy1oZWlnaHQ9IjExMzMiICAgICBpbmtzY2FwZTp3aW5kb3cteD0iLTkiICAgICBpbmtzY2FwZTp3aW5kb3cteT0iMjkiICAgICBpbmtzY2FwZTp3aW5kb3ctbWF4aW1pemVkPSIxIiAgICAgaW5rc2NhcGU6Y3VycmVudC1sYXllcj0ic3ZnNyIgLz4gIDx0aXRsZSAgICAgaWQ9InRpdGxlMiIgLz4gIDxyZWN0ICAgICBzdHlsZT0iZmlsbC1ydWxlOmV2ZW5vZGQ7c3Ryb2tlLXdpZHRoOjEuNDc4ODE7c3Ryb2tlLW1pdGVybGltaXQ6NDtzdHJva2UtZGFzaGFycmF5Om5vbmU7ZmlsbC1vcGFjaXR5OjEiICAgICBpZD0icmVjdDM1IiAgICAgd2lkdGg9IjgxNC4wMzc2IiAgICAgaGVpZ2h0PSI2NC40OTY1MjkiICAgICB4PSItOTE4LjMyNDEiICAgICB5PSItNTQ0LjQ3ODA5IiAgICAgdHJhbnNmb3JtPSJtYXRyaXgoLTAuOTk5OTk5OSw0LjQ4NTc0NzNlLTQsLTAuMDAxMzU2MjgsLTAuOTk5OTk5MDgsMCwwKSIgLz4gIDxnICAgICBpZD0iaWNvbW9vbi1pZ25vcmUiIC8+PC9zdmc+) !important;`
      }
    &:hover::before {
      box-shadow: inset 0 0 0 2px ${theme.color.neutral[theme.mode][1500]};
    }
    &:active::before {
      box-shadow: inset 0 0 0 2px ${theme.color.neutral[theme.mode][800]};
      background-color: ${theme.color.neutral[theme.mode][800]};
    }
  `
      : ``}
`;

export { Checkbox };
