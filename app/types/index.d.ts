import type {
  OverlayState,
  TeamState,
  MatchTime,
} from "../../shared/types/state";
import type { TeamData } from "../../shared/types/data";

export type MatchScorecardProps = OverlayState & {
  home: Pick<TeamData, "shortName"> & { goals: number };
  away: Pick<TeamData, "shortName"> & { goals: number };
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
