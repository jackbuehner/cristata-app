import { useTheme } from '@emotion/react';
import styled from '@emotion/styled/macro';
import { PeopleTeam16Regular } from '@fluentui/react-icons';
import { NumberOption, StringOption } from '@jackbuehner/cristata-api/dist/api/v3/helpers/generators/genSchema';
import { SelectOne } from '../../../components/ContentField';
import { useAppDispatch } from '../../../redux/hooks';
import { setField } from '../../../redux/slices/cmsItemSlice';
import { formatISODate } from '../../../utils/formatISODate';
import { genAvatar } from '../../../utils/genAvatar';
import { themeType } from '../../../utils/theme/theme';
import { buttonEffect } from '../../../components/Button';
import { useEffect, useState } from 'react';
import { populateReferenceValues } from '../../../components/ContentField/populateReferenceValues';
import Color from 'color';

interface SidebarProps {
  docInfo: {
    _id: string;
    createdAt: string;
    modifiedAt: string;
  };
  stage: {
    current: string | number;
    options: StringOption[] | NumberOption[];
    key: string;
  };
  permissions: {
    users: { _id: string; name: string; photo?: string; color: string }[];
    teams: { _id: string; name?: string; color: string }[];
  };
  loading?: boolean;
  isEmbedded?: boolean;
}

function Sidebar(props: SidebarProps) {
  const dispatch = useAppDispatch();
  const theme = useTheme() as themeType;

  const [teams, setTeams] = useState<{ _id: string; name: string; color: string }[] | undefined>(undefined);
  useEffect(() => {
    (async () => {
      const valuesAreLooselyDifferent = !props.permissions.teams.every(({ _id: propValue }) => {
        const internalValues = teams?.map(({ _id }) => _id) || [];
        return internalValues.includes(propValue);
      });
      if (valuesAreLooselyDifferent) {
        setTeams(
          (await populateReferenceValues(props.permissions.teams, 'Team')).map((t, i) => {
            return {
              _id: t._id,
              name: t.label,
              color: props.permissions.teams[i].color,
            };
          })
        );
      }
    })();
  }, [props.permissions.teams, teams]);

  return (
    <Container theme={theme} isEmbedded={props.isEmbedded}>
      <SectionTitle theme={theme}>Document Information</SectionTitle>
      <DocInfoRow theme={theme}>
        <div>Created</div>
        <div>{formatISODate(props.docInfo.createdAt, undefined, undefined, true)}</div>
      </DocInfoRow>
      <DocInfoRow theme={theme}>
        <div>Last updated</div>
        <div>{formatISODate(props.docInfo.modifiedAt, undefined, undefined, true)}</div>
      </DocInfoRow>
      <SectionTitle theme={theme}>Stage</SectionTitle>
      {typeof props.stage.current === 'string' && typeof props.stage.options[0].value === 'string' ? (
        <SelectOne
          type={'String'}
          options={props.stage.options}
          label={'Stage'}
          value={(props.stage.options as StringOption[]).find(({ value }) => value === props.stage.current)}
          onChange={(value) => {
            const newValue = value?.value;
            if (newValue) dispatch(setField(newValue, props.stage.key));
          }}
          disabled={props.loading}
        />
      ) : (
        <SelectOne
          type={'Float'}
          options={props.stage.options}
          label={'__in-select'}
          value={(props.stage.options as NumberOption[]).find(({ value }) => value === props.stage.current)}
          onChange={(value) => {
            const newValue = value?.value;
            if (newValue) dispatch(setField(newValue, props.stage.key));
          }}
          disabled={props.loading}
        />
      )}
      <SectionTitle theme={theme}>Access</SectionTitle>
      {props.permissions.users.map((user) => {
        return (
          <AccessRow
            theme={theme}
            key={user._id}
            onClick={() => {
              window.open(`/profile/${user._id}`, 'sidebar_user' + props.docInfo._id + user._id, 'location=no');
            }}
          >
            <ProfilePhoto theme={theme} src={user.photo || genAvatar(user._id)} color={user.color} />
            <div style={{ flexGrow: 1 }}>{user.name}</div>
          </AccessRow>
        );
      })}
      {teams?.map((team) => {
        return (
          <AccessRow
            theme={theme}
            key={team._id}
            onClick={() => {
              window.open(`/teams/${team._id}`, 'sidebar_team' + props.docInfo._id + team._id, 'location=no');
            }}
          >
            <TeamIcon theme={theme} color={team.color} />
            <div style={{ flexGrow: 1 }}>{team.name}</div>
          </AccessRow>
        );
      })}
    </Container>
  );
}

