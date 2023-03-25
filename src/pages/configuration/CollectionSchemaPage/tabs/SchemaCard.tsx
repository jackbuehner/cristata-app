import styled from '@emotion/styled';
import Color from 'color';
import { buttonEffect } from '../../../../components/Button';
import { Chip } from '../../../../components/Chip';
import FluentIcon from '../../../../components/FluentIcon';
import type { colorType } from '../../../../utils/theme/theme';
import { useConfirmDelete } from '../hooks/schema-modals/useConfirmDelete';
import { useEditSchemaDef } from '../hooks/schema-modals/useEditSchemaDef';

interface SchemaCardProps {
  label: string;
  id: string;
  tags: string[];
  icon?: keyof typeof icons;
  isRef?: boolean;
}

function SchemaCard(props: SchemaCardProps) {
  const [EditWindow, showEditWindow] = useEditSchemaDef({ label: props.label, id: props.id });
  const [DeleteWindow, showDeleteWindow] = useConfirmDelete({ id: props.id });

  return (
    <Card>
      {EditWindow}
      {DeleteWindow}
      <Icon color={icons[props.icon || 'unknown'].color}>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          enable-background='new 0 0 24 24'
          height='24px'
          viewBox='0 0 24 24'
          width='24px'
          fill='currentColor'
        >
          {icons[props.icon || 'unknown'].path}
        </svg>
      </Icon>
      <Details>
        <Label>
          {props.label} <Id>†{props.id}</Id>
        </Label>
        <Tags>
          {props.tags.map((label, index) => (
            <Chip key={index} label={label} />
          ))}
        </Tags>
      </Details>
      <div style={{ display: 'flex', flexDirection: 'row', gap: 6 }}>
        {props.isRef ? null : (
          <IconButtonWrapper color={'primary'} onClick={showEditWindow}>
            <FluentIcon name={'Edit24Regular'} />
          </IconButtonWrapper>
        )}
        <IconButtonWrapper color={'red'} onClick={showDeleteWindow}>
          <FluentIcon name={'Dismiss24Regular'} />
        </IconButtonWrapper>
      </div>
    </Card>
  );
}

const Card = styled.div`
  padding: 16px;
  margin: 16px;
  gap: 16px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  box-shadow: ${({ theme }) => theme.color.neutral[theme.mode][200]} 0px 0px 0px 1px inset;
  background-color: ${({ theme }) =>
    theme.mode === 'dark'
      ? Color(theme.color.neutral.dark[100]).lighten(0.2).string()
      : Color('#ffffff').darken(0.03).string()};
  border-radius: ${({ theme }) => theme.radius};
`;

const Icon = styled.div<{ color: colorType }>`
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme, color }) =>
    Color(
      color === 'neutral'
        ? theme.color.neutral[theme.mode][600]
        : theme.color[color][theme.mode === 'light' ? 900 : 300]
    )
      .alpha(0.15)
      .string()};
  color: ${({ theme, color }) =>
    color === 'neutral'
      ? theme.color.neutral[theme.mode][900]
      : theme.color[color][theme.mode === 'light' ? 900 : 300]};
  border-radius: ${({ theme }) => theme.radius};
  flex-shrink: 0;
`;

const Details = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 6px;
  flex-grow: 1;
`;

const Label = styled.div`
  font-family: ${({ theme }) => theme.font.detail};
  font-weight: 600;
  font-size: 16px;
  color: ${({ theme }) => theme.color.neutral[theme.mode][1400]};
`;

const Id = styled.span`
  font-weight: 400;
  font-size: 13px;
  color: ${({ theme }) => theme.color.neutral[theme.mode][1000]};
`;

const Tags = styled.div`
  margin-left: -2px;
`;

const IconButtonWrapper = styled.span<{ color: colorType; disabled?: boolean }>`
  ${({ color, theme, disabled }) =>
    buttonEffect(color, theme.mode === 'light' ? 700 : 300, theme, disabled, { base: 'transparent' })}
  border: none !important;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  justify-content: center;
  width: 34px;
  min-height: 36px;
  margin: 0 1px 0 0;
  border-left: 1px solid ${({ theme }) => theme.color.neutral[theme.mode][200]};
  border-radius: ${({ theme }) => theme.radius};
  > svg {
    width: 16px;
    height: 16px;
  }
