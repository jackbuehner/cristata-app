import styled from '@emotion/styled/macro';

const DividerWrapper = styled.span`
  display: inline-flex;
  height: 32px;
  align-items: center;
  padding: 4px;
`;

const Divider = styled.span`
  width: 1px;
  height: 100%;
  background-color: rgb(200, 200, 200);
`;

function ToolbarDivider() {
  return (
    <DividerWrapper>
      <Divider />
    </DividerWrapper>
  );
}

export { ToolbarDivider };
