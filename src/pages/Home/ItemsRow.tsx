import { useTheme } from '@emotion/react';
import styled from '@emotion/styled/macro';
import Color from 'color';
import { DateTime } from 'luxon';
import { useEffect } from 'react';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { flattenObject } from '../../utils/flattenObject';
import { themeType } from '../../utils/theme/theme';

interface IBaseKeys {
  name: string;
  lastModified: string;
  photo?: string;
  description?: string;
  toSuffix: string;
}

interface IHistoryKeys extends IBaseKeys {
  history: string;
}

interface IModifiedByKeys extends IBaseKeys {
  lastModifiedBy: string;
}

interface IItemsRow {
  data: () => Promise<Record<string, unknown>[] | undefined>;
  keys: IHistoryKeys | IModifiedByKeys;
  toPrefix: string;
  isProfile?: boolean;
}

function ItemsRow({ data: dataPromise, ...props }: IItemsRow) {
  const theme = useTheme() as themeType;
  const history = useHistory();

  const [data, setData] = useState<Record<string, any>[]>();
  useEffect(() => {
    dataPromise().then((data) => (data ? setData(data) : null));
  }, [dataPromise]);

  if (props.isProfile) {
    return (
      <Row>
        {data?.map((item: Record<string, any>, index: number) => {
          // flatten the object
          item = flattenObject(item);

          // format the date for which this user last signed in
          const lastSignIn = DateTime.fromISO(item[props.keys.lastModified]).toFormat(`LLL. dd, yyyy`);

          return (
            <Card
              theme={theme}
              key={index}
              onClick={() => history.push(props.toPrefix + item[props.keys.toSuffix])}
            >
              <Name theme={theme}>{item[props.keys.name]}</Name>
              <History theme={theme}>Last signed in at {lastSignIn}</History>
            </Card>
          );
        })}
      </Row>
    );
  }

  return (
    <Row>
      {data?.map((item: Record<string, any>, index: number) => {
        // flatten the object
        item = flattenObject(item);

        // get the user id of the last user who modified this item
        let lastModifiedBy: { name: string } = { name: 'Unknown' };
        // @ts-expect-error props.keys.history might exist
        if (props.keys.history) {
          lastModifiedBy.name =
            // @ts-expect-error props.keys.history might exist
            item[props.keys.history]?.[item[props.keys.history]?.length - 1]?.user?.name || 'Unknown';
        }
        // @ts-expect-error props.keys.lastModifiedBy might exist
        else if (props.keys.lastModifiedBy)
          // @ts-expect-error props.keys.lastModifiedBy might exist
          lastModifiedBy.name = item[props.keys.lastModifiedBy];

        // format the date for which this item was last modified
        const lastModifiedAt = DateTime.fromISO(item[props.keys.lastModified]).toFormat(`LLL. dd, yyyy`);

        return (
          <Card
            theme={theme}
            key={index}
            onClick={() => history.push(props.toPrefix + item[props.keys.toSuffix])}
          >
            {props.keys.photo ? <Photo src={item[props.keys.photo]} theme={theme} /> : null}
            <Name theme={theme}>{item[props.keys.name]}</Name>
            {props.keys.description ? (
              <Description theme={theme}>{item[props.keys.description]}</Description>
            ) : null}
            <div
              style={{
                margin: '10px 10px -4px 10px',
                color: '#6b6b6b',
                fontSize: 10,
                textTransform: 'uppercase',
              }}
            >
              Updated by
            </div>
            <History theme={theme}>
              {lastModifiedBy.name} • {lastModifiedAt}
            </History>
          </Card>
        );
      })}
    </Row>
  );
}

const Row = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10px;
  width: 100%;
  margin-top: 12px;
`;

const Card = styled.div<{ theme: themeType }>`
  width: 200px;
  box-shadow: ${({ theme }) => `0 0 0 1px ${Color(theme.color.neutral[theme.mode][800]).alpha(0.2).string()}`};
  border-radius: ${({ theme }) => theme.radius};
  flex-shrink: 0;
  ${({ theme }) => `
    &:hover, &:focus, &:active {
      background-color: ${Color(theme.color.primary[800]).alpha(0.2).string()};
      box-shadow: 0 0 0 1px ${Color(theme.color.primary[800]).alpha(0.2).string()}, 0 3.6px 7.2px 0 ${Color(
    theme.color.neutral[theme.mode][1500]
  )
    .alpha(0.13)
    .string()}, 0 0.6px 1.8px 0 ${Color(theme.color.neutral[theme.mode][1500]).alpha(0.13).string()};
    }
    &:hover:active {
      background-color: ${Color(theme.color.primary[800]).alpha(0.25).string()};
      box-shadow: 0 0 0 1px ${Color(theme.color.primary[800]).alpha(0.25).string()} 0 1.8px 3.6px 0 ${Color(
    theme.color.neutral[theme.mode][1500]
  )
    .alpha(0.13)
    .string()}, 0 0.3px 0.9px 0 ${Color(theme.color.neutral[theme.mode][1500]).alpha(0.13).string()};
    }
  `};
  user-select: none;
  cursor: default;
  transition: border-color 160ms, border-radius 160ms, background-color 160ms, box-shadow 160ms;
`;

const Photo = styled.div<{ src: string; theme: themeType }>`
  height: 130px;
  width: 100%;
  background-image: ${({ src }) => `url('${src}')`};
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  border-radius: ${({ theme }) => `${theme.radius} ${theme.radius} 0 0`};
`;

const Name = styled.h3<{ theme: themeType }>`
  font-family: ${({ theme }) => theme.font.detail};
  font-size: 15px;
  font-weight: 600;
  color: ${({ theme }) => theme.color.neutral[theme.mode][1200]};
  margin: 10px 10px 6px 10px;
`;

const Description = styled.div<{ theme: themeType }>`
  font-family: ${({ theme }) => theme.font.detail};
  font-size: 13px;
  font-weight: 400;
  color: ${({ theme }) => theme.color.neutral[theme.mode][1200]};
  margin: 6px 10px;
`;

const History = styled.div<{ theme: themeType }>`
  font-family: ${({ theme }) => theme.font.detail};
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.color.neutral[theme.mode][900]};
  margin: 6px 10px 10px 10px;
`;

export { ItemsRow };