const Container = styled.div<{ theme: themeType; isEmbedded?: boolean }>`
  width: 300px;
  background-color: ${({ theme, isEmbedded }) => {
    if (isEmbedded) {
      if (theme.mode === 'dark') return Color(theme.color.neutral[theme.mode][200]).alpha(0.3).string();
      return '#ffffff';
    } else {
      if (theme.mode === 'dark') return theme.color.neutral[theme.mode][100];
      return '#ffffff';
    }
  }};
  border: ${({ isEmbedded }) => (isEmbedded ? `1px solid` : `none`)};
  border-radius: ${({ theme, isEmbedded }) => (isEmbedded ? theme.radius : 0)};
  border-left: 1px solid;
  border-color: ${({ theme }) => theme.color.neutral[theme.mode][200]};
  flex-grow: 0;
  flex-shrink: 0;
  padding: ${({ isEmbedded }) => (isEmbedded ? '4px 16px 14px 16px' : '20px')};
  margin-bottom: ${({ isEmbedded }) => (isEmbedded ? '16px' : '0px')};
  box-sizing: border-box;
  overflow: auto;
`;

const SectionTitle = styled.div<{ theme: themeType }>`
  font-family: ${({ theme }) => theme.font.detail};
  font-size: 12px;
  font-weight: 400;
  text-decoration: none;
  color: ${({ theme }) => theme.color.neutral[theme.mode][1000]};
  line-height: 48px;
  margin: 0px;
  letter-spacing: 1px;
  text-transform: uppercase;
`;

const DocInfoRow = styled.div<{ theme: themeType }>`
  font-family: ${({ theme }) => theme.font.detail};
  font-size: 14px;
  line-height: 24px;
  margin: 0 0 4px 0;
  font-weight: 400;
  text-decoration: none;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  > div:nth-of-type(1) {
    color: ${({ theme }) => theme.color.neutral[theme.mode][1200]};
  }
  > div:nth-of-type(2) {
    color: ${({ theme }) => theme.color.neutral[theme.mode][1000]};
  }
`;

const AccessRow = styled.div<{ theme: themeType; disabled?: boolean }>`
  ${({ theme, disabled }) =>
    buttonEffect(
      'primary',
      theme.mode === 'light' ? 700 : 300,
      theme,
      disabled,
      { base: 'transparent' },
      { base: '1px solid transparent' }
    )}
  font-family: ${({ theme }) => theme.font.detail};
  font-size: 14px;
  line-height: 24px;
  margin: 0 0 4px 0;
  font-weight: 400;
  text-decoration: none;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: left;
  gap: 6px;
  color: ${({ theme }) => theme.color.neutral[theme.mode][1000]};
  border-radius: ${({ theme }) => theme.radius};
`;

const ProfilePhoto = styled.div<{ theme: themeType; src?: string; color: string }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${({ src }) => `url(${src})`};
  background-position: center;
  background-size: cover;
  box-shadow: inset 0 0 0 2px ${({ color }) => color};
`;

const TeamIcon = styled(PeopleTeam16Regular)<{ theme: themeType; color: string }>`
  border: none !important;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  justify-content: center;
  width: 24px;
  min-height: 24px;
  margin: 0 1px 0 0;
  box-shadow: inset 0 0 0 2px ${({ color }) => color};
  background-color: ${({ color }) => Color(color).lighten(0.5).hex()};
  color: ${({ theme }) => theme.color.neutral['light'][1200]};
  border-radius: ${({ theme }) => theme.radius};
  > svg {
    width: 16px;
    height: 16px;
  }
`;

export { Sidebar };
