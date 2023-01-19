import { css, useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import Color from 'color';
import { useLocation, useNavigate } from 'svelte-preprocess-react/react-router';
import { Button, IconButton } from '../../../components/Button';
import FluentIcon from '../../../components/FluentIcon';
import { DeconstructedSchemaDefType } from '../../../hooks/useCollectionSchemaConfig/useCollectionSchemaConfig';
import { capitalize } from '../../../utils/capitalize';
import { isJSON } from '../../../utils/isJSON';

interface CollectionTableFilterRowProps {
  collectionName: string;
  schemaDef: DeconstructedSchemaDefType;
}

function CollectionTableFilterRow(props: CollectionTableFilterRowProps) {
  const { pathname, hash, search } = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(search);
  const theme = useTheme();
  const tenant = location.pathname.split('/')[1];

  const labels = props.schemaDef.map(([key, def]) => ({
    key,
    label: def.column?.label,
    chips: def.column?.chips,
  }));

  // build a filter for the table based on url search params
  let items: {
    key: string;
    value: string;
    negated?: boolean;
    original?: { param: string; paramValue: string; value: string };
  }[] = [{ key: 'Collection', value: props.collectionName }];
  searchParams.forEach((value, param) => {
    // ignore values that start with two underscores because these are
    // parameters used in the page instead of filters
    if (param.indexOf('__') === 0) return;
    if (param === '_search') return;

    const isNegated = param[0] === '!';
    const isArray = isJSON(value) && Array.isArray(JSON.parse(value));

    const parseBooleanString = (str: string) => {
      if (str.toLowerCase() === 'true') return true;
      else if (str.toLowerCase() === 'false') return false;
      return undefined;
    };

    if (isNegated) {
      const key = labels.find(({ key }) => key === param.slice(1))?.label || capitalize(param.slice(1));
      let chips = labels.find(({ key }) => key === param.slice(1))?.chips || [];
      if (typeof chips === 'boolean') chips = [];
      // @ts-expect-error it will not be boolean
      const matchChip = (v: string) => chips.find(({ value }) => `${value}` === `${v}`)?.label || v;

      if (isArray) {
        JSON.parse(value).forEach((v: string) => {
          items.push({
            key,
            value: matchChip(v),
            negated: isNegated,
            original: { param, paramValue: value, value: v },
          });
        });
      } else {
        items.push({
          key,
          value: (() => {
            const boolean = parseBooleanString(value);
            if (boolean === undefined) return matchChip(value);
            return capitalize(boolean.toString());
          })(),
          negated: isNegated,
          original: { param, paramValue: value, value },
        });
      }
    } else {
      const key = labels.find(({ key }) => key === param)?.label || capitalize(param);
      let chips = labels.find(({ key }) => key === param)?.chips || [];
      if (typeof chips === 'boolean') chips = [];
      // @ts-expect-error it will not be boolean
      const matchChip = (v: string) => chips.find(({ value }) => `${value}` === `${v}`)?.label || v;

      if (isArray) {
        JSON.parse(value).forEach((v: string) => {
          items.push({
            key,
            value: matchChip(v),
            negated: isNegated,
            original: { param, paramValue: value, value: v },
          });
        });
      } else {
        items.push({
          key,
          value: (() => {
            const boolean = parseBooleanString(value);
            if (boolean === undefined) return matchChip(value);
            return capitalize(boolean.toString());
          })(),
          negated: isNegated,
          original: { param, paramValue: value, value },
        });
      }
    }
  });

  return (
    <RowContainer>
      <Row>
        {items.map((item) => {
          return (
            <FilterChip key={item.key + item.value + item.negated} negated={item.negated}>
              <Left negated={item.negated}>
                {item.negated === true ? 'Not ' : ''}
                {item.key}
              </Left>
              <Right negated={item.negated} hasX={item.negated !== undefined || item.original !== undefined}>
                {item.value}
                {item.negated !== undefined || item.original !== undefined ? (
                  <IconButton
                    icon={<FluentIcon name={'Dismiss12Regular'} />}
                    height={'20px'}
                    width={'20px'}
                    backgroundColor={{ base: 'transparent' }}
                    border={{ base: '1px solid transparent' }}
                    color={
                      item.negated
                        ? theme.mode === 'light'
                          ? 'red'
                          : 'orange'
                        : item.negated === false
                        ? 'green'
                        : 'neutral'
                    }
                    cssExtra={css`
                      svg {
                        width: 12px !important;
                        height: 12px !important;
                      }
                    `}
                    onClick={() => {
                      if (item.original) {
                        const { param, paramValue, value } = item.original;
                        const isArray = isJSON(paramValue) && Array.isArray(JSON.parse(paramValue));

                        const newArray = isArray
                          ? JSON.parse(paramValue).filter((v: string | number) => `${v}` !== `${value}`)
                          : [];
                        if (newArray.length > 0) searchParams.set(param, JSON.stringify(newArray));
                        else searchParams.delete(param);

                        navigate('/' + tenant + pathname + hash + '?' + searchParams);
                      }
                    }}
                  />
                ) : null}
              </Right>
            </FilterChip>
          );
        })}
      </Row>
      {items.find((item) => item.key === 'Archived' && item.value === 'True' && item.negated === false) ? (
        <Button
          height={'26px'}
          onClick={() => {
            searchParams.delete('archived');
            navigate('/' + tenant + pathname + hash + '?' + searchParams);
          }}
        >
          Hide archived
        </Button>
      ) : (
        <Button
          height={'26px'}
          onClick={() => {
            searchParams.set('archived', 'true');
            navigate('/' + tenant + pathname + hash + '?' + searchParams);
          }}
        >
          View archived
        </Button>
      )}
    </RowContainer>
  );
}

const RowContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  flex-wrap: no-wrap;
  overflow-y: hidden;
  overflow-x: auto;
  margin: 0 -1px 10px -1px;
  gap: 6px;
  > button {
    flex-shrink: 0;
  }
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: no-wrap;
  overflow-y: hidden;
  overflow-x: auto;
  gap: 6px;
`;

const FilterChip = styled.div<{ negated?: boolean }>`
  height: 26px;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  font-size: 13px;
  font-family: ${({ theme }) => theme.font.detail};
  box-shadow: ${({ theme, negated: n }) => {
      const color = n ? (theme.mode === 'light' ? 'red' : 'orange') : n === false ? 'green' : 'primary';
      const intensity = theme.mode === 'light' ? 800 : 300;
      const transformColor = (color: string) => Color(color).alpha(0.8).string();
      return transformColor(theme.color[color][intensity]);
    }}
    0px 0px 0px 1.25px inset !important;
  border-radius: ${({ theme }) => theme.radius};
  user-select: none;
`;

const Left = styled.div<{ negated?: boolean }>`
  height: 100%;
  display: flex;
  flex-direction: row;
  white-space: nowrap;
  align-items: center;
  font-weight: 500;
  color: ${({ theme, negated: n }) => {
    const color = n ? (theme.mode === 'light' ? 'red' : 'orange') : n === false ? 'green' : 'primary';
    const intensity = theme.mode === 'light' ? 100 : 1400;
    const transformColor = (color: string) => Color(color).string();
    return transformColor(theme.color[color][intensity]);
  }};
  background-color: ${({ theme, negated: n }) => {
    const color = n ? (theme.mode === 'light' ? 'red' : 'orange') : n === false ? 'green' : 'primary';
    const intensity = theme.mode === 'light' ? 800 : 300;
    const transformColor = (color: string) => Color(color).alpha(0.8).string();
    return transformColor(theme.color[color][intensity]);
  }};
  border-radius: ${({ theme }) => theme.radius} 0 0 ${({ theme }) => theme.radius};
  box-sizing: border-box;
  padding: 4px 8px;
`;

const Right = styled.div<{ negated?: boolean; hasX: boolean }>`
  height: 100%;
  display: flex;
  flex-direction: row;
  gap: 3px;
  white-space: nowrap;
  align-items: center;
  font-weight: 400;
  color: ${({ theme, negated: n }) => {
    const color = n ? (theme.mode === 'light' ? 'red' : 'orange') : n === false ? 'green' : 'primary';
    const intensity = theme.mode === 'light' ? 800 : 300;
    const transformColor = (color: string) => Color(color).string();
    return transformColor(theme.color[color][intensity]);
  }};
  background-color: ${({ theme, negated: n }) => {
    const color = n ? (theme.mode === 'light' ? 'red' : 'orange') : n === false ? 'green' : 'primary';
    const intensity = theme.mode === 'light' ? 800 : 300;
    const transformColor = (color: string) => Color(color).alpha(0.1).string();
    return transformColor(theme.color[color][intensity]);
  }};
  border-radius: 0 ${({ theme }) => theme.radius} ${({ theme }) => theme.radius} 0;
  box-sizing: border-box;
  padding: 4px ${({ hasX }) => (hasX ? 3 : 8)}px 4px 8px;
`;

export { CollectionTableFilterRow };
