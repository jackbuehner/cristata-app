import { gql, useQuery } from '@apollo/client';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import Color from 'color';
import { DateTime } from 'luxon';
import { get as getProperty } from 'object-path';
import { useNavigate } from 'svelte-preprocess-react/react-router';
import type { Home } from '../../hooks/useDashboardConfig/useDashboardConfig';
import { genAvatar } from '../../utils/genAvatar';
import type { themeType } from '../../utils/theme/theme';

interface ItemsRowProps {
  query: Home['collectionRows'][0]['query'];
  arrPath: Home['collectionRows'][0]['arrPath'];
  dataKeys: Home['collectionRows'][0]['dataKeys'];
  to: Home['collectionRows'][0]['to'];
}

function timeToString(timestamp: DateTime): string | null {
  if (Math.abs(timestamp.diffNow('minutes').minutes) < 1) return 'just now';
  if (Math.abs(timestamp.diffNow('minutes').minutes) < 3) return 'a few minutes ago';
  if (Math.abs(timestamp.diffNow('minutes').minutes) < 60) return timestamp.toRelative({ unit: 'minutes' });
  if (Math.abs(timestamp.diffNow('hours').hours) < 24) return timestamp.toRelative({ unit: 'hours' });
  if (Math.abs(timestamp.diffNow('days').days) < 30) return timestamp.toRelative({ unit: 'days' });
  if (Math.abs(timestamp.diffNow('weeks').weeks) < 24) return timestamp.toRelative({ unit: 'weeks' });
  if (Math.abs(timestamp.diffNow('months').months) < 12) return timestamp.toRelative({ unit: 'months' });
  if (Math.abs(timestamp.diffNow('months').months) >= 12) return timestamp.toRelative({ unit: 'years' });

  return timestamp.toRelative();
}

function ItemsRow(props: ItemsRowProps) {
  const theme = useTheme() as themeType;
  const navigate = useNavigate();
  const tenant = location.pathname.split('/')[1];

  const namedQuery = props.query.replace('query {', `query ${props.arrPath.split('.')[1]} {`);
  const res = useQuery(gql(namedQuery), { fetchPolicy: 'cache-and-network' });
  const docs = getProperty(res, props.arrPath);

  if (props.to.idPrefix === '/profile/') {
    return (
      <Row>
        {docs?.map((doc: Record<string, any>) => {
          const _id = getProperty(doc, props.dataKeys._id);
          const name = getProperty(doc, props.dataKeys.name)?.replace(' (Provisional)', '');
          const photo = props.dataKeys.photo ? getProperty(doc, props.dataKeys.photo) : undefined;
          const lastActiveAt = timeToString(DateTime.fromISO(getProperty(doc, props.dataKeys.lastModifiedAt)));

          return (
            <Card
              theme={theme}
              key={_id + lastActiveAt}
              onClick={() => navigate('/' + tenant + props.to.idPrefix + _id + props.to.idSuffix)}
            >
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <ProfilePhoto theme={theme} src={photo || genAvatar(_id, 44)} />
                <div>
                  <Name theme={theme}>{name}</Name>
                  <History theme={theme}>Last active {lastActiveAt}</History>
                </div>
              </div>
            </Card>
          );
        })}
      </Row>
    );
  }

  return (
    <Row>
      {docs?.map((doc: Record<string, any>) => {
        const _id = getProperty(doc, props.dataKeys._id);
        const name = getProperty(doc, props.dataKeys.name);
        const description = props.dataKeys.description
          ? getProperty(doc, props.dataKeys.description)
          : undefined;
        const photo = props.dataKeys.photo ? getProperty(doc, props.dataKeys.photo) : undefined;
        const lastModifiedBy = getProperty(doc, props.dataKeys.lastModifiedBy);
        const lastModifiedAt = timeToString(DateTime.fromISO(getProperty(doc, props.dataKeys.lastModifiedAt)));

        return (
          <Card
            theme={theme}
            key={_id + name + description + photo + lastModifiedBy + lastModifiedAt}
            onClick={() => navigate('/' + tenant + props.to.idPrefix + _id + props.to.idSuffix)}
          >
            {props.dataKeys.photo ? <Photo src={photo} theme={theme} /> : null}
            <Name theme={theme}>{name}</Name>
            {description ? <Description theme={theme}>{description}</Description> : null}
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
              {lastModifiedBy} • {lastModifiedAt}
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
  width: 250px;
  box-shadow: ${({ theme }) => `0 0 0 1px ${Color(theme.color.neutral[theme.mode][800]).alpha(0.2).string()}`};
  border-radius: ${({ theme }) => theme.radius};
  flex-shrink: 0;
  ${({ theme }) => `
    &:hover, &:focus, &:active {
      background-color: ${Color(theme.color.primary[theme.mode === 'light' ? 800 : 300])
        .alpha(0.2)
        .string()};
      box-shadow: 0 0 0 1px ${Color(theme.color.primary[theme.mode === 'light' ? 800 : 300])
        .alpha(0.2)
        .string()}, 0 3.6px 7.2px 0 ${Color(theme.color.neutral[theme.mode][1500])
    .alpha(0.13)
    .string()}, 0 0.6px 1.8px 0 ${Color(theme.color.neutral[theme.mode][1500]).alpha(0.13).string()};
    }
    &:hover:active {
      background-color: ${Color(theme.color.primary[theme.mode === 'light' ? 800 : 300])
        .alpha(0.25)
        .string()};
      box-shadow: 0 0 0 1px ${Color(theme.color.primary[theme.mode === 'light' ? 800 : 300])
        .alpha(0.25)
        .string()} 0 1.8px 3.6px 0 ${Color(theme.color.neutral[theme.mode][1500])
    .alpha(0.13)
    .string()}, 0 0.3px 0.9px 0 ${Color(theme.color.neutral[theme.mode][1500]).alpha(0.13).string()};
    }
  `};
  user-select: none;
  cursor: default;
  transition: border-color 160ms, border-radius 160ms, background-color 160ms, box-shadow 160ms;
`;

const Photo = styled.div<{ src: string; theme: themeType }>`
  height: 164px;
  width: 100%;
  background-image: ${({ src }) =>
    src
      ? `url('${src}')`
      : `linear-gradient(
    135deg,
    rgba(84, 56, 185, 1) 0%,
    rgba(59, 64, 172, 1) 60%,
    rgba(56, 65, 170, 1) 80%,
    rgba(28, 73, 155, 1) 100%
  )`};
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  border-radius: ${({ theme }) => `${theme.radius} ${theme.radius} 0 0`};
`;

const ProfilePhoto = styled.div<{ theme: themeType; src?: string }>`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background-image: ${({ src }) =>
    src
      ? `url('${src}')`
      : `linear-gradient(
    135deg,
    rgba(84, 56, 185, 1) 0%,
    rgba(59, 64, 172, 1) 60%,
    rgba(56, 65, 170, 1) 80%,
    rgba(28, 73, 155, 1) 100%
  )`};
  background-position: center;
  background-size: cover;
  margin: 12px 2px 12px 12px;
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
