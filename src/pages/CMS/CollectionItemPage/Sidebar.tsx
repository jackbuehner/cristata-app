import { useApolloClient } from '@apollo/client';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { ChevronUpDown24Regular, Open24Regular, PeopleTeam16Regular } from '@fluentui/react-icons';
import { NumberOption, StringOption } from '@jackbuehner/cristata-generator-schema';
import Color from 'color';
import JSONCrush from 'jsoncrush';
import { useEffect, useState } from 'react';
import { useModal } from '@cristata/react-modal-hook';
import ReactTooltip from 'react-tooltip';
import { Button, buttonEffect } from '../../../components/Button';
import { Checkbox } from '../../../components/Checkbox';
import { CollaborativeSelectOne } from '../../../components/CollaborativeFields';
import { populateReferenceValues } from '../../../components/ContentField/populateReferenceValues';
import { PlainModal } from '../../../components/Modal';
import { useAwareness } from '../../../components/Tiptap/hooks';
import { EntryY, IYSettingsMap } from '../../../components/Tiptap/hooks/useY';
import { useForceUpdate } from '../../../hooks/useForceUpdate';
import { formatISODate } from '../../../utils/formatISODate';
import { genAvatar } from '../../../utils/genAvatar';
import { listOxford } from '../../../utils/listOxford';
import { colorType, themeType } from '../../../utils/theme/theme';
import { GetYFieldsOptions } from './getYFields';
import { PreviewFrame } from './PreviewFrame';

