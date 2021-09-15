import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import useAxios from 'axios-hooks';
import { DateTime } from 'luxon';
import { useHistory } from 'react-router-dom';
import { IProfile } from '../../interfaces/cristata/profiles';
import { themeType } from '../../utils/theme/theme';

/**
 * Displays the recent actiivty in the CMS.
 *
 * The recent activity is retireved from the `/history` endpoint.
 */
function RecentActivity() {
  const theme = useTheme() as themeType;
  const history = useHistory();

  interface Ihistory {
    _id: string;
    name: string;
    collection: string;
    history: Array<{
      type: string;
      user: number;
      at: string;
    }>;
  }

  const [{ data: itemHistory }] = useAxios<Ihistory[]>(`/history`);
  const [{ data: profiles }] = useAxios<IProfile[]>(`/users`);

  return (
    <>
      {
        // generate lines for each history item
        itemHistory?.slice(0, 6).map((item, index: number) => {
          let { user, type, at } = item.history[item.history.length - 1];

          const userName = profiles?.find((profile) => profile.github_id === user)?.name;

          // rename history types
          type =
            type === 'patched'
              ? 'modified'
              : type === 'created'
              ? 'created'
              : type === 'hidden'
              ? 'removed'
              : 'modified';

          return (
            <ItemWrapper theme={theme}>
              <Item>
                <Profile
                  theme={theme}
                  src={`${process.env.REACT_APP_API_PROTOCOL}://${process.env.REACT_APP_API_BASE_URL}/api/v2/users/${user}/photo`}
                />
                <Text>
                  <Bold onClick={() => history.push(`/profile/${user}`)}>{userName || user}</Bold>
                  <span> {type} </span>
                  <Bold onClick={() => history.push(`/cms/item/${item.collection}/${item._id}`)}>
                    {item.name}
                  </Bold>
                  <span> in </span>
                  <span>{item.collection}</span>
                </Text>
              </Item>
              <Date theme={theme}>{DateTime.fromISO(at).toRelative()}</Date>
            </ItemWrapper>
          );
        })
      }
    </>
  );
}

const ItemWrapper = styled.div<{ theme: themeType }>`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: ${({ theme }) => theme.color.neutral[theme.mode][1400]};
  padding: 8px 0;
  &:first-of-type {
    margin-top: 12px;
    @media (max-width: 1200px) {
      margin-top: 6px;
    }
  }
`;

const Item = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const Text = styled.div`
  margin: 0 8px;
`;

const Date = styled.div<{ theme: themeType }>`
  flex-shrink: 0;
  font-size: 11px;
  color: ${({ theme }) => theme.color.neutral[theme.mode][900]};
`;

const Bold = styled.a`
  font-weight: 700;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;

const Profile = styled.img<{ theme: themeType }>`
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  border-radius: ${({ theme }) => theme.radius};
`;

export { RecentActivity };
