<script setup lang="ts">
import { getFormationPosition } from "~/utils/getFormationPosition";
const { state, publish } = useControlSocket();
const { selectedPlayer } = useClientState();

const props = defineProps<TeamComplete>();

const players = computed(() => props.players);
const substitutes = computed(() => props.substitutes);
const sortedSubs = computed(() =>
  [...substitutes.value]
    .filter((s) => s.forename && s.surname)
    .sort((a, b) => a.number - b.number),
);
const pendingSubs = ref<PendingSub[]>([]);
const hoveredPlayerId = ref<string | null>(null);
const hasPendingSubs = computed(() => pendingSubs.value.length === 0);
const activeFormation = computed(() => props.activeFormation);

const dragId = ref<string | null>(null);
const dragSource = ref<"pitch" | "bench" | null>(null);
const draggedSub = ref<Player | null>(null);
const dialogRef = ref<HTMLDialogElement | null>(null);
const dialogKey = ref(0);

function isPendingLocked(playerId: string) {
  return pendingSubs.value.some(
    ([subIn, playerOut]) => subIn.id === playerId || playerOut.id === playerId,
  );
}

// ── Formations ──────────────────────────────────────────────

function applyFormation(key: FormationKey) {
  publish(SocketMessage.ActiveFormationUpdate, {
    data: {
      location: props.location,
      activeFormation: key,
      players: players.value,
    },
  });
}

// ── Drag handlers ──────────────────────────────────────────────

function startPitchPlayerDrag(e: MouseEvent, player: Player) {
  dragId.value = player.id;
  dragSource.value = "pitch";
  draggedSub.value = player;
}

function startBenchDrag(e: MouseEvent, sub: Player) {
  if (isPendingLocked(sub.id)) return;

  dragId.value = sub.id;
  dragSource.value = "bench";
  draggedSub.value = sub;
}

function stopDrag(_e: MouseEvent) {
  if (draggedSub.value && hoveredPlayerId.value) {
    const target = players.value.find((p) => p.id === hoveredPlayerId.value);

    if (
      target &&
      !isPendingLocked(draggedSub.value.id) &&
      !isPendingLocked(target.id)
    ) {
      if (dragSource.value === "pitch") {
        const draggedIndex = players.value.findIndex(
          (p) => p.id === draggedSub.value!.id,
        );
        const targetIndex = players.value.findIndex((p) => p.id === target.id);

        if (draggedIndex !== -1 && targetIndex !== -1) {
          const temp = players.value[draggedIndex]!;
          players.value[draggedIndex] = players.value[targetIndex]!;
          players.value[targetIndex] = temp;

          publish(SocketMessage.ActiveFormationUpdate, {
            data: {
              location: props.location,
              activeFormation: activeFormation.value,
              players: players.value,
            },
          });
        }
      } else {
        pendingSubs.value.push([draggedSub.value, target]);
      }
    }
  }

  dragId.value = null;
  dragSource.value = null;
  draggedSub.value = null;
  hoveredPlayerId.value = null;
}

// ── Substitution ─────────────────────────────────────────────

function cancelPendingSub(index: number) {
  pendingSubs.value = pendingSubs.value.filter((_, i) => i !== index);
}

function onPlayerMouseEnter(player: Player) {
  if (!draggedSub.value) return;

  if (isPendingLocked(player.id) || isPendingLocked(draggedSub.value.id)) {
    hoveredPlayerId.value = null;
    return;
  }

  hoveredPlayerId.value = player.id;
}

function performSub() {
  publish(SocketMessage.SubstitutionShow, {
    data: {
      location: props.location,
      subs: pendingSubs.value,
    },
  });
  pendingSubs.value = [];
}

function onTeamSave(
  updatedPlayers: Player[],
  updatedSubs: Player[],
  updatedManager: string,
  updatedCaptain: Player,
) {
  players.value.splice(0, players.value.length, ...updatedPlayers);
  substitutes.value.splice(0, substitutes.value.length, ...updatedSubs);

  publish(SocketMessage.TeamInfoUpdate, {
    data: {
      location: props.location,
      players: players.value,
      substitutes: substitutes.value,
      manager: updatedManager,
      captain: updatedCaptain,
    },
  });

  dialogRef.value?.close();
}

function openDialog() {
  dialogKey.value++;
  dialogRef.value?.showModal();
}
</script>

