import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { themeType } from '../../utils/theme/theme';

const Wrapper = styled.div<{ theme?: themeType }>`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 0 20px;
  height: ${({ theme }) => theme.dimensions.PageHead.height};
  width: ${({ theme }) => theme.dimensions.PageHead.width};
  box-sizing: border-box;
  border-bottom: 1px solid;
  border-color: ${({ theme }) =>
    theme.mode === 'light' ? theme.color.neutral.light[300] : theme.color.neutral.dark[300]};
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
    theme.mode === 'light' ? theme.color.neutral.light[1200] : theme.color.neutral.dark[1200]};
`;

const Description = styled.span<{ theme?: themeType }>`
  font-family: ${({ theme }) => theme.font.detail};
  font-size: 13px;
  font-weight: 400;
  color: ${({ theme }) =>
    theme.mode === 'light' ? theme.color.neutral.light[1000] : theme.color.neutral.dark[1000]};
`;

interface IPageHead {
  title: string;
  description?: string;
  buttons?: React.ReactChild;
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
    </Wrapper>
  );
}

export { PageHead };
