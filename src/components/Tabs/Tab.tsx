import { Tab as RMWCTab } from '@rmwc/tabs';
import styled from '@emotion/styled/macro';

const Tab = styled(RMWCTab)`
  --mdc-theme-primary: ${({ theme }) => theme.color.primary[theme.mode === 'light' ? 800 : 300]};

  .mdc-tab__content .mdc-tab__text-label {
    font-family: ${({ theme }) => theme.font.detail};
    text-transform: none;
    font-weight: 600;
    color: ${({ theme }) =>
      theme.mode === 'light' ? theme.color.neutral.light[1200] : theme.color.neutral.dark[1200]};
  }
`;

export { Tab };
