import { useTheme } from '@emotion/react';
import styled from '@emotion/styled/macro';
import useAxios from 'axios-hooks';
import { useParams } from 'react-router-dom';
import { FullAPIProject } from '../../../interfaces/github/plans';
import { PageHead } from '../../../components/PageHead';
import { Button, IconButton } from '../../../components/Button';
import { Add16Regular, ArrowClockwise24Regular } from '@fluentui/react-icons';
import { themeType } from '../../../utils/theme/theme';
import { Column } from './_Column';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useContext, useEffect, useState } from 'react';
import axios, { AxiosError } from 'axios';
import { toast } from 'react-toastify';
import { TextInput } from '../../../components/TextInput';
import { useModal } from 'react-modal-hook';
import { PlainModal } from '../../../components/Modal';
import {
  GitHubDataFreshnessContext,
  IGitHubDataFreshnessContext,
} from '../../../components/CristataWebSocket';
import { Label } from '../../../components/Label';
import { InputGroup } from '../../../components/InputGroup';

/**
 * Styled component wrapper for the projects page
 */
const PageWrapper = styled.div<{ theme?: themeType }>`
  padding: 0;
  height: ${({ theme }) => `calc(100% - ${theme.dimensions.PageHead.height})`};
  @media (max-width: 600px) {
    height: ${({ theme }) =>
      `calc(100% - ${theme.dimensions.PageHead.height} - ${theme.dimensions.bottomNav.height})`};
  }
  box-sizing: border-box;
`;

/**
 * Styled component wrapper for the portion of the page with the columns
 */
const PlanWrapper = styled.div<{ columnCount: number }>`
  padding: 20px;
  height: 100%;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: ${({ columnCount }) =>
    `repeat(${columnCount + 1}, 300px)`};
  gap: 10px;
  overflow: auto;
`;

/**
 * The projects page
 */
