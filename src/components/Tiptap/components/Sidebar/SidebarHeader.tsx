import { css, useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Dismiss12Regular } from '@fluentui/react-icons';
import { useEffect } from 'react';
import ReactTooltip from 'react-tooltip';
import type { themeType } from '../../../../utils/theme/theme';
import { IconButton } from '../../../Button';

const Container = styled.div<{ theme: themeType }>`
  padding: 8px 12px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  background-color: ${({ theme }) => theme.color.neutral[theme.mode][200]};
`;

const Title = styled.h1<{ theme: themeType }>`
  font-size: 16px;
  font-weight: 700;
  line-height: 30px;
  height: 30px;
  white-space: nowrap;
  text-overflow: ellipsis;
  flex-grow: 1;
  margin: 0;
  padding: 0;
  font-family: ${({ theme }) => theme.font.detail};
  color: ${({ theme }) => theme.color.neutral[theme.mode][1400]};
`;

interface ISidebarHeader {
  closeFunction?: () => void;
  children: React.ReactText;
}

function SidebarHeader(props: ISidebarHeader) {
  const theme = useTheme() as themeType;

  // update tooltip listener when component changes
  useEffect(() => {
    ReactTooltip.rebuild();
  });

  return (
    <Container theme={theme}>
      <Title theme={theme}>{props.children}</Title>
      {props.closeFunction ? (
        <IconButton
          onClick={props.closeFunction}
          icon={<Dismiss12Regular />}
          color={'primary'}
          backgroundColor={{ base: 'transparent' }}
          border={{ base: '1px solid transparent' }}
          cssExtra={css`
            span > svg {
              width: 16px;
              height: 16px;
            }
          `}
          data-tip={'Close sidebar'}
          width={`30px`}
          height={`30px`}
        />
      ) : null}
    </Container>
  );
}

export { SidebarHeader };
