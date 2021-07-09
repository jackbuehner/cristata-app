import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import useAxios from 'axios-hooks';
import Color from 'color';
import { DateTime } from 'luxon';
import { useHistory } from 'react-router-dom';
import { IProfile } from '../../interfaces/cristata/profiles';
import { flattenObject } from '../../utils/flattenObject';
import { themeType } from '../../utils/theme/theme';

interface IItemsRow {
  data?: Record<string, any>[];
  keys: {
    name: string;
    history: string;
    lastModified: string;
    photo?: string;
    description?: string;
    toSuffix: string;
  };
  toPrefix: string;
}

function ItemsRow(props: IItemsRow) {
  const theme = useTheme() as themeType;
  const history = useHistory();

  const [{ data: users }] = useAxios<IProfile[]>(`/users`);

  if (props.data && props.keys) {
    return (
      <Row>
        {props.data.map((item, index) => {
          item = flattenObject(item);
          console.log(item);
          const lastHistory = item[props.keys.history][item[props.keys.history].length - 1];
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
              <History theme={theme}>
                {users?.find((user) => user.github_id === lastHistory.user)?.name} •{' '}
                {DateTime.fromISO(item[props.keys.lastModified]).toFormat(`LLL. dd, yyyy`)}
              </History>
            </Card>
          );
        })}
      </Row>
    );
  }
  return null;
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
