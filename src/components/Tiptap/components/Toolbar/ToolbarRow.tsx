import styled from '@emotion/styled/macro';

interface IToolbarRow {
  isActive: boolean;
}

const ToolbarRow = styled.div<IToolbarRow>`
display: flex;
visibility: ${({ isActive }) => (isActive ? 'visible' : 'hidden')};
width: ${({ isActive }) => (isActive ? 'auto' : '0px')};
height: ${({ isActive }) => (isActive ? 'fit-content' : '0px')};
transform: ${({ isActive }) => (isActive ? 'none' : 'translateX(-20px)')};
opacity: ${({ isActive }) => (isActive ? 100 : 0)};
transition: transform 0.15s ease 0s, opacity 0.15s ease 0s;
white-space: nowrap;
flex-wrap: wrap;
align-content: flex-start;
`;

export { ToolbarRow };