`;

const icons: Record<
  | 'text'
  | 'text-multiline'
  | 'text-markdown'
  | 'richtext'
  | 'number'
  | 'decimal'
  | 'boolean'
  | 'reference'
  | 'datetime'
  | 'objectid'
  | 'branching'
  | 'docarray'
  | 'unknown',
  { color: colorType; path: React.ReactNode }
> = {
  text: {
    color: 'green',
    path: <path xmlns='http://www.w3.org/2000/svg' d='M5 4v3h5.5v12h3V7H19V4H5z' />,
  },
  'text-multiline': {
    color: 'green',
    path: <path xmlns='http://www.w3.org/2000/svg' d='M21 11.01L3 11v2h18zM3 16h12v2H3zM21 6H3v2.01L21 8z' />,
  },
  'text-markdown': {
    color: 'green',
    path: (
      <path
        xmlns='http://www.w3.org/2000/svg'
        d='M20.56 18H3.44C2.65 18 2 17.37 2 16.59V7.41C2 6.63 2.65 6 3.44 6H20.56C21.35 6 22 6.63 22 7.41V16.59C22 17.37 21.35 18 20.56 18M3.44 6.94C3.18 6.94 2.96 7.15 2.96 7.41V16.6C2.96 16.85 3.18 17.06 3.44 17.06H20.56C20.82 17.06 21.04 16.85 21.04 16.6V7.41C21.04 7.15 20.82 6.94 20.56 6.94H3.44M4.89 15.19V8.81H6.81L8.73 11.16L10.65 8.81H12.58V15.19H10.65V11.53L8.73 13.88L6.81 11.53V15.19H4.89M16.9 15.19L14 12.09H15.94V8.81H17.86V12.09H19.79L16.9 15.19'
      ></path>
    ),
  },
  number: {
    color: 'yellow',
    path: (
      <path
        xmlns='http://www.w3.org/2000/svg'
        d='M20.5,10L21,8h-4l1-4h-2l-1,4h-4l1-4h-2L9,8H5l-0.5,2h4l-1,4h-4L3,16h4l-1,4h2l1-4h4l-1,4h2l1-4h4l0.5-2h-4l1-4H20.5z M13.5,14h-4l1-4h4L13.5,14z'
      />
    ),
  },
  decimal: {
    color: 'orange',
    path: (
      <path d='M10 7A3 3 0 0 0 7 10V13A3 3 0 0 0 13 13V10A3 3 0 0 0 10 7M11 13A1 1 0 0 1 9 13V10A1 1 0 0 1 11 10M17 7A3 3 0 0 0 14 10V13A3 3 0 0 0 20 13V10A3 3 0 0 0 17 7M18 13A1 1 0 0 1 16 13V10A1 1 0 0 1 18 10M6 15A1 1 0 1 1 5 14A1 1 0 0 1 6 15Z'></path>
    ),
  },
  boolean: {
    color: 'indigo',
    path: (
      <path
        xmlns='http://www.w3.org/2000/svg'
        d='M17 6H7c-3.31 0-6 2.69-6 6s2.69 6 6 6h10c3.31 0 6-2.69 6-6s-2.69-6-6-6zm0 10H7c-2.21 0-4-1.79-4-4s1.79-4 4-4h10c2.21 0 4 1.79 4 4s-1.79 4-4 4zm0-7c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z'
      />
    ),
  },
  richtext: {
    color: 'turquoise',
    path: (
      <path
        xmlns='http://www.w3.org/2000/svg'
        d='M9.03,3l-1.11,7.07h2.62l0.7-4.5h2.58L11.8,18.43H9.47L9.06,21h7.27l0.4-2.57h-2.35l2-12.86h2.58l-0.71,4.5h2.65L22,3H9.03 z M8,5H4L3.69,7h4L8,5z M7.39,9h-4l-0.31,2h4L7.39,9z M8.31,17h-6L2,19h6L8.31,17z M8.93,13h-6l-0.31,2h6.01L8.93,13z'
      />
    ),
  },
  reference: {
    color: 'violet',
    path: (
      <g xmlns='http://www.w3.org/2000/svg'>
        <g>
          <g>
            <path d='M7,17h1.09c0.28-1.67,1.24-3.1,2.6-4H7V17z' />
          </g>
          <g>
            <path d='M5,19V5h14v7h1c0.34,0,0.67,0.04,1,0.09V5c0-1.1-0.9-2-2-2H5C3.9,3,3,3.9,3,5v14c0,1.1,0.9,2,2,2h3.81 c-0.35-0.61-0.6-1.28-0.72-2H5z' />
          </g>
          <g>
            <rect height='4' width='4' x='7' y='7' />
          </g>
          <g>
            <rect height='4' width='4' x='13' y='7' />
          </g>
          <path d='M16,20h-2c-1.1,0-2-0.9-2-2s0.9-2,2-2h2v-2h-2c-2.21,0-4,1.79-4,4c0,2.21,1.79,4,4,4h2V20z' />
          <path d='M20,14h-2v2h2c1.1,0,2,0.9,2,2s-0.9,2-2,2h-2v2h2c2.21,0,4-1.79,4-4C24,15.79,22.21,14,20,14z' />
          <polygon points='20,19 20,17 17,17 14,17 14,19 19,19' />
        </g>
      </g>
    ),
  },
  datetime: {
    color: 'primary',
    path: (
      <path
        xmlns='http://www.w3.org/2000/svg'
        d='M7 11h2v2H7v-2zm14-5v14c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2l.01-14c0-1.1.88-2 1.99-2h1V2h2v2h8V2h2v2h1c1.1 0 2 .9 2 2zM5 8h14V6H5v2zm14 12V10H5v10h14zm-4-7h2v-2h-2v2zm-4 0h2v-2h-2v2z'
      />
    ),
  },
  objectid: {
    color: 'red',
    path: (
      <path
        xmlns='http://www.w3.org/2000/svg'
        d='M17.81 4.47c-.08 0-.16-.02-.23-.06C15.66 3.42 14 3 12.01 3c-1.98 0-3.86.47-5.57 1.41-.24.13-.54.04-.68-.2-.13-.24-.04-.55.2-.68C7.82 2.52 9.86 2 12.01 2c2.13 0 3.99.47 6.03 1.52.25.13.34.43.21.67-.09.18-.26.28-.44.28zM3.5 9.72c-.1 0-.2-.03-.29-.09-.23-.16-.28-.47-.12-.7.99-1.4 2.25-2.5 3.75-3.27C9.98 4.04 14 4.03 17.15 5.65c1.5.77 2.76 1.86 3.75 3.25.16.22.11.54-.12.7-.23.16-.54.11-.7-.12-.9-1.26-2.04-2.25-3.39-2.94-2.87-1.47-6.54-1.47-9.4.01-1.36.7-2.5 1.7-3.4 2.96-.08.14-.23.21-.39.21zm6.25 12.07c-.13 0-.26-.05-.35-.15-.87-.87-1.34-1.43-2.01-2.64-.69-1.23-1.05-2.73-1.05-4.34 0-2.97 2.54-5.39 5.66-5.39s5.66 2.42 5.66 5.39c0 .28-.22.5-.5.5s-.5-.22-.5-.5c0-2.42-2.09-4.39-4.66-4.39s-4.66 1.97-4.66 4.39c0 1.44.32 2.77.93 3.85.64 1.15 1.08 1.64 1.85 2.42.19.2.19.51 0 .71-.11.1-.24.15-.37.15zm7.17-1.85c-1.19 0-2.24-.3-3.1-.89-1.49-1.01-2.38-2.65-2.38-4.39 0-.28.22-.5.5-.5s.5.22.5.5c0 1.41.72 2.74 1.94 3.56.71.48 1.54.71 2.54.71.24 0 .64-.03 1.04-.1.27-.05.53.13.58.41.05.27-.13.53-.41.58-.57.11-1.07.12-1.21.12zM14.91 22c-.04 0-.09-.01-.13-.02-1.59-.44-2.63-1.03-3.72-2.1-1.4-1.39-2.17-3.24-2.17-5.22 0-1.62 1.38-2.94 3.08-2.94s3.08 1.32 3.08 2.94c0 1.07.93 1.94 2.08 1.94s2.08-.87 2.08-1.94c0-3.77-3.25-6.83-7.25-6.83-2.84 0-5.44 1.58-6.61 4.03-.39.81-.59 1.76-.59 2.8 0 .78.07 2.01.67 3.61.1.26-.03.55-.29.64-.26.1-.55-.04-.64-.29-.49-1.31-.73-2.61-.73-3.96 0-1.2.23-2.29.68-3.24 1.33-2.79 4.28-4.6 7.51-4.6 4.55 0 8.25 3.51 8.25 7.83 0 1.62-1.38 2.94-3.08 2.94s-3.08-1.32-3.08-2.94c0-1.07-.93-1.94-2.08-1.94s-2.08.87-2.08 1.94c0 1.71.66 3.31 1.87 4.51.95.94 1.86 1.46 3.27 1.85.27.07.42.35.35.61-.05.23-.26.38-.47.38z'
      />
    ),
  },
  branching: {
    color: 'neutral',
    path: (
      <path
        xmlns='http://www.w3.org/2000/svg'
        d='M9.78,11.16l-1.42,1.42c-0.68-0.69-1.34-1.58-1.79-2.94l1.94-0.49C8.83,10.04,9.28,10.65,9.78,11.16z M11,6L7,2L3,6h3.02 C6.04,6.81,6.1,7.54,6.21,8.17l1.94-0.49C8.08,7.2,8.03,6.63,8.02,6H11z M21,6l-4-4l-4,4h2.99c-0.1,3.68-1.28,4.75-2.54,5.88 c-0.5,0.44-1.01,0.92-1.45,1.55c-0.34-0.49-0.73-0.88-1.13-1.24L9.46,13.6C10.39,14.45,11,15.14,11,17c0,0,0,0,0,0h0v5h2v-5 c0,0,0,0,0,0c0-2.02,0.71-2.66,1.79-3.63c1.38-1.24,3.08-2.78,3.2-7.37H21z'
      />
    ),
  },
  docarray: {
    color: 'neutral',
    path: (
      <g xmlns='http://www.w3.org/2000/svg'>
        <g>
          <polygon points='15,4 15,6 18,6 18,18 15,18 15,20 20,20 20,4' />
          <polygon points='4,20 9,20 9,18 6,18 6,6 9,6 9,4 4,4' />
        </g>
      </g>
    ),
  },
  unknown: {
    color: 'neutral',
    path: <path />,
  },
};

export type { SchemaCardProps };
export { icons, SchemaCard };
