import { DocumentNode, gql, useApolloClient } from '@apollo/client';
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import styled from '@emotion/styled/macro';
import Color from 'color';
import { copy } from 'copy-anything';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '../../../components/Button';
import { Card, SortableCard } from '../../../components/Card';
import { Checkbox, ReferenceMany, Text } from '../../../components/ContentField';
import { Field } from '../../../components/ContentField/Field';
import { useAppDispatch } from '../../../redux/hooks';
import { setAppActions, setAppLoading, setAppName } from '../../../redux/slices/appbarSlice';
import { colorType } from '../../../utils/theme/theme';
import { useGetCMSConfig } from './useGetCMSConfig';

function ContentManagementSystemPage() {
  const dispatch = useAppDispatch();
  const client = useApolloClient();
  const [cmsData, cmsDataLoading, , _refetch] = useGetCMSConfig();

  const refetch = useCallback(() => {
    _refetch()
      .then((res) => {
        _setCmsNav(
          res.data?.configuration?.navigation?.sub.filter(({ label }) => label !== 'Collections') || []
        );
        setIsUnsaved(false);
      })
      .catch((error) => {
        toast.error(`Failed to refresh data: ${error}`);
      });
  }, [_refetch]);

  const [cmsNav, _setCmsNav] = useState(cmsData?.navigation.sub || []);
  useEffect(() => {
    if (cmsData) {
      _setCmsNav(cmsData.navigation.sub.filter(({ label }) => label !== 'Collections'));
      setIsUnsaved(false);
    }
  }, [cmsData]);

  const [isUnsaved, setIsUnsaved] = useState(false);
  const setCmsNav: typeof _setCmsNav = (v) => {
    _setCmsNav(v);
    setIsUnsaved(true);
  };

  // set document title
  useEffect(() => {
    document.title = `Configure CMS app`;
  }, []);

  // keep loading state synced
  useEffect(() => {
    dispatch(setAppLoading(cmsDataLoading));
  }, [dispatch, cmsDataLoading]);

  // configure app bar
  useEffect(() => {
    dispatch(setAppName((isUnsaved ? '*' : '') + `Configure CMS app`));
    dispatch(
      setAppActions([
        {
          label: 'Refresh data',
          type: 'icon',
          icon: 'ArrowClockwise24Regular',
          action: () => refetch(),
          'data-tip': `Discard changes and refresh`,
        },
        {
          label: 'Save',
          type: 'button',
          icon: 'Save24Regular',
          action: () => {
            // send the mutation
            dispatch(setAppLoading(true));
            client
              .mutate<SaveMutationType>({
                mutation: saveMutationString(),
                variables: {
                  input: cmsNav.map((group) => {
                    return {
                      uuid: group.id,
                      label: group.label,
                      items: group.items.map((item) => {
                        return {
                          uuid: item.id,
                          icon: item.icon,
                          label: item.label,
                          to: item.to,
                          isHidden: item.hiddenFilter,
                        };
                      }),
                    };
                  }),
                },
              })
              .finally(() => {
                dispatch(setAppLoading(false));
              })
              .then(({ data }) => {
                if (data?.setConfigurationNavigationSub) {
                  setIsUnsaved(false);
                  refetch();
                }
              })
              .catch((error) => {
                console.error(error);
                toast.error(`Failed to save. \n ${error.message}`);
                return false;
              });
          },
          disabled: !isUnsaved,
        },
      ])
    );
  }, [client, cmsNav, dispatch, isUnsaved, refetch]);

  const groupsSensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const itemsSensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <div style={{ margin: 20 }}>
      <Card
        label={'Navigation pane groups'}
        caption={
          'Add and remove custom navigation pane groups for easy access to collection tables with predefined filters. ' +
          'The default group with all collections will always appear at the end of the navigation pane.'
        }
      >
        <DndContext sensors={groupsSensors} collisionDetection={closestCenter} onDragEnd={groupsHandleDragEnd}>
          <SortableContext items={cmsNav} strategy={verticalListSortingStrategy}>
            {cmsNav.map((group, i) => (
              <SortableCard
                key={group.id}
                id={group.id}
                reducedMargin
                collapsedDetails={{ 'Group label': group.label, Items: `${group.items.length}` }}
                handleRemove={() => {
                  let data = copy(cmsNav);
                  data = [...data.slice(0, i), ...data.slice(i + 1)];
                  setCmsNav(data);
                }}
              >
                <Text
                  isEmbedded
                  label={'Group label'}
                  value={group.label}
                  onChange={(e) => {
                    const data = copy(cmsNav);
                    data[i].label = e.currentTarget.value;
                    setCmsNav(data);
                  }}
                />
                <Field isEmbedded label={'Navigation group items'}>
                  <>
                    {group.items.length > 0 ? (
                      <div style={{ marginBottom: 10 }}>
                        <Button
                          onClick={() => {
                            const data = copy(cmsNav);
                            const newItem = {
                              id: uuidv4(),
                              label: '',
                              to: '',
                              icon: 'CircleSmall24Filled',
                            };
                            data[i].items = [newItem, ...data[i].items];
                            setCmsNav(data);
                          }}
                          width={'100%'}
                        >
                          Add item to group
                        </Button>
                      </div>
                    ) : null}
                    <DndContext
                      id={group.id}
                      sensors={itemsSensors}
                      collisionDetection={closestCenter}
                      onDragEnd={(e) => itemsHandleDragEnd(e, group.id)}
                    >
                      <SortableContext items={group.items} strategy={verticalListSortingStrategy}>
                        {group.items.map((item, j) => (
                          <SortableCard
                            key={item.id}
                            id={item.id}
                            reducedMargin
                            collapsedDetails={{ Label: item.label, To: item.to }}
                            handleRemove={() => {
                              const data = copy(cmsNav);
                              data[i].items = [...data[i].items.slice(0, j), ...data[i].items.slice(j + 1)];
                              setCmsNav(data);
                            }}
                          >
                            <Text
                              isEmbedded
                              label={`Label`}
                              description={
                                'The label for this navigation item that will appear in the navigation pane.'
                              }
                              value={item.label}
                              onChange={(e) => {
                                const data = copy(cmsNav);
                                data[i].items[j].label = e.currentTarget.value;
                                setCmsNav(data);
                              }}
                            />
                            <Text
                              isEmbedded
                              label={`To`}
                              description={
                                'The destination page after clicking this option. ' +
                                'Destinations must begin with <code>/cms</code>.\n' +
                                'For example, <code>/cms/collection/files?archived=true</code> lists all archived files.'
                              }
                              value={item.to}
                              onChange={(e) => {
                                const data = copy(cmsNav);
                                data[i].items[j].to = e.currentTarget.value;
                                setCmsNav(data);
                              }}
                            />
                            <Text
                              isEmbedded
                              label={`Icon`}
                              value={item.icon}
                              onChange={(e) => {
                                const data = copy(cmsNav);
                                data[i].items[j].icon = e.currentTarget.value;
                                setCmsNav(data);
                              }}
                            />
                            <Checkbox
                              isEmbedded
                              label={'Require team membership to view this navigation item'}
                              checked={!!item.hiddenFilter?.notInTeam}
                              onChange={(e) => {
                                const data = copy(cmsNav);
                                if (e.currentTarget.checked) {
                                  data[i].items[j].hiddenFilter = { notInTeam: ['000000000000000000000001'] };
                                } else {
                                  data[i].items[j].hiddenFilter = undefined;
                                }
                                setCmsNav(data);
                              }}
                            />
                            {item.hiddenFilter?.notInTeam ? (
                              <IndentField color={'primary'}>
                                <ReferenceMany
                                  isEmbedded
                                  label={`Teams`}
                                  values={item.hiddenFilter.notInTeam.map((teamId) => ({ _id: teamId }))}
                                  collection={'Team'}
                                  onChange={(newValues) => {
                                    if (newValues !== undefined) {
                                      const data = copy(cmsNav);
                                      data[i].items[j].hiddenFilter = {
                                        notInTeam: newValues.map((value) => value._id),
                                      };
                                      setCmsNav(data);
                                    }
                                  }}
                                />
                              </IndentField>
                            ) : null}
                          </SortableCard>
                        ))}
                      </SortableContext>
                    </DndContext>
                    <div style={{ marginTop: 10 }}>
                      <Button
                        onClick={() => {
                          const data = copy(cmsNav);
                          data[i].items.push({
                            id: uuidv4(),
                            label: '',
                            to: '',
                            icon: 'CircleSmall24Filled',
                          });
                          setCmsNav(data);
                        }}
                        width={'100%'}
                      >
                        Add item to group
                      </Button>
                    </div>
                  </>
                </Field>
              </SortableCard>
            ))}
          </SortableContext>
        </DndContext>
        <div style={{ marginTop: 10 }}>
          <Button
            onClick={() => {
              const data = copy(cmsNav);
              data.push({
                id: uuidv4(),
                label: '',
                items: [],
              });
              setCmsNav(data);
            }}
            width={'100%'}
          >
            Add group to pane
          </Button>
        </div>
      </Card>
    </div>
  );

  function groupsHandleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setCmsNav((cmsNav) => {
        const oldIndex = cmsNav.findIndex((x) => x.id === active.id);
        const newIndex = cmsNav.findIndex((x) => x.id === over?.id);

        return arrayMove(cmsNav, oldIndex, newIndex);
      });
    }
  }

  function itemsHandleDragEnd(event: DragEndEvent, groupId: string) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setCmsNav((cmsNav) => {
        const currentGroupIndex = cmsNav.findIndex((x) => x.id === groupId);
        const currentGroup = cmsNav[currentGroupIndex];

        if (currentGroup) {
          const oldIndex = cmsNav[currentGroupIndex].items.findIndex((x) => x.id === active.id);
          const newIndex = cmsNav[currentGroupIndex].items.findIndex((x) => x.id === over?.id);

          return [
            ...cmsNav.slice(0, currentGroupIndex),
            { ...currentGroup, items: arrayMove(currentGroup.items, oldIndex, newIndex) },
            ...(cmsNav.length > currentGroupIndex ? cmsNav.slice(currentGroupIndex + 1) : []),
          ];
        }

        return cmsNav;
      });
    }
  }
}

interface SaveMutationType {
  setConfigurationNavigationSub?:
    | NonNullable<ReturnType<typeof useGetCMSConfig>[0]>['navigation']['sub']
    | null;
}

function saveMutationString(): DocumentNode {
  return gql`
    mutation setCmsNav($input: [ConfigurationNavigationSubGroupInput]!) {
      setConfigurationNavigationSub(key: "cms", input: $input) {
        id: uuid
      }
    }
  `;
}

const IndentField = styled.div<{ color: colorType }>`
  padding: 10px;
  margin-left: 28px;
  width: calc(100% - 28px);
  box-sizing: border-box;
  background: ${({ theme, color }) =>
    Color(
      color === 'neutral'
        ? theme.color.neutral[theme.mode][600]
        : theme.color[color][theme.mode === 'light' ? 900 : 300]
    )
      .alpha(0.08)
      .string()};
  border-radius: ${({ theme }) => theme.radius};
`;

export { ContentManagementSystemPage };
