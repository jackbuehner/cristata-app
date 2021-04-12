import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import useAxios from 'axios-hooks';
import { useParams } from 'react-router-dom';
import { FullAPIProject } from '../../../interfaces/github/plans';
import { PageHead } from '../../../components/PageHead';
import { Button, IconButton } from '../../../components/Button';
import { ArrowClockwise24Regular } from '@fluentui/react-icons';
import { themeType } from '../../../utils/theme/theme';
import { Column } from './_Column';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useEffect, useState } from 'react';
import axios from 'axios';

/**
 * Styled component wrapper for the projects page
 */
const PageWrapper = styled.div<{ theme?: themeType }>`
  padding: 0;
  height: ${({ theme }) => `calc(100% - ${theme.dimensions.PageHead.height})`};
  box-sizing: border-box;
`;

/**
 * Styled component wrapper for the portion of the page with the columns
 */
const PlanWrapper = styled.div<{ theme?: themeType }>`
  padding: 20px;
  height: 100%;
  box-sizing: border-box;
  display: grid;
  //TODO: auto genertate the columns (adapt to different numbers of columns)
  grid-template-columns: 300px 300px 300px 300px;
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

  // get the data
  const [{ data, loading }, refetch] = useAxios<FullAPIProject>(`/gh/projects/full/${id}`);

  // store the data in state so that it can be mutated
  const [project, setProject] = useState(data);
  useEffect(() => {
    setProject(data);
  }, [data]);

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
        from: projectCopy!.columns!.findIndex((column) => column.id === from_column_id),
        to: projectCopy!.columns!.findIndex((column) => column.id === to_column_id),
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
            const afterCardIndex = projectCopy!.columns![columnIndexes.to].cards!.findIndex(
              (card) => card.id === afterCardId
            );

            // insert the moved card after the after card
            if (projectCopy!.columns![columnIndexes.to].cards !== undefined) {
              projectCopy!.columns![columnIndexes.to].cards!.splice(afterCardIndex + 1, 0, {
                ...card,
                column_id: projectCopy!.columns![columnIndexes.to].id,
                updated_at: 'NOW',
              });
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
            projectCopy!.columns![columnIndexes.from].cards?.splice(cardIndex, 1);
          } else {
            // if the card was moved to the same column, we need to refind the old card index
            if (projectCopy!.columns![columnIndexes.to].cards) {
              const oldCardIndex = projectCopy!.columns![columnIndexes.to].cards!.findIndex(
                (card) => card.id === card_id && card.updated_at !== 'NOW'
              );
              projectCopy!.columns![columnIndexes.to].cards!.splice(oldCardIndex, 1);
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
          const cardIndex = projectCopy!.columns![columnIndexes.to].cards!.findIndex(
            (card) => card.id === card_id
          );
          // update the update time for the card
          projectCopy!.columns![columnIndexes.to].cards![cardIndex].updated_at = new Date().toISOString();
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
              baseURL: `http://localhost:3001/api/v2`,
              withCredentials: true,
            }
          )
          .catch((err) => {
            console.error(err);
          });
      }
    }
  };

  return (
    <>
      <DndProvider backend={HTML5Backend}>
        <PageHead
          title={project ? project.name : ''}
          description={project?.body}
          isLoading={loading}
          buttons={
            <>
              <IconButton onClick={() => refetch()} icon={<ArrowClockwise24Regular />}>
                Refresh
              </IconButton>
              {project ? (
                <Button onClick={() => window.open(`${project.html_url}?fullscreen=1`)}>View on GitHub</Button>
              ) : null}
            </>
          }
        />
        <PageWrapper theme={theme}>
          <PlanWrapper>
            {project
              ? project.columns?.map((column) => {
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
                })
              : null}
          </PlanWrapper>
        </PageWrapper>
      </DndProvider>
    </>
  );
}

export { PlansPage };
