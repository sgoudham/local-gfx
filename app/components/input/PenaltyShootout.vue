<script lang="ts" setup>
import { PenaltyState, TeamLocation } from "#imports";
import type { TeamLocation as TLocation } from "~~/shared/types/data";
import type { TPenaltyState } from "~~/shared/types/state";
import { PENALTY_SLOTS } from "~~/shared/utils/constants";

const { state, publish } = useControlSocket();

const penaltyDialogRef = ref<HTMLDialogElement | null>(null);
const penaltySlots = PENALTY_SLOTS;

const getPenaltyStates = (location: TLocation) =>
  Array.from({ length: penaltySlots }, (_, i) => i + 1).map((_, index) => {
    const penalty = state.value[location].penalties[index];
    return penalty ? penalty.state : PenaltyState.NONE;
  });

const summary = computed(() => {
  const homeStates = getPenaltyStates(TeamLocation.Home);
  const awayStates = getPenaltyStates(TeamLocation.Away);
  return {
    home: {
      states: homeStates,
      kicksTaken: homeStates.filter((state) => state !== PenaltyState.NONE)
        .length,
      score: homeStates.filter((state) => state === PenaltyState.GOAL).length,
    },
    away: {
      states: awayStates,
      kicksTaken: awayStates.filter((state) => state !== PenaltyState.NONE)
        .length,
      score: awayStates.filter((state) => state === PenaltyState.GOAL).length,
    },
  };
});

const setPenaltyOutcome = (
  location: TLocation,
  index: number,
  penaltyState: TPenaltyState,
) => {
  const penalties = [...state.value[location].penalties];
  if (!penalties[index]) {
    penalties[index] = {
      state: penaltyState,
    };
  } else {
    penalties[index].state = penaltyState;
  }
  publish(SocketMessage.MatchPenaltyShootoutUpdate, {
    data: {
      location,
      penalties,
    },
  });
};

const openPenaltyDialog = () => {
  penaltyDialogRef.value?.showModal();
};

const closePenaltyDialog = () => {
  penaltyDialogRef.value?.close();
};
</script>

<template>
  <div class="penalty-shootout">
    <Button @click="openPenaltyDialog" class="action penalty-trigger">
      Penalty Shootout Mode
    </Button>
    <dialog ref="penaltyDialogRef" class="penalty-dialog">
      <form method="dialog" class="penalty-dialog-content">
        <section class="penalty-header">
          <h3>Penalty Shootout</h3>
          <div class="penalty-summary" role="status">
            <div class="penalty-score">
              {{ summary.home.score }} - {{ summary.away.score }}
            </div>
            <div class="penalty-meta">
              Home {{ summary.home.kicksTaken }}/{{ penaltySlots }} | Away
              {{ summary.away.kicksTaken }}/{{ penaltySlots }}
            </div>
          </div>
          <ToggleOverlayButton
            v-bind="{
              val: Overlay.PenaltiesScorecard,
              name: state.graphics.penaltiesScorecard.name,
              showMessage: SocketMessage.PenaltiesScorecardShow,
              hideMessage: SocketMessage.PenaltiesScorecardHide,
            }"
          />
        </section>
        <div class="penalty-columns">
          <div class="penalty-column">
            <h4>Home</h4>
            <div
              v-for="(slot, index) in penaltySlots"
              :key="`home-${slot}`"
              class="penalty-slot"
            >
              <div class="penalty-slot-header">Kick {{ slot }}</div>
              <div class="penalty-state-row">
                <button
                  type="button"
                  class="penalty-state"
                  :class="{
                    goal: summary.home.states[index] === PenaltyState.GOAL,
                  }"
                  @click="
                    setPenaltyOutcome(
                      TeamLocation.Home,
                      index,
                      PenaltyState.GOAL,
                    )
                  "
                >
                  GOAL
                </button>
                <button
                  type="button"
                  class="penalty-state"
                  :class="{
                    miss: summary.home.states[index] === PenaltyState.MISS,
                  }"
                  @click="
                    setPenaltyOutcome(
                      TeamLocation.Home,
                      index,
                      PenaltyState.MISS,
                    )
                  "
                >
                  MISSED
                </button>
                <button
                  type="button"
                  class="penalty-state"
                  :class="{
                    none: summary.home.states[index] === PenaltyState.NONE,
                  }"
                  @click="
                    setPenaltyOutcome(
                      TeamLocation.Home,
                      index,
                      PenaltyState.NONE,
                    )
                  "
                >
                  NONE
                </button>
              </div>
            </div>
          </div>
          <div class="penalty-column">
            <h4>Away</h4>
            <div
              v-for="(slot, index) in penaltySlots"
              :key="`away-${slot}`"
              class="penalty-slot"
            >
              <div class="penalty-slot-header">Kick {{ slot }}</div>
              <div class="penalty-state-row">
                <button
                  type="button"
                  class="penalty-state"
                  :class="{
                    goal: summary.away.states[index] === PenaltyState.GOAL,
                  }"
                  @click="
                    setPenaltyOutcome(
                      TeamLocation.Away,
                      index,
                      PenaltyState.GOAL,
                    )
                  "
                >
                  GOAL
                </button>
                <button
                  type="button"
                  class="penalty-state"
                  :class="{
                    miss: summary.away.states[index] === PenaltyState.MISS,
                  }"
                  @click="
                    setPenaltyOutcome(
                      TeamLocation.Away,
                      index,
                      PenaltyState.MISS,
                    )
                  "
                >
                  MISSED
                </button>
                <button
                  type="button"
                  class="penalty-state"
                  :class="{
                    none: summary.away.states[index] === PenaltyState.NONE,
                  }"
                  @click="
                    setPenaltyOutcome(
                      TeamLocation.Away,
                      index,
                      PenaltyState.NONE,
                    )
                  "
                >
                  NONE
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="penalty-actions">
          <Button type="button" class="item" @click="closePenaltyDialog">
            Close
          </Button>
        </div>
      </form>
    </dialog>
  </div>
</template>

<style lang="css" scoped>
.penalty-shootout {
  display: flex;
  width: 100%;
  flex-grow: 1;
}

.penalty-trigger {
  width: 100%;
}

.penalty-dialog {
  border: 0;
  padding: 0;
  width: min(680px, 95vw);
}

.penalty-dialog-content {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 14px;
}

.penalty-header {
  display: flex;
  justify-content: space-around;
}

.penalty-summary {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  border-radius: 8px;
}

.penalty-score {
  font-size: 1.4rem;
  font-weight: 700;
  line-height: 1;
}

.penalty-meta {
  font-size: 0.85rem;
}

.penalty-columns {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.penalty-column {
  display: flex;
  flex-direction: column;
}

.penalty-column > h4 {
  align-self: center;
  margin: 0;
}

.penalty-slot {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 4px;
}

.penalty-slot-header {
  font-weight: 600;
  font-size: small;
}

.penalty-state-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 4px;
}

.penalty-state {
  border: 1px solid #8b95a7;
  background: #f3f4f6;
  color: #1f2937;
  border-radius: 6px;
  padding: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 120ms ease,
    border-color 120ms ease,
    color 120ms ease;
}

.penalty-state.goal {
  border-color: #15803d;
  background: #15803d;
  color: #ffffff;
}

.penalty-state.miss {
  border-color: #b91c1c;
  background: #b91c1c;
  color: #ffffff;
}

.penalty-state.none {
  border-color: #1d4ed8;
  background: #1d4ed8;
  color: #ffffff;
}

.penalty-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

@media (max-width: 720px) {
  .penalty-columns {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
