import { useApolloClient } from '@apollo/client';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled/macro';
import { Open24Regular, PeopleTeam16Regular } from '@fluentui/react-icons';
import {
  NumberOption,
  StringOption,
} from '@jackbuehner/cristata-api/dist/api/graphql/helpers/generators/genSchema';
import Color from 'color';
import JSONCrush from 'jsoncrush';
import { useEffect, useState } from 'react';
import ReactTooltip from 'react-tooltip';
import { Button, buttonEffect } from '../../../components/Button';
import { Checkbox } from '../../../components/Checkbox';
import { CollaborativeSelectOne } from '../../../components/CollaborativeFields';
import { populateReferenceValues } from '../../../components/ContentField/populateReferenceValues';
import { useAwareness } from '../../../components/Tiptap/hooks';
import { EntryY, IYSettingsMap } from '../../../components/Tiptap/hooks/useY';
import { useForceUpdate } from '../../../hooks/useForceUpdate';
import { formatISODate } from '../../../utils/formatISODate';
import { genAvatar } from '../../../utils/genAvatar';
import { colorType, themeType } from '../../../utils/theme/theme';
import { GetYFieldsOptions } from './getYFields';

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
  } | null;
  permissions: {
    users: { _id: string; name: string; photo?: string; color: string }[];
    teams: { _id: string; name?: string; color: string }[];
  } | null;
  loading?: boolean;
  isEmbedded?: boolean;
  previewUrl?: string;
  compact?: boolean;
  y: EntryY;
  user?: ReturnType<typeof useAwareness>[0];
  getFieldValues: (opts: GetYFieldsOptions) => any;
}

function Sidebar(props: SidebarProps) {
  const theme = useTheme() as themeType;
  const client = useApolloClient();
  const forceUpdate = useForceUpdate();

  ReactTooltip.rebuild();

  const [teams, setTeams] = useState<{ _id: string; name: string; color: string }[] | undefined>(undefined);
  useEffect(() => {
    let mounted = true;

    (async () => {
      if (mounted && props.permissions) {
        const valuesAreLooselyDifferent = !props.permissions.teams.every(({ _id: propValue }) => {
          const internalValues = teams?.map(({ _id }) => _id) || [];
          return internalValues.includes(propValue);
        });
        if (mounted && valuesAreLooselyDifferent) {
          const newTeams = (await populateReferenceValues(client, props.permissions.teams, 'Team')).map(
            (t, i) => {
              return {
                _id: t._id,
                name: t.label,
                color: props.permissions!.teams[i].color,
              };
            }
          );
          // only set the state if the component is still mounted
          if (mounted) setTeams(newTeams);
        }
      }
    })();

    return () => {
      // set mounted to false so the async functions above
      // do not attempt to set the state after the component
      // has unmounted
      mounted = false;
    };
  }, [client, props.permissions, teams]);

  const ySettingsMap = props.y.ydoc?.getMap<IYSettingsMap>('__settings');

  return (
    <Container theme={theme} compact={props.compact}>
      <SectionTitle theme={theme}>Document Information</SectionTitle>
      <DocInfoRow theme={theme}>
        <div>Created</div>
        <div>{formatISODate(props.docInfo.createdAt, undefined, undefined, true)}</div>
      </DocInfoRow>
      <DocInfoRow theme={theme}>
        <div>Last updated</div>
        <div>{formatISODate(props.docInfo.modifiedAt, undefined, undefined, true)}</div>
      </DocInfoRow>
      <DocInfoRow
        theme={theme}
        style={{
          flexDirection: 'row-reverse',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: 10,
          marginTop: 10,
        }}
      >
        <label htmlFor={'autosave'} style={{ userSelect: 'none' }}>
          Autosave
        </label>
        <Checkbox
          isChecked={!!ySettingsMap?.get('autosave')}
          id={'autosave'}
          onChange={(e) => {
            ySettingsMap?.set('autosave', e.currentTarget.checked);
            forceUpdate();
          }}
        />
      </DocInfoRow>
      {props.stage ? (
        <>
          <SectionTitle theme={theme}>Stage</SectionTitle>
          {typeof props.stage.current === 'string' && typeof props.stage.options[0].value === 'string' ? (
            <CollaborativeSelectOne
              label={'Stage'}
              y={{ ...props.y, field: props.stage.key, user: props.user }}
              options={props.stage.options as StringOption[]}
              color={props.isEmbedded ? 'blue' : 'primary'}
              disabled={props.loading}
              isEmbedded
            />
          ) : (
            <CollaborativeSelectOne
              label={'Stage'}
              y={{ ...props.y, field: props.stage.key, user: props.user }}
              options={(props.stage.options as NumberOption[]).map((opt) => ({
                ...opt,
                value: opt.value.toString(),
                label: opt.label.toString(),
              }))}
              number={'decimal'}
              color={props.isEmbedded ? 'blue' : 'primary'}
              disabled={props.loading}
              isEmbedded
            />
          )}
        </>
      ) : null}
      {props.isEmbedded ? null : (
        <>
          <SectionTitle theme={theme}>Current editors</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'row', gap: 6, flexWrap: 'wrap', minHeight: 28 }}>
            {props.y.awareness?.map((profile, index) => {
              return (
                <AwarenessPhoto
                  key={index}
                  photo={profile.photo}
                  color={profile.color}
                  data-tip={profile.name}
                  data-delay-show={0}
                  data-effect={'solid'}
                  data-place={'bottom'}
                  data-offset={`{ 'bottom': 4 }`}
                />
              );
            })}
          </div>
        </>
      )}
      {props.previewUrl ? (
        <>
          <SectionTitle theme={theme}>Preview</SectionTitle>
          <Button
            width={'100%'}
            icon={<Open24Regular />}
            onClick={() =>
              window.open(
                props.previewUrl +
                  `?data=${encodeURIComponent(
                    JSONCrush.crush(JSON.stringify(props.getFieldValues({ retainReferenceObjects: true })))
                  )}`,
                `sidebar_preview` + props.docInfo._id,
                'location=no'
              )
            }
            onAuxClick={() => {
              const values = props.getFieldValues({ retainReferenceObjects: true });
              console.log(JSONCrush.crush(JSON.stringify(values)));
              console.log(values);
            }}
          >
            Open preview
          </Button>
        </>
      ) : null}
      {props.permissions ? (
        <>
          <SectionTitle theme={theme}>Access</SectionTitle>
          {props.permissions.users.map((user) => {
            return (
              <AccessRow
                theme={theme}
                color={props.isEmbedded ? 'blue' : 'primary'}
                key={user._id}
                onClick={() => {
                  window.open(
                    `/profile/${user._id}`,
                    'sidebar_user' + props.docInfo._id + user._id,
                    'location=no'
                  );
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
                color={props.isEmbedded ? 'blue' : 'primary'}
                key={team._id}
                onClick={() => {
                  window.open(
                    `/teams/${team._id}`,
                    'sidebar_team' + props.docInfo._id + team._id,
                    'location=no'
                  );
                }}
              >
                <TeamIcon theme={theme} color={team.color} />
                <div style={{ flexGrow: 1 }}>{team.name}</div>
              </AccessRow>
            );
          })}
        </>
      ) : null}
    </Container>
  );
}

