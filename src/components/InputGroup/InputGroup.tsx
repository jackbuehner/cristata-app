import styled from '@emotion/styled';

interface IInputGroupBase {
  type: 'text' | 'checkbox';
  noGrid?: boolean;
}

interface IInputGroupComponent extends IInputGroupBase {}

interface IInputGroup extends IInputGroupBase {
  children: React.ReactNode;
}

const InputGroupComponent = styled.div<IInputGroupComponent>`
  margin-block-end: 12px;
  display: ${({ noGrid }) => (noGrid ? 'block' : 'grid')};
  grid-template-columns: ${({ type }) => (type === 'checkbox' ? `1fr 30px` : `1fr`)};
`;

function InputGroup(props: IInputGroup) {
  return (
    <InputGroupComponent type={props.type} noGrid={props.noGrid}>
      {props.children}
    </InputGroupComponent>
  );
}

export { InputGroup };
