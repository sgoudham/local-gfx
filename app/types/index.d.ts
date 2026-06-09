import type { TeamData } from "../../shared/types/data";
import type {
  MatchTime,
  OverlayState,
  SubstitutionData,
  TeamFormationData,
  TeamState,
} from "../../shared/types/state";

export type MatchScorecardProps = OverlayState & {
  home: Pick<TeamData, "shortName"> & { goals: number };
  away: Pick<TeamData, "shortName"> & { goals: number };
  matchTime: MatchTime;
};

type BigMatchScorecardTeam = {
  name: TeamData["name"];
  shortName: TeamData["shortName"];
  goals: TeamState["goals"];
};

export type BigMatchScorecardProps = OverlayState & {
  home: BigMatchScorecardTeam;
  away: BigMatchScorecardTeam;
  matchTime: MatchTime;
};

export type PenaltiesScorecardProps = OverlayState & {
  home: Pick<TeamData, "id" | "shortName"> & {
    penalties: TeamState["penalties"];
  };
  away: Pick<TeamData, "id" | "shortName"> & {
    penalties: TeamState["penalties"];
  };
};

export type TeamFormationProps = OverlayState & {
  team: {
    location: TeamData["location"];
    name: TeamData["name"];
    shortName: TeamData["shortName"];
    manager: TeamData["manager"]
    players: TeamData["players"];
    substitutes: TeamData["substitutes"];
  };
};

export type SubstitutionProps = SubstitutionData;
