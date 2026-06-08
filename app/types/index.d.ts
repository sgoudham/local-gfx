import type {
  OverlayState,
  TeamState,
  MatchTime,
  SubstitutionData,
} from "../../shared/types/state";
import type { Player, TeamData, TeamLocation } from "../../shared/types/data";

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

export type TeamFormationProps = OverlayState;

export type StartingSoonProps = {
  name: string;
  visible: boolean;
};

export type SubstitutionProps = SubstitutionData;