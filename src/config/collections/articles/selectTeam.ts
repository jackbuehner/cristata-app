import { IGetTeams } from '../../../interfaces/github/teams';
import { db } from '../../../utils/axios/db';

async function selectTeam(inputValue: string) {
  // get all teams
  const { data: teamsData }: { data: IGetTeams } = await db.get(`/gh/teams`);

  // with the teams data, create the options array
  let options: Array<{ value: string; label: string }> = [];
  teamsData.organization.teams.edges.forEach((team) => {
    options.push({
      value: `${team.node.id}`,
      label: team.node.slug,
    });
  });

  // filter the options based on `inputValue`
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(inputValue.toLowerCase())
  );

  // return the filtered options
  return filteredOptions;
}

export { selectTeam };
