import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { UniqueIdentifier } from '@dnd-kit/core';
import {
  ChevronDown24Regular,
  ChevronUp24Regular,
  Dismiss24Regular,
  ReOrderDotsHorizontal24Regular,
} from '@fluentui/react-icons';
import styled from '@emotion/styled/macro';
import { Card } from './Card';
import { CardLabel } from './CardLabel';
import { CardLabelCaption } from './CardLabelCaption';
import { colorType } from '../../utils/theme/theme';
import { buttonEffect } from '../Button';

interface SortableItemProps {
  id: UniqueIdentifier;
  children?: React.ReactNode;
  label?: React.ReactNode;
  caption?: React.ReactNode;
  reducedMargin?: boolean;
  style?: React.CSSProperties;
  collapsedDetails?: Record<string, string>;
  disableRemove?: boolean;
  handleRemove?: () => void;
}

function SortableCard(props: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: props.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [collapsed, setCollapsed] = useState(false);

  return (
    <div ref={setNodeRef} style={style}>
      <Card
        noPadding
        noVerticalMargin={props.reducedMargin}
        style={{ margin: props.reducedMargin ? '6px 0' : undefined, ...props.style }}
      >
        <Contents>
          <DragHandle {...listeners} {...attributes} isDragging={isDragging} />
          <div style={{ padding: '16px', flexGrow: 1 }}>
            {props.label && !collapsed ? <CardLabel>{props.label}</CardLabel> : null}
            {props.caption && !collapsed ? <CardLabelCaption>{props.caption}</CardLabelCaption> : null}
            {collapsed
              ? Object.entries(props.collapsedDetails || {}).map(([label, value]) => {
                  return (
                    <FieldGroup>
                      <FieldName>{label}</FieldName>
                      <FieldValue>{value}</FieldValue>
                    </FieldGroup>
                  );
                })
              : props.children}
          </div>
          <IconGroup>
            <IconWrapper color={'red'} disabled={props.disableRemove || false} onClick={props.handleRemove}>
              <Dismiss24Regular />
            </IconWrapper>
            <IconWrapper
              color={'primary'}
              disabled={props.disableRemove || false}
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? <ChevronDown24Regular /> : <ChevronUp24Regular />}
            </IconWrapper>
          </IconGroup>
        </Contents>
      </Card>
    </div>
  );
}

const Contents = styled.div`
  display: flex;
  flex-direction: row;
  align-items: stretch;
`;

function DragHandle(props: any) {
  return (
    <DragHandleComponent {...props}>
      <ReOrderDotsHorizontal24Regular />
    </DragHandleComponent>
  );
}

const DragHandleComponent = styled.button<{ isDragging?: boolean }>`
  -moz-appearance: none;
  -webkit-appearance: none;
  appearance: none;
  cursor: ${({ isDragging }) => (isDragging ? 'grabbing' : 'grab')};
  border: none;
  color: inherit;
  background-color: transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 40px;
  min-height: 38px;
  border-right: 1px solid ${({ theme }) => theme.color.neutral[theme.mode][200]};
  flex-shrink: 0;
`;

const IconGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-grow: 0;
  flex-shrink: 0;
  > span {
    border: none !important;
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-grow: 0;
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
  }
`;

const IconWrapper = styled.button<{ color: colorType; disabled?: boolean }>`
  -moz-appearance: none;
  -webkit-appearance: none;
  appearance: none;
  color: inherit;
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

const FieldGroup = styled.div`
  line-height: 16px;
  font-family: ${({ theme }) => theme.font.detail};
  font-size: 13px;
  font-variant-numeric: lining-nums;
  color: ${({ theme }) => theme.color.neutral[theme.mode][1200]};
  margin: 2px 0;
  display: flex;
  flex-direction: row;
  gap: 10px;
`;

const FieldName = styled.span`
  font-weight: 500;
  color: ${({ theme }) => theme.color.neutral[theme.mode][1000]};
  white-space: nowrap;
`;

const FieldValue = styled.span`
  font-weight: 400;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export { SortableCard };
