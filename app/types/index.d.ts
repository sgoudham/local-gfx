import type { TeamData } from "../../shared/types/data";
import type {
  MatchTime,
  OverlayState,
  SubstitutionData,
  TeamComplete,
  TeamFormationData,
  TeamState,
} from "../../shared/types/state";

export type EditTeamDialogProps = Pick<
  TeamComplete,
  "location" | "players" | "substitutes" | "manager" | "captain"
>;

export type SocialMediaPlayersProps = TeamComplete;

export type MatchScorecardProps = OverlayState & {
  home: Pick<TeamData, "shortName"> & { goals: number };
  away: Pick<TeamData, "shortName"> & { goals: number };
  matchTime: MatchTime;
};

type BigMatchScorecardTeam = {
  name: TeamData["name"];
  shortName: TeamData["shortName"];
  squad: Map<string, Player>;
  goals: TeamState["goals"];
};
export type BigMatchScorecardProps = OverlayState & {
  home: BigMatchScorecardTeam;
  away: BigMatchScorecardTeam;
  matchTime: MatchTime;
};

export type PenaltiesScorecardProps = OverlayState & {
  home: Pick<TeamData, "location" | "shortName"> & {
    penalties: TeamState["penalties"];
  };
  away: Pick<TeamData, "location" | "shortName"> & {
    penalties: TeamState["penalties"];
  };
};

export type TeamFormationProps = OverlayState & {
  team: {
    location: TeamData["location"];
    name: TeamData["name"];
    shortName: TeamData["shortName"];
    manager: TeamData["manager"];
    players: TeamComplete["players"];
    substitutes: TeamComplete["substitutes"];
    captain: TeamComplete["captain"];
  };
};

export type StartingSoonProps = OverlayState;

export type SubstitutionProps = SubstitutionData;
