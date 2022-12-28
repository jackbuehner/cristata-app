import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Spinner } from '../../../components/Loading';
import { themeType } from '../../../utils/theme/theme';

interface IFullScreenSplash {
  isLoading: boolean;
  message?: string;
}

function FullScreenSplash(props: IFullScreenSplash) {
  const theme = useTheme() as themeType;
  return (
    <div className={`splash-wrapper2`}>
      <style>
        {`
    .splash-wrapper2 {
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      position: fixed;
      z-index: 9999;
      background: ${theme.color.blue[800]};
      display: flex;
      flex-direction: column;
      gap: 20px;
      align-items: center;
      justify-content: center;
      animation: ${!props.isLoading ? `splash-off 0.14s ease-in-out` : 'none'};
      animation-fill-mode: forwards;
      animation-delay: 0.14s;
      -webkit-app-region: drag;
    }
    @media (prefers-color-scheme: dark) {
      .splash-wrapper2 {
        background: #242424;
      }
    }
    .splash-app-name2 {
      font-family: ${theme.font.headline};
      font-size: 50px;
      margin: -3px 0;
      font-weight: 600;
      color: rgb(250, 249, 248);
      text-shadow: rgb(210 208 206 / 60%) 0px 0px 8px, rgb(11 4 36 / 60%) 0px 0px 4px;
      letter-spacing: 2px;
    }
`}
      </style>
      <svg
        xmlns='http://www.w3.org/2000/svg'
        width='41.57'
        height='48'
        viewBox='0 0 31.1775 36'
        className='splash-app-logo'
      >
        <path d='m28.1553 10.7445-8.1515-4.7059v12.7647l8.1515-4.7059zM7.4376 8.1969l11.0557 6.3824V5.1667l-2.9039-1.676ZM12.683 30.8327l2.9064 1.677 8.081-4.665-10.9852-6.3409zM25.182 26.9724l2.9736-1.7166v-9.4132l-11.1275 6.424zM5.9264 9.0687l-2.903 1.6758-.0006 9.412 11.0544-6.3825zM3.0229 25.2555l8.1495 4.704.0028-12.764-8.1521 4.706z' />
        <path d='M15.589 0 .0006 8.9998 0 27.0002 15.5886 36l15.5885-8.9998V8.9998zm14.0775 26.1277L15.5897 34.255l-14.078-8.1273.0005-16.2554L15.5896 1.745l14.0767 8.1273z' />
      </svg>
      <span className={`splash-app-name2`}>Editor</span>
      <Block theme={theme}>
        <Spinner size={32} color={'neutral'} colorShade={theme.mode === 'light' ? 100 : 1500} />
      </Block>
      <Message>{props.message}</Message>
    </div>
  );
}

const Block = styled.div<{ theme: themeType }>`
  font-family: ${({ theme }) => theme.font.detail};
  color: white;
  display: flex;
  flex-direction: column;
  gap: 10px;
  position: absolute;
  bottom: 100px;
`;

const Message = styled.div`
  font-family: ${({ theme }) => theme.font.detail};
  color: white;
  display: flex;
  flex-direction: column;
  gap: 10px;
  position: absolute;
  bottom: 60px;
`;

export { FullScreenSplash };
