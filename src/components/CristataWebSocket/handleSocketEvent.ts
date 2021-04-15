import { IGitHubDataFreshness } from './CristataWebSocket';

/**
 * Runs a certain handler based on the input socket event.
 *
 * For example, the 'project' event updates the `last_updated` timestamp for the specified project.
 */
function handleSocketEvent(
  se: string,
  result: { [key: string]: any },
  githubDataFreshness: IGitHubDataFreshness
) {
  const handlers: {
    [key: string]: (
      result: { [key: string]: any },
      dataMeta: IGitHubDataFreshness
    ) => { type: 'github_freshness'; data: IGitHubDataFreshness } | null;
  } = {
    project: function (result: { [key: string]: any }, githubDataFreshness: IGitHubDataFreshness) {
      if (result.project_id) {
        const project_result = result as { event: string; project_id: number };
        // return a modified version o `githubDataFreshness` that has a `last_updated` key for this project
        return {
          type: 'github_freshness',
          data: {
            ...githubDataFreshness,
            project: {
              ...githubDataFreshness.project,
              [project_result.project_id]: {
                last_fetch: githubDataFreshness.project
                  ? githubDataFreshness.project[project_result.project_id]
                    ? githubDataFreshness.project[project_result.project_id].last_fetch
                      ? githubDataFreshness.project[project_result.project_id].last_fetch
                      : 0
                    : 0
                  : 0,
                last_updated: Date.now(),
              },
            },
          },
        };
      }
      return null;
    },
    project_column: function (result: { [key: string]: any }, dataMeta: IGitHubDataFreshness) {
      return this.project(result, dataMeta);
    },
    project_card: function (result: { [key: string]: any }, dataMeta: IGitHubDataFreshness) {
      return this.project(result, dataMeta);
    },
  };
  if (handlers[se]) return handlers[se](result, githubDataFreshness);
  return null;
}

export { handleSocketEvent };
