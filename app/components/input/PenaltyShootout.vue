<script lang="ts" setup>
import { PenaltyState, TeamLocation } from "#imports";
import { useSocket } from "~/composables/useSession";
import type { TeamLocation as TLocation } from "~~/shared/types/data";
import type { TPenaltyState } from "~~/shared/types/state";
import { PENALTY_SLOTS } from "~~/shared/utils/constants";

const { state } = useClientState();
const { publish } = useSocket(Mode.Control);

const penaltyDialogRef = ref<HTMLDialogElement | null>(null);
const BASE_SLOT_COUNT = PENALTY_SLOTS.length;
const firstKickTeam = ref<TLocation>(TeamLocation.Home);
type PendingSlot = { state: TPenaltyState; playerId: string };

const pendingData = reactive<
  Record<TLocation, Partial<Record<number, PendingSlot>>>
>({
  [TeamLocation.Home]: {},
  [TeamLocation.Away]: {},
});

const summary = computed(() => {
  const compute = (location: TLocation) => {
    const pens = state.value[location].penalties;
    return {
      kicksTaken: pens.filter((p) => p.state !== PenaltyState.NONE).length,
      score: pens.filter((p) => p.state === PenaltyState.GOAL).length,
    };
  };
  return { home: compute(TeamLocation.Home), away: compute(TeamLocation.Away) };
});

const displaySlotCount = computed(() => {
  const { home, away } = summary.value;
  const isSuddenDeath =
    home.kicksTaken >= BASE_SLOT_COUNT &&
    away.kicksTaken >= BASE_SLOT_COUNT &&
    home.score === away.score;

  if (isSuddenDeath) {
    const completedRounds =
      Math.min(home.kicksTaken, away.kicksTaken) - BASE_SLOT_COUNT;
    return BASE_SLOT_COUNT + completedRounds + 1;
  }

  return Math.max(BASE_SLOT_COUNT, home.kicksTaken, away.kicksTaken);
});

const isSlotDisabled = (location: TLocation, index: number) => {
  const isFirst = location === firstKickTeam.value;
  const other =
    location === TeamLocation.Home ? TeamLocation.Away : TeamLocation.Home;
  const otherKicksTaken = summary.value[other].kicksTaken;
  if (isFirst) {
    return otherKicksTaken < index;
  } else {
    return otherKicksTaken < index + 1;
  }
};

const getPendingState = (location: TLocation, index: number): TPenaltyState =>
  pendingData[location][index]?.state ??
  state.value[location].penalties[index]?.state ??
  PenaltyState.NONE;

const setPendingState = (
  location: TLocation,
  index: number,
  penaltyState: TPenaltyState,
) => {
  const existing = pendingData[location][index];
  if (existing) {
    existing.state = penaltyState;
  } else {
    pendingData[location][index] = { state: penaltyState, playerId: "" };
  }
};