function PlansPage() {
  const theme = useTheme() as themeType;

  // get the url parameters from the route
  let { id } = useParams<{ id: string }>();

  // keep track of data freshness
  const { data: dataFreshness, set: setDataFreshness } =
    useContext<IGitHubDataFreshnessContext>(GitHubDataFreshnessContext);

  // get the data
  const [{ data, loading }, refetch] = useAxios<FullAPIProject>(
    `/gh/projects/full/${id}`
  );

  // store the data in state so that it can be mutated
  const [project, setProject] = useState(data);
  useEffect(() => {
    setProject(data);
  }, [data]);

  // if the data freshness changes, check if this project's data is stale (and update it if necessary)
  // but do not do anything if currently loading the project data
  useEffect(() => {
    if (
      loading !== true && // don't do anything if the data is currently being fetched
      dataFreshness &&
      setDataFreshness &&
      dataFreshness.project &&
      project &&
      dataFreshness.project[project.id]
    ) {
      // if the project was updated more recently than it was fetched, refetch the project
      if (
        dataFreshness!.project![project!.id].last_updated >
        dataFreshness!.project![project!.id].last_fetch
      ) {
        if (setDataFreshness) {
          let dataFreshnessCopy = { ...dataFreshness };
          dataFreshnessCopy!.project![project!.id].last_fetch = Date.now();
          setDataFreshness(dataFreshnessCopy);
          refetch();
        }
      }
    }
  }, [dataFreshness, loading, project, refetch, setDataFreshness]);

  /**
   * Handles moving a card within and between columns.
   *
   * This function updates the state AND sends the update to the API.
   */
  const moveCard = (
    to_column_id: number,
    from_column_id: number,
    card_id: number,
    position: 'top' | 'bottom' | string = 'top'
  ) => {
    // make a copy of the project that we can modify
    let projectCopy = { ...project } as FullAPIProject | undefined;
    if (projectCopy && projectCopy!.columns!) {
      // store the relevant column indexes
      const columnIndexes = {
        from: projectCopy!.columns!.findIndex(
          (column) => column.id === from_column_id
        ),
        to: projectCopy!.columns!.findIndex(
          (column) => column.id === to_column_id
        ),
      };

      // store the original cards from the relevant columns
      const cards = {
        from: projectCopy!.columns![columnIndexes.from].cards || [],
        to: projectCopy!.columns![columnIndexes.to].cards || [],
      };

      // store the card that is moving
      const cardIndex = cards.from.findIndex((card) => card.id === card_id);
      const card = cards.from[cardIndex];

      if (projectCopy!.columns![columnIndexes.to].cards && card) {
        /**
         * Adds card to the new column.
         * This is accomplished by:
         *  - updating the column id for the card to match the destination column
         *  - inserting the card into the appropriate place in the new column
         */
        const addCardCopy = () => {
          if (position === 'bottom') {
            projectCopy!.columns![columnIndexes.to].cards = [
              ...cards.to,
              {
                ...card,
                column_id: projectCopy!.columns![columnIndexes.to].id,
                updated_at: 'NOW',
              },
            ];
          } else if (position.match(/after:(\d+)/)) {
            // @ts-expect-error if the expression matches, the capture goup with the card id exists
            const afterCardId = parseInt(position.match(/after:(\d+)/)[1]);

            // find the index of the after card
            const afterCardIndex = projectCopy!.columns![
              columnIndexes.to
            ].cards!.findIndex((card) => card.id === afterCardId);

            // insert the moved card after the after card
            if (projectCopy!.columns![columnIndexes.to].cards !== undefined) {
              projectCopy!.columns![columnIndexes.to].cards!.splice(
                afterCardIndex + 1,
                0,
                {
                  ...card,
                  column_id: projectCopy!.columns![columnIndexes.to].id,
                  updated_at: 'NOW',
                }
              );
            }
          } else {
            // top (default)
            projectCopy!.columns![columnIndexes.to].cards = [
              {
                ...card,
                column_id: projectCopy!.columns![columnIndexes.to].id,
                updated_at: 'NOW',
              },
              ...cards.to,
            ];
          }
        };
        addCardCopy();

        /**
         * Remove the card from it's old location.
         */
        const removeOldCard = () => {
          if (columnIndexes.from !== columnIndexes.to) {
            // if card moved to a different column, it's old index did not change
            // because the 'from' column was not altered
            projectCopy!.columns![columnIndexes.from].cards?.splice(
              cardIndex,
              1
            );
          } else {
            // if the card was moved to the same column, we need to refind the old card index
            if (projectCopy!.columns![columnIndexes.to].cards) {
              const oldCardIndex = projectCopy!.columns![
                columnIndexes.to
              ].cards!.findIndex(
                (card) => card.id === card_id && card.updated_at !== 'NOW'
              );
              projectCopy!.columns![columnIndexes.to].cards!.splice(
                oldCardIndex,
                1
              );
            }
          }
        };
        removeOldCard();

        /**
         * Now that we have deleted the old card, we can set the `updated_at`
         * key to an actual date.
         *
         * Note that this date might be slightly different according to GitHub
         * since GitHub sets this time when it receives the change. Next time
         * we fetch the project data, it will have the date set by GitHub.
         */
        const setCorrectDate = () => {
          // find the card
          const cardIndex = projectCopy!.columns![
            columnIndexes.to
          ].cards!.findIndex((card) => card.id === card_id);
          // update the update time for the card
          projectCopy!.columns![columnIndexes.to].cards![cardIndex].updated_at =
            new Date().toISOString();
        };
        setCorrectDate();

        // update the state
        setProject(projectCopy);

        // tell github to move the card in the database
        axios
          .post(
            `/gh/projects/columns/cards/${card.id}/move`,
            {
              column_id: to_column_id,
              position: 'top',
            },
            {
              baseURL: `${process.env.REACT_APP_API_PROTOCOL}://${process.env.REACT_APP_API_BASE_URL}/api/v2`,
              withCredentials: true,
            }
          )
          .catch((err) => {
            console.error(err);
          });
      }
    }
  };

  // modal to add a column
  const [showAddColumnModal, hideAddColumnModal] = useModal(() => {
    const [columnNameValue, setColumnNameValue] =
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useState<HTMLInputElement['value']>('');
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [isLoading, setIsLoading] = useState<boolean>(false);

    /**
     * When the user types in the field, update `columnNameValue` in state
     */
    const handleNoteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setColumnNameValue(e.target.value);
    };

    /**
     * Add the note to the column by posting it to the API.
     *
     * @returns `true` if there were no errors; An `AxiosError` type if there was an error
     */
    const addNote = async (
      name: HTMLInputElement['value']
    ): Promise<true | AxiosError<any>> => {
      return await axios
        .post(
          `/gh/projects/${project ? project.id : 0}/columns`,
          {
            name: name,
          },
          {
            baseURL: `${process.env.REACT_APP_API_PROTOCOL}://${process.env.REACT_APP_API_BASE_URL}/api/v2`,
            withCredentials: true,
          }
        )
        .then(async (): Promise<true> => {
          if (refetch) await refetch(); // refetch the project so that it includes the new column
          setIsLoading(false);
          return true;
        })
        .catch((err: AxiosError): AxiosError => {
          console.error(err);
          toast.error(`Failed to add column. \n ${err.message}`);
          setIsLoading(false);
          return err;
        });
    };

    return (
      <PlainModal
        hideModal={hideAddColumnModal}
        title={`Add new column`}
        continueButton={{
          text: 'Add',
          onClick: async () => {
            setIsLoading(true);
            const addStatus = await addNote(columnNameValue);
            // return whether the action was successful
            if (addStatus === true) return true;
            return false;
          },
        }}
        isLoading={isLoading}
      >
        <TextInput
          name={'column-name'}
          id={'column-name'}
          title={'column-name'}
          value={columnNameValue}
          onChange={handleNoteChange}
          placeholder={`Column name`}
        />
      </PlainModal>
    );
  }, [project]);

  // modal to edit project details
  const [showEditProjectDetailsModal, hideEditProjectDetailsModal] =
    useModal(() => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [values, setValues] = useState<{
        name: HTMLInputElement['value'];
        desc: HTMLInputElement['value'];
      }>({
        name: project ? project.name : '',
        desc: project ? project.body : '',
      });
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [isLoading, setIsLoading] = useState<boolean>(false);

      /**
       * When the user types in the field, update `values` in state
       */
      const handleTextFieldChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        key: 'name' | 'desc'
      ) => {
        setValues({
          ...values,
          [key]: e.target.value,
        });
      };

      /**
       * Save the changes to project settings.
       *
       * @returns `true` if there were no errors; An `AxiosError` type if there was an error
       */
      const saveChanges = async (): Promise<true | AxiosError<any>> => {
        return await axios
          .patch(
            `/gh/projects/${project ? project.id : 0}`,
            {
              name: values.name,
              body: values.desc,
            },
            {
              baseURL: `${process.env.REACT_APP_API_PROTOCOL}://${process.env.REACT_APP_API_BASE_URL}/api/v2`,
              withCredentials: true,
            }
          )
          .then(async (): Promise<true> => {
            if (refetch) await refetch(); // refetch the project so that it includes the new name and description
            setIsLoading(false);
            return true;
          })
          .catch((err: AxiosError): AxiosError => {
            console.error(err);
            toast.error(`Failed to update project settings. \n ${err.message}`);
            setIsLoading(false);
            return err;
          });
      };

      return (
        <PlainModal
          hideModal={hideEditProjectDetailsModal}
          title={`Edit project details`}
          isLoading={isLoading}
          continueButton={{
            text: 'Save',
            onClick: async () => {
              setIsLoading(true);
              const status = await saveChanges();
              // return whether the action was successful
              if (status === true) return true;
              return false;
            },
          }}
        >
          <InputGroup type={'text'}>
            <Label htmlFor={'project-name'}>Name</Label>
            <TextInput
              name={'project-name'}
              id={'project-name'}
              title={'project-name'}
              placeholder={`Project name`}
              value={values.name}
              onChange={(e) => handleTextFieldChange(e, 'name')}
            />
          </InputGroup>
          <InputGroup type={'text'}>
            <Label htmlFor={'project-desc'}>Description</Label>
            <TextInput
              name={'project-desc'}
              id={'project-desc'}
              title={'project-desc'}
              placeholder={`Project description`}
              value={values.desc}
              onChange={(e) => handleTextFieldChange(e, 'desc')}
            />
          </InputGroup>
          <InputGroup type={'checkbox'}>
            <Label
              htmlFor={'project-track-progress'}
              description={`A progress bar will be displayed to help you visualize the overall progress of your project based
              on your automated To Do, In Progress, and Done columns.`}
              disabled
            >
              Track project progress
            </Label>
            <input
              name={'project-track-progress'}
              id={'project-track-progress'}
              title={'project-track-progress'}
              type={`checkbox`}
              disabled
            />
          </InputGroup>
          <InputGroup type={'text'} noGrid>
            <Label>More settings</Label>
            {project ? (
              <Button
                onClick={() => window.open(`${project.html_url}/settings`)}
              >
                Configure on GitHub
              </Button>
            ) : null}
          </InputGroup>
        </PlainModal>
      );
    }, [project]);

  return (
    <>
      <DndProvider backend={HTML5Backend}>
        <PageHead
          title={project ? project.name : ''}
          description={project?.body}
          isLoading={loading}
          buttons={
            <>
              {project ? (
                <>
                  <IconButton
                    onClick={() => refetch()}
                    icon={<ArrowClockwise24Regular />}
                  >
                    Refresh
                  </IconButton>
                  <Button onClick={showEditProjectDetailsModal}>
                    Edit project details
                  </Button>
                </>
              ) : null}
            </>
          }
        />
        <PageWrapper theme={theme}>
          <PlanWrapper
            columnCount={project?.columns ? project.columns.length : 0}
          >
            {project ? (
              <>
                {project.columns?.map((column) => {
                  return (
                    <Column
                      key={column.id}
                      id={column.id}
                      title={column.name}
                      moveCard={moveCard}
                      cards={column.cards}
                      refetch={refetch}
                    />
                  );
                })}
                <div style={{ paddingRight: 20 }}>
                  <Button
                    icon={<Add16Regular />}
                    width={`100%`}
                    height={`100px`}
                    border={{
                      base: `1px dashed ${
                        theme.color.neutral[theme.mode][600]
                      }`,
                    }}
                    backgroundColor={{ base: 'transparent' }}
                    onClick={showAddColumnModal}
                  >
                    Add column
                  </Button>
                </div>
              </>
            ) : null}
          </PlanWrapper>
        </PageWrapper>
      </DndProvider>
    </>
  );
}

export { PlansPage };