interface SidebarProps {
  docInfo: {
    _id: string;
    createdAt: string;
    modifiedAt: string;
    collectionName: string;
    tenant: string;
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
  dynamicPreviewUrl?: string;
  compact?: boolean;
  y: EntryY;
  user?: ReturnType<typeof useAwareness>[0];
  disabled?: boolean;
  getFieldValues: (opts: GetYFieldsOptions) => Promise<any>;
  hideVersions?: boolean;
  previewFrame?: React.ReactNode;
}

function Sidebar(props: SidebarProps) {
  const theme = useTheme() as themeType;
  const client = useApolloClient();
  const forceUpdate = useForceUpdate();
  const tenant = location.pathname.split('/')[1];

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

  const versionsList = props.y.ydoc?.getArray<{ timestamp: string; users: ReturnType<typeof useAwareness> }>(
    '__internal_versionsList'
  );
  const [truncateVersionsList, setTruncateVersionsList] = useState(true);

  const [openPreview, hidePreview] = useModal(() => {
    return (
      <PlainModal
        title='Preview'
        hideModal={() => hidePreview()}
        cancelButton={null}
        continueButton={{ text: 'Close' }}
        styleString={`
          width: 90vw;
          height: 90vh;
          display: flex;
          flex-direction: column;
          background-color: ${theme.mode === 'dark' ? theme.color.neutral.dark[100] : 'white'};
          > h1 {
            border-color: ${theme.color.neutral[theme.mode][200]};
          }
          > div:first-of-type {
            padding: 0;
            > p {
              min-height: 100%;
              display: flex;
              flex-direction: column;
              > iframe {
                flex-grow: 1;
              }
            }
          }
          > div:nth-of-type(2) {
            border-color: ${theme.color.neutral[theme.mode][200]};
          }
        `}
      >
        {props.isEmbedded && props.dynamicPreviewUrl ? (
          <PreviewFrame src={props.dynamicPreviewUrl} y={props.y} />
        ) : null}
      </PlainModal>
    );
  }, [props.y, props.dynamicPreviewUrl, props.isEmbedded]);

  return (
    <Container theme={theme} compact={props.compact}>
      <SectionTitle theme={theme}>Document Information</SectionTitle>
      <DocInfoRow theme={theme}>
        <div>ID</div>
        <div>{props.docInfo._id.slice(0, 24)}</div>
      </DocInfoRow>
      <DocInfoRow theme={theme}>
        <div>Created</div>
        <div>{formatISODate(props.docInfo.createdAt, undefined, undefined, true)}</div>
      </DocInfoRow>
      <DocInfoRow theme={theme}>
        <div>Last updated</div>
        <div>{formatISODate(props.docInfo.modifiedAt, undefined, undefined, true)}</div>
      </DocInfoRow>
      {true ? null : (
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
      )}
      {props.stage ? (
        <>
          <SectionTitle theme={theme}>Stage</SectionTitle>
          {typeof props.stage.current === 'string' && typeof props.stage.options[0].value === 'string' ? (
            <CollaborativeSelectOne
              y={{ ...props.y, field: props.stage.key, user: props.user }}
              options={(props.stage.options as StringOption[]).map((opt) => {
                return {
                  ...opt,
                  disabled: opt.value === '5.2' ? true : opt.disabled,
                  code: opt.value,
                };
              })}
              color={props.isEmbedded ? 'blue' : 'primary'}
              disabled={props.loading || props.disabled || props.stage.current === '5.2'}
              isEmbedded
            />
          ) : (
            <CollaborativeSelectOne
              y={{ ...props.y, field: props.stage.key, user: props.user }}
              options={(props.stage.options as NumberOption[]).map((opt) => {
                return {
                  ...opt,
                  value: opt.value.toString(),
                  label: opt.label.toString(),
                  disabled: opt.value === 5.2 ? true : opt.disabled,
                  code: opt.value.toString(),
                };
              })}
              number={'decimal'}
              color={props.isEmbedded ? 'blue' : 'primary'}
              disabled={props.loading || props.disabled || props.stage.current === 5.2}
              isEmbedded
              showCurrentSelectionInOptions
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
                  onClick={() => {
                    window.open(
                      `/${tenant}/profile/${profile._id}`,
                      'sidebar_user' + props.docInfo._id + profile._id,
                      'location=no'
                    );
                  }}
                />
              );
            })}
          </div>
        </>
      )}
      {props.previewUrl || (props.isEmbedded && props.dynamicPreviewUrl) ? (
        <>
          <SectionTitle theme={theme}>Preview</SectionTitle>
          {props.isEmbedded && props.dynamicPreviewUrl ? (
            <>
              <Button width={'100%'} icon={<Open24Regular />} onClick={openPreview}>
                Open preview
              </Button>
            </>
          ) : props.previewUrl ? (
            <Button
              width={'100%'}
              icon={<Open24Regular />}
              onClick={async () =>
                window.open(
                  props.previewUrl +
                    `?data=${encodeURIComponent(
                      JSONCrush.crush(
                        JSON.stringify(await props.getFieldValues({ retainReferenceObjects: true }))
                      )
                    )}`,
                  `sidebar_preview` + props.docInfo._id,
                  'location=no'
                )
              }
              onAuxClick={async () => {
                const values = await props.getFieldValues({ retainReferenceObjects: true });
                console.log(JSONCrush.crush(JSON.stringify(values)));
                console.log(values);
              }}
            >
              Open preview
            </Button>
          ) : null}
        </>
      ) : null}
      {props.docInfo.collectionName === 'File' ? (
        <>
          <SectionTitle theme={theme}>Download</SectionTitle>
          <Button
            width={'100%'}
            icon={<Open24Regular />}
            onClick={async () => {
              const href = `${import.meta.env.VITE_API_PROTOCOL}//${
                import.meta.env.VITE_API_BASE_URL
              }/filestore/${props.docInfo.tenant}/${props.docInfo._id}`;
              window.open(href, `sidebar_preview` + props.docInfo._id + 'File', 'location=no');
            }}
          >
            Open file for download
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
                    `/${tenant}/profile/${user._id}`,
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
                    `/${tenant}/teams/${team._id}`,
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
      {!props.isEmbedded && !props.compact && !props.hideVersions ? (
        <>
          <SectionTitle theme={theme}>Versions</SectionTitle>
          {versionsList
            ?.toArray()
            .reverse()
            .slice(0, truncateVersionsList ? 3 : undefined)
            .map((version, index) => {
              // format the date to only include the time when it is not a timestamp
              // from a day with cosolidated versions
              const formattedDate = (() => {
                // time of day is empty for consolidated versions
                if (version.timestamp.includes('T00:00:00.000Z')) {
                  return formatISODate(version.timestamp, true, true, false);
                }
                return formatISODate(version.timestamp, true, true, true);
              })();

              // fall back to Unknown user when there are no users attributed to a version
              const users = version.users.length > 0 ? version.users.map((user) => user.name) : ['Unknown'];

              const onClick = () => {
                const url = new URL(window.location.href);
                url.pathname = url.pathname + '/version/' + version.timestamp;

                window.open(
                  url.toString(),
                  `sidebar_version_open` + props.docInfo._id + version.timestamp,
                  'location=no'
                );
              };

              return (
                <VersionCard key={index} onClick={onClick}>
                  <div>{formattedDate}</div>
                  <div>{listOxford(users)}</div>
                </VersionCard>
              );
            })}
          {truncateVersionsList ? (
            <Button
              width={'100%'}
              icon={<ChevronUpDown24Regular />}
              onClick={async () => setTruncateVersionsList(false)}
            >
              Show more versions
            </Button>
          ) : null}
        </>
      ) : null}
    </Container>
  );
}

const Container = styled.div<{ theme: themeType; compact?: boolean }>`
  width: ${({ compact }) => (compact ? '100%' : '310px')};
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
  width: 28px;
  height: 28px;
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
  transition: 120ms;
  box-shadow: inset 0 0 0 2px ${({ color }) => color};
  &:hover {
    background-blend-mode: overlay;
    border-radius: ${({ theme }) => theme.radius};
    box-shadow: inset 0 0 0 2px ${({ color }) => color},
      0 0 3px 0.5px ${({ color }) => Color(color).darken(0.3).string()};
    background-color: ${({ color }) => Color(color).alpha(0.45).string()};
  }
  &:active {
    background-blend-mode: overlay;
    background-color: ${({ color }) => Color(color).alpha(0.7).string()};
  }
`;

const VersionCard = styled.div`
  padding: 10px;
  font-family: ${({ theme }) => theme.font.detail};
  font-size: 14px;
  margin-bottom: 6px;
  border-radius: ${({ theme }) => theme.radius};
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 2px;
  user-select: none;
  ${({ theme }) =>
    buttonEffect('primary', theme.mode === 'light' ? 700 : 300, theme, false, {
      base: 'transparent',
    })}
  box-shadow: ${({ theme }) => theme.color.neutral[theme.mode][200]} 0px 0px 0px 1px inset;
  background-color: ${({ theme }) =>
    theme.mode === 'dark'
      ? Color(theme.color.neutral.dark[100]).lighten(0.2).string()
      : Color('#ffffff').darken(0.03).string()};
  > *:nth-of-type(1) {
    color: ${({ theme }) => theme.color.neutral[theme.mode][1200]};
  }
  > *:nth-of-type(2) {
    color: ${({ theme }) => theme.color.neutral[theme.mode][1000]};
  }
`;

export { Sidebar };
