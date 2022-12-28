import styled from '@emotion/styled';

interface IToolbarTabList {
  width: number;
}

const ToolbarTabList = styled.div<IToolbarTabList>`
  position: relative;
  display: flex;
  flex-wrap: nowrap;
  overflow-x: ${({ width }) => (width < 350 ? 'auto' : 'hidden')};
`;

export { ToolbarTabList };
