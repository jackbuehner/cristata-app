import { useTheme } from '@emotion/react';
import styled from '@emotion/styled/macro';
import { LinearProgress } from '@rmwc/linear-progress';
import { themeType } from '../../utils/theme/theme';

const Wrapper = styled.div<{ theme?: themeType }>`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  position: relative;
  padding: 0 20px;
  height: ${({ theme }) => theme.dimensions.PageHead.height};
  width: ${({ theme }) => theme.dimensions.PageHead.width};
  box-sizing: border-box;
  border-bottom: 1px solid;
  border-color: ${({ theme }) =>
    theme.mode === 'light'
      ? theme.color.neutral.light[300]
      : theme.color.neutral.dark[300]};
  background-color: ${({ theme }) =>
    theme.mode === 'light' ? 'white' : 'black'};
`;

const TextWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const ButtonWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 6px;
`;

const Title = styled.span<{ theme?: themeType }>`
  font-family: ${({ theme }) => theme.font.headline};
  font-size: 16px;
  font-weight: 600;
  line-height: 22px;
  color: ${({ theme }) =>
    theme.mode === 'light'
      ? theme.color.neutral.light[1200]
      : theme.color.neutral.dark[1200]};
`;

const Description = styled.span<{ theme?: themeType }>`
  font-family: ${({ theme }) => theme.font.detail};
  font-size: 13px;
  font-weight: 400;
  color: ${({ theme }) =>
    theme.mode === 'light'
      ? theme.color.neutral.light[1000]
      : theme.color.neutral.dark[1000]};
`;

/**
 * The indeterminate progressbar that appears at the bottom of the page header when `isLoading` is `true`.
 *
 * It appears underneath the title when there are children, and it appears at the top of the modal
 * when there are no children
 */
const IndeterminateProgress = styled(LinearProgress)<{
  theme: themeType;
  progress?: number;
}>`
  --mdc-theme-primary: ${({ theme }) => theme.color.primary[800]};
  position: absolute !important;
  left: 0;
  bottom: 0;
`;

interface IPageHead {
  title: string;
  description?: string;
  buttons?: React.ReactChild;
  isLoading?: boolean | number;
}

function PageHead(props: IPageHead) {
  const theme = useTheme() as themeType;

  return (
    <Wrapper theme={theme}>
      <TextWrapper>
        <Title theme={theme}>{props.title}</Title>
        <Description>{props.description}</Description>
      </TextWrapper>
      <ButtonWrapper>{props.buttons}</ButtonWrapper>
      {props.isLoading ? (
        <IndeterminateProgress
          theme={theme}
          progress={
            typeof props.isLoading === 'number' ? props.isLoading : undefined
          }
        />
      ) : null}
    </Wrapper>
  );
}

export { PageHead };
