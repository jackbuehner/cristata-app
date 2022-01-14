import styled from '@emotion/styled/macro';

interface IWidgetWrapper {
  position?: 'left' | 'right' | 'center';
}

const WidgetWrapper = styled.div<IWidgetWrapper>`
  position: relative;
  min-height: 20px;
  display: flex;
  flex-direction: column;
  ${({ position }) =>
    position === 'left'
      ? `
          float: left;
          width: 50%;
          margin: 10px 20px 10px 0;
        `
      : position === 'right'
      ? `
          float: right;
          width: 50%;
          margin: 10px 0 10px 20px;
        `
      : `
          width: 100%;
          border-top: 1px solid #cccccc;
          border-bottom: 1px solid #cccccc;
          margin: 20px 0;
        `}
`;

export { WidgetWrapper };
