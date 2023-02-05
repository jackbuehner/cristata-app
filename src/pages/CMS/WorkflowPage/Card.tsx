import { css } from '@emotion/react';
import styled from '@emotion/styled';
import Color from 'color';
import useDimensions from 'react-cool-dimensions';
import { useNavigate } from 'svelte-preprocess-react/react-router';
import { Chip } from '../../../components/Chip';
import { useCollectionSchemaConfig } from '../../../hooks/useCollectionSchemaConfig';
import { camelToDashCase } from '../../../utils/camelToDashCase';

const CardContainer = styled.div<{ isDragging: boolean }>`
  display: block;
  box-shadow: ${({ theme }) => theme.color.neutral[theme.mode][200]} 0px 0px 0px 1px inset;
  background-color: ${({ theme }) =>
    theme.mode === 'dark'
      ? Color(theme.color.neutral.dark[100]).lighten(0.2).string()
      : Color('#ffffff').darken(0.02).string()};
  border-radius: ${({ theme }) => theme.radius};
  padding: 10px;
  opacity: ${({ isDragging }) => (isDragging ? 0.5 : 1)};
  width: 100%;
  box-sizing: border-box;
`;

const Note = styled.a<{ href?: string }>`
  display: block;
  font-family: ${({ theme, href }) => (href ? theme.font.headline : theme.font.body)};
  font-size: ${({ href }) => (href ? 14.25 : 15)}px;
  color: ${({ href, theme }) =>
    href ? theme.color.primary[theme.mode === 'light' ? 800 : 300] : theme.color.neutral[theme.mode][1500]};
  font-weight: ${({ href }) => (href ? 400 : 400)};
  text-decoration: none;
  &:hover {
    ${({ href }) => (href ? `text-decoration: underline; cursor: pointer` : '')}
  }
  white-space: pre-line;
  margin: 0;
`;

const Collection = styled.div`
  font-family: ${({ theme }) => theme.font.detail};
  font-size: 12px;
  font-weight: 400;
  margin: 0 0 6px 0;
  text-transform: uppercase;
  letter-spacing: 1.3px;
  color: ${({ theme }) => theme.color.neutral[theme.mode][1000]};
`;

interface CardType {
  _id: string;
  name?: string | null;
  stage: number;
  in: string;
}

/**
 * Creates a card for the projects interface.
 *
 * Notes: requires all props for the card (retrieve it from the GitHub API).
 */
function Card(props: CardType) {
  const [{ schemaDef, pluralName, by }] = useCollectionSchemaConfig(props.in);
  const stageOptions = schemaDef
    .find(([key]) => key === 'stage')?.[1]
    .field?.options?.map((opt) => ({ label: opt.label, value: parseFloat(`${opt.value}`) }));
  const stageChips = schemaDef.find(([key]) => key === 'stage')?.[1].column?.chips;

  const tenant = window.location.pathname.split('/')[1];
  const navigate = useNavigate();

  // get the dimensions of the card
  const { observe: cardRef, height: cardHeight } = useDimensions();

  const canAccessById = by?.one === '_id';
  const to = canAccessById ? `/cms/collection/${camelToDashCase(props.in)}/${props._id}` : undefined;

  return (
    <div>
      <CardContainer isDragging={false}>
        <Collection>{pluralName || props.in}</Collection>
        <Note
          href={to ? `/${tenant}${to}` : undefined}
          onClick={(e) => {
            if (to) {
              e.preventDefault();
              navigate(`/${tenant}${to}`);
            }
          }}
        >
          {props.name || props._id}
        </Note>
        <Chip
          label={stageOptions?.find((opt) => opt.value === props.stage)?.label || `${props.stage}`}
          cssExtra={css`
            margin: 6px 0 0 0;
          `}
          color={(() => {
            const defaultColor = (() => {
              if (parseInt(`${props.stage}`) === 1) return 'indigo';
              if (parseInt(`${props.stage}`) === 2) return 'orange';
              if (parseInt(`${props.stage}`) === 3) return 'red';
              if (parseInt(`${props.stage}`) === 4) return 'blue';
              return 'neutral';
            })();

            if (!stageChips) return defaultColor;
            if (typeof stageChips === 'boolean') return defaultColor;

            return (
              stageChips.find((chip) => parseFloat(`${chip.value}`) === props.stage)?.color || defaultColor
            );
          })()}
        />
      </CardContainer>
    </div>
  );
}

export { Card };