const selectPlayer = (location: TLocation, index: number, playerId: string) => {
  const existing = pendingData[location][index];
  if (existing) {
    existing.playerId = playerId;
  } else {
    pendingData[location][index] = {
      state: state.value[location].penalties[index]?.state ?? PenaltyState.NONE,
      playerId,
    };
  }

  const pending = pendingData[location][index]!;
  if (pending.state === PenaltyState.NONE || !pending.playerId) return;

  const player = state.value[location].players.find(
    (p) => p.id === pending.playerId,
  );
  if (!player) return;

  publish(SocketMessage.MatchPenaltyShootoutUpdate, {
    data: {
      location,
      index,
      penaltyGoal: { state: pending.state, player },
    },
  });

  delete pendingData[location][index];
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
              Home {{ summary.home.kicksTaken }}/{{ displaySlotCount }} | Away
              {{ summary.away.kicksTaken }}/{{ displaySlotCount }}
            </div>
          </div>
          <ToggleOverlayButton
            class="toggle-overlay-btn"
            v-bind="{
              val: Overlay.PenaltiesScorecard,
              name: state.graphics.penaltiesScorecard.name,
              showMessage: SocketMessage.PenaltiesScorecardShow,
              hideMessage: SocketMessage.PenaltiesScorecardHide,
            }"
          />
        </section>
        <section class="coin-flip">
          <span class="coin-flip-label">Kicks first</span>
          <div class="coin-flip-options">
            <button
              type="button"
              class="coin-flip-btn"
              :class="{ active: firstKickTeam === TeamLocation.Home }"
              @click="firstKickTeam = TeamLocation.Home"
            >
              Home
            </button>
            <button
              type="button"
              class="coin-flip-btn"
              :class="{ active: firstKickTeam === TeamLocation.Away }"
              @click="firstKickTeam = TeamLocation.Away"
            >
              Away
            </button>
          </div>
        </section>
        <section class="penalty-columns">
          <div class="penalty-column">
            <h4>Home</h4>
            <div
              v-for="(_, index) in displaySlotCount"
              :key="`home-${index}`"
              class="penalty-slot"
            >
              <div class="penalty-slot-header">Kick {{ index + 1 }}</div>
              <div class="penalty-state-row">
                <button
                  type="button"
                  class="penalty-state"
                  :class="{
                    goal:
                      getPendingState(TeamLocation.Home, index) ===
                      PenaltyState.GOAL,
                  }"
                  :disabled="isSlotDisabled(TeamLocation.Home, index)"
                  @click="
                    setPendingState(TeamLocation.Home, index, PenaltyState.GOAL)
                  "
                >
                  GOAL
                </button>
                <button
                  type="button"
                  class="penalty-state"
                  :class="{
                    miss:
                      getPendingState(TeamLocation.Home, index) ===
                      PenaltyState.MISS,
                  }"
                  :disabled="isSlotDisabled(TeamLocation.Home, index)"
                  @click="
                    setPendingState(TeamLocation.Home, index, PenaltyState.MISS)
                  "
                >
                  MISSED
                </button>
                <button
                  type="button"
                  class="penalty-state"
                  :class="{
                    none:
                      getPendingState(TeamLocation.Home, index) ===
                      PenaltyState.NONE,
                  }"
                  :disabled="isSlotDisabled(TeamLocation.Home, index)"
                  @click="
                    setPendingState(TeamLocation.Home, index, PenaltyState.NONE)
                  "
                >
                  NONE
                </button>
              </div>
              <select
                class="player-select"
                :disabled="
                  isSlotDisabled(TeamLocation.Home, index) ||
                  getPendingState(TeamLocation.Home, index) ===
                    PenaltyState.NONE
                "
                :value="
                  pendingData[TeamLocation.Home][index]?.playerId ??
                  state.home.penalties[index]?.player?.id ??
                  ''
                "
                @change="
                  (e: Event) =>
                    selectPlayer(
                      TeamLocation.Home,
                      index,
                      (e.target as HTMLSelectElement).value,
                    )
                "
              >
                <option value="" disabled>Player...</option>
                <option
                  v-for="p in state.home.players"
                  :key="p.id"
                  :value="p.id"
                >
                  {{ p.number }}' {{ p.forename }} {{ p.surname }}
                </option>
              </select>
            </div>
          </div>
          <div class="penalty-column">
            <h4>Away</h4>
            <div
              v-for="(_, index) in displaySlotCount"
              :key="`away-${index}`"
              class="penalty-slot"
            >
              <div class="penalty-slot-header">Kick {{ index + 1 }}</div>
              <div class="penalty-state-row">
                <button
                  type="button"
                  class="penalty-state"
                  :class="{
                    goal:
                      getPendingState(TeamLocation.Away, index) ===
                      PenaltyState.GOAL,
                  }"
                  :disabled="isSlotDisabled(TeamLocation.Away, index)"
                  @click="
                    setPendingState(TeamLocation.Away, index, PenaltyState.GOAL)
                  "
                >
                  GOAL
                </button>
                <button
                  type="button"
                  class="penalty-state"
                  :class="{
                    miss:
                      getPendingState(TeamLocation.Away, index) ===
                      PenaltyState.MISS,
                  }"
                  :disabled="isSlotDisabled(TeamLocation.Away, index)"
                  @click="
                    setPendingState(TeamLocation.Away, index, PenaltyState.MISS)
                  "
                >
                  MISSED
                </button>
                <button
                  type="button"
                  class="penalty-state"
                  :class="{
                    none:
                      getPendingState(TeamLocation.Away, index) ===
                      PenaltyState.NONE,
                  }"
                  :disabled="isSlotDisabled(TeamLocation.Away, index)"
                  @click="
                    setPendingState(TeamLocation.Away, index, PenaltyState.NONE)
                  "
                >
                  NONE
                </button>
              </div>
              <select
                class="player-select"
                :disabled="
                  isSlotDisabled(TeamLocation.Away, index) ||
                  getPendingState(TeamLocation.Away, index) ===
                    PenaltyState.NONE
                "
                :value="
                  pendingData[TeamLocation.Away][index]?.playerId ??
                  state.away.penalties[index]?.player?.id ??
                  ''
                "
                @change="
                  (e: Event) =>
                    selectPlayer(
                      TeamLocation.Away,
                      index,
                      (e.target as HTMLSelectElement).value,
                    )
                "
              >
                <option value="" disabled>Player...</option>
                <option
                  v-for="p in state.away.players"
                  :key="p.id"
                  :value="p.id"
                >
                  {{ p.number }}' {{ p.forename }} {{ p.surname }}
                </option>
              </select>
            </div>
          </div>
        </section>
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
  height: min(680px, 95vw);
}

.penalty-dialog-content {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 14px;
}

.penalty-header {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
}

.toggle-overlay-btn {
  justify-self: end;
}

.coin-flip {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.coin-flip-label {
  font-weight: 600;
}

.coin-flip-options {
  display: flex;
  gap: 4px;
}

.coin-flip-btn {
  border: 1px solid #8b95a7;
  background: #f3f4f6;
  color: #1f2937;
  border-radius: 6px;
  padding: 4px 10px;
  font-weight: 600;
  cursor: pointer;
}

.coin-flip-btn.active {
  border-color: #1d4ed8;
  background: #1d4ed8;
  color: #ffffff;
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

.penalty-state:disabled {
  opacity: 0.35;
  cursor: not-allowed;
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

.player-select {
  border: 1px solid #8b95a7;
  border-radius: 6px;
  padding: 4px 6px;
  font-weight: 600;
  cursor: pointer;
}

.player-select:disabled {
  opacity: 0.35;
  cursor: not-allowed;
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