<template>
  <div class="wrap" @mouseup="stopDrag">
    <div class="wrap row">
      <div>{{ props.name }}</div>
      <Button class="neutral" :location="props.location" @click="openDialog">
        📝
      </Button>
      <dialog ref="dialogRef">
        <EditTeamForm
          :key="dialogKey"
          :players="players"
          :substitutes="substitutes"
          :manager="props.manager"
          :location="props.location"
          :captain="props.captain"
          @save="onTeamSave"
        />
      </dialog>
    </div>

    <!-- Controls -->
    <div class="wrap">
      <select
        class="controls"
        :value="activeFormation"
        @change="applyFormation($event.target.value)"
      >
        <option disabled value="">Choose Formation</option>
        <option v-for="key in Formation" :key="key" :value="key">
          {{ key }}
        </option>
      </select>
    </div>
    <ToggleOverlayButton
      v-bind="{
        val: Overlay.TeamFormation,
        name: state.graphics.teamFormation.name,
        showMessage: SocketMessage.TeamFormationShow,
        hideMessage: SocketMessage.TeamFormationHide,
        disabled: !activeFormation || !state.matchTime.paused,
        data: {
          data: {
            location: props.location,
          },
        },
      }"
    />
    <Button :disabled="hasPendingSubs" class="action" v-on:click="performSub">
      Apply Substitutions
    </Button>

    <!-- Pitch -->
    <div class="pitch" ref="pitchEl">
      <div class="stripes" />

      <svg
        class="markings"
        viewBox="0 0 460 660"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="18"
          y="18"
          width="424"
          height="624"
          fill="none"
          stroke="rgba(255,255,255,.8)"
          stroke-width="1.8"
        />
        <line
          x1="18"
          y1="330"
          x2="442"
          y2="330"
          stroke="rgba(255,255,255,.8)"
          stroke-width="1.8"
        />
        <circle
          cx="230"
          cy="330"
          r="64"
          fill="none"
          stroke="rgba(255,255,255,.8)"
          stroke-width="1.8"
        />
        <circle cx="230" cy="330" r="3.5" fill="rgba(255,255,255,.8)" />
        <rect
          x="100"
          y="18"
          width="260"
          height="100"
          fill="none"
          stroke="rgba(255,255,255,.8)"
          stroke-width="1.8"
        />
        <rect
          x="158"
          y="18"
          width="144"
          height="40"
          fill="none"
          stroke="rgba(255,255,255,.8)"
          stroke-width="1.8"
        />
        <rect
          x="188"
          y="7"
          width="84"
          height="13"
          fill="none"
          stroke="rgba(255,255,255,.55)"
          stroke-width="1.8"
        />
        <circle cx="230" cy="88" r="3" fill="rgba(255,255,255,.8)" />
        <path
          d="M168,118 A74,74 0 0,1 292,118"
          fill="none"
          stroke="rgba(255,255,255,.8)"
          stroke-width="1.8"
        />
        <rect
          x="100"
          y="542"
          width="260"
          height="100"
          fill="none"
          stroke="rgba(255,255,255,.8)"
          stroke-width="1.8"
        />
        <rect
          x="158"
          y="602"
          width="144"
          height="40"
          fill="none"
          stroke="rgba(255,255,255,.8)"
          stroke-width="1.8"
        />
        <rect
          x="188"
          y="640"
          width="84"
          height="13"
          fill="none"
          stroke="rgba(255,255,255,.55)"
          stroke-width="1.8"
        />
        <circle cx="230" cy="572" r="3" fill="rgba(255,255,255,.8)" />
        <path
          d="M168,542 A74,74 0 0,0 292,542"
          fill="none"
          stroke="rgba(255,255,255,.8)"
          stroke-width="1.8"
        />
        <path
          d="M18,32 A14,14 0 0,1 32,18"
          fill="none"
          stroke="rgba(255,255,255,.8)"
          stroke-width="1.8"
        />
        <path
          d="M428,18 A14,14 0 0,1 442,32"
          fill="none"
          stroke="rgba(255,255,255,.8)"
          stroke-width="1.8"
        />
        <path
          d="M442,628 A14,14 0 0,1 428,642"
          fill="none"
          stroke="rgba(255,255,255,.8)"
          stroke-width="1.8"
        />
        <path
          d="M32,642 A14,14 0 0,1 18,628"
          fill="none"
          stroke="rgba(255,255,255,.8)"
          stroke-width="1.8"
        />
      </svg>

      <!-- On-pitch players -->
      <button
        v-for="(player, index) in players"
        :key="player.id"
        class="player"
        :title="`${player.forename} ${player.surname}`"
        :class="{
          dragging: dragId === player.id && dragSource === 'pitch',
          'sub-target': hoveredPlayerId === player.id && draggedSub,
        }"
        :style="getFormationPosition(activeFormation, index)"
        @mousedown.prevent="startPitchPlayerDrag($event, player)"
        @mouseenter="onPlayerMouseEnter(player)"
        @mouseleave="hoveredPlayerId = null"
        @click="() => (selectedPlayer = player)"
      >
        {{ player.number }}
      </button>

      <div v-if="pendingSubs.length > 0" class="pending-subs">
        <ul class="pending-list">
          <li
            v-for="(item, index) in pendingSubs"
            :key="`${item[0].id}-${item[1].id}-${index}`"
            class="pending-item"
          >
            <span>
              {{ item[0].number }}: {{ item[0].forename }}
              {{ item[0].surname }} -> {{ item[1].number }}:
              {{ item[1].forename }} {{ item[1].surname }}
            </span>
            <Button class="pending-cancel" v-on:click="cancelPendingSub(index)">
              Cancel
            </Button>
          </li>
        </ul>
      </div>
    </div>

    <!-- Bench -->
    <div class="bench-wrap">
      <div class="bench" ref="benchEl">
        <div
          v-for="sub in sortedSubs"
          :key="sub.id"
          :title="`${sub.forename} ${sub.surname}`"
          class="sub"
          :class="{
            dragging: dragId === sub.id && dragSource === 'bench',
            'pending-locked': isPendingLocked(sub.id),
          }"
          @mousedown.prevent="startBenchDrag($event, sub)"
        >
          {{ sub.number }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

.wrap {
  display: flex;
  flex-direction: column;
  gap: 5px;
  user-select: none;

  .row {
    flex-direction: row;
    justify-content: space-between;
  }
}

.pitch {
  position: relative;
  width: 250px;
  height: 400px;
  background: var(--pitch-editor);
  overflow: hidden;
  border: 2px solid #1a2e1a;
}

.stripes {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    180deg,
    transparent 0,
    transparent 37px,
    rgba(0, 0, 0, 0.06) 37px,
    rgba(0, 0, 0, 0.06) 74px
  );
  pointer-events: none;
}

