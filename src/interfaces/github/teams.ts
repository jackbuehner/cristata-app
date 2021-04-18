export interface IGetTeams {
  organization: {
    teams: {
      edges: Array<{
        node: {
          id: string;
          slug: string;
          childTeams: {
            edges: Array<{
              node: {
                id: string;
                slug: string;
              };
            }>;
          };
        };
      }>;
    };
  };
}