const Container = styled.div<{ theme: themeType; compact?: boolean }>`
  width: ${({ compact }) => (compact ? '100%' : '300px')};
  background-color: ${({ theme, compact }) => {
    if (compact) {
      if (theme.mode === 'dark') return Color(theme.color.neutral[theme.mode][200]).alpha(0.3).string();
      return Color(`#ffffff`).alpha(0.4).string();
    } else {
      if (theme.mode === 'dark') return theme.color.neutral[theme.mode][100];
      return '#ffffff';
    }
  }};
  border: ${({ compact }) => (compact ? `1px solid` : `none`)};
  border-radius: ${({ theme, compact }) => (compact ? theme.radius : 0)};
  border-left: 1px solid;
  border-color: ${({ theme }) => theme.color.neutral[theme.mode][200]};
  flex-grow: 0;
  flex-shrink: 0;
  padding: ${({ compact }) => (compact ? '4px 16px 14px 16px' : '20px')};
  margin-bottom: ${({ compact }) => (compact ? '16px' : '0px')};
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
  > *:nth-of-type(1) {
    color: ${({ theme }) => theme.color.neutral[theme.mode][1200]};
  }
  > *:nth-of-type(2) {
    color: ${({ theme }) => theme.color.neutral[theme.mode][1000]};
  }
`;

const AccessRow = styled.div<{ theme: themeType; disabled?: boolean; color?: colorType }>`
  ${({ theme, disabled, color }) =>
    buttonEffect(
      color || 'primary',
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

const AwarenessPhoto = styled.div<{ color: string; photo: string }>`
  width: 24px;
  height: 24px;
  border: 2px solid ${({ color }) => color};
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: ${({ theme }) => theme.font.headline};
  border-radius: 50%;
  font-size: 14px;
  background-color: ${({ color }) => Color(color).alpha(0.4).string()};
  background-image: url('${({ photo }) => photo}');
  user-select: none;
  color: ${({ theme }) => theme.color.neutral[theme.mode][1200]};
  background-position: center;
  background-size: cover;
`;

export { Sidebar };