.markings {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.player {
  position: absolute;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  background: #e8c84a;
  color: #1a1a1a;
  transform: translate(-50%, -50%);
  cursor: grab;
  border: 2px solid rgba(255, 255, 255, 0.8);
  z-index: 10;
}

.player.dragging {
  cursor: grabbing;
  z-index: 100;
  transform: translate(-50%, -50%) scale(1.15);
}

.player.sub-target {
  outline: 2px solid #fff;
  transform: translate(-50%, -50%) scale(1.15);
}

.player.ghost {
  opacity: 0.5;
  background: #7ecf7e;
  pointer-events: none;
  z-index: 50;
  border-style: dashed;
}

.sub-badge {
  position: absolute;
  top: -7px;
  right: -7px;
  background: #4caf50;
  color: #fff;
  border-radius: 50%;
  width: 14px;
  height: 14px;
  font-size: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.controls {
  border: 1px solid #ccc;
  border-radius: 4px;
  color: #000000;
  padding: 4px 8px;
  font-family: inherit;
  background: #ffffff;
  cursor: pointer;
}

.bench-wrap {
  width: var(--pitch-width);
  overflow-x: auto;
}

.bench {
  display: flex;
  gap: 10px;
  flex-wrap: nowrap;
  padding-bottom: 4px;
}

.pending-subs {
  position: absolute;
  left: 8px;
  right: 8px;
  bottom: 8px;
  max-height: 92px;
  overflow-y: auto;
  padding: 6px 8px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.72);
  color: #fff;
}

.pending-subs p {
  margin: 0 0 4px;
  font-size: 12px;
  font-weight: 600;
}

.pending-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.pending-item {
  margin: 0;
  font-size: 12px;
  line-height: 1.3;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: start;
  gap: 8px;
}

.pending-item span {
  min-width: 0;
  overflow-wrap: anywhere;
}

.pending-cancel {
  border: 1px solid rgba(255, 255, 255, 0.55);
  border-radius: 4px;
  background: transparent;
  font-size: 11px;
  line-height: 1;
  white-space: nowrap;
  align-self: start;
  padding: 3px 6px;
  cursor: pointer;
}

.sub {
  position: relative;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  background: #7ecf7e;
  color: #1a2e1a;
  border: 2px solid rgba(0, 0, 0, 0.15);
  cursor: grab;
  flex-shrink: 0;
}

.sub.dragging {
  opacity: 0.4;
  cursor: grabbing;
}

.sub.pending-locked {
  opacity: 0.45;
  cursor: not-allowed;
}
</style>
