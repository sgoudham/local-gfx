<script setup lang="ts">
import { ref, reactive } from "vue";
import { TeamFormationPitch } from "~~/shared/utils/constants";

const { state, publish } = useControlSocket();
const { selectedPlayer } = useClientState();

const props = defineProps<TeamComplete>();

const PITCH_W = TeamFormationPitch.Width;
const PITCH_H = TeamFormationPitch.Height;
const PITCH_HORIZONTAL_PADDING = TeamFormationPitch.HorizontalPadding;

const players = reactive<Player[]>(props.players);
const subs = reactive<Player[]>(props.substitutes);
const sortedSubs = computed(() => [...subs].sort((a, b) => a.number - b.number));
const pendingSubs = ref<PendingSub[]>([]);
const pitchEl = ref<HTMLElement | null>(null);
const hoveredPlayerId = ref<number | null>(null);
const hasPendingSubs = computed(() => pendingSubs.value.length === 0);
const activeFormation = computed(() => props.activeFormation);
const layoutVars = computed(() => ({
  "--pitch-width": `${PITCH_W}px`,
  "--pitch-height": `${PITCH_H}px`,
}));

watch(activeFormation, () => updatePlayerPositions(), {
  deep: true,
  immediate: true,
});

// Unified drag state
const drag = reactive({
  id: null as number | null,
  source: null as "pitch" | "bench" | null,
  sub: null as Player | null,
});

let dragOffsetX = 0;
let dragOffsetY = 0;

function isPendingLocked(playerNumber: number) {
  return pendingSubs.value.some(
    ([subIn, playerOut]) =>
      subIn.number === playerNumber || playerOut.number === playerNumber,
  );
}

// ── Formations ──────────────────────────────────────────────

function updatePlayerPositions(formation: FormationKey = activeFormation.value) {
  const lines = [1, ...formation.split("-").map((v) => Number(v))];
  const positions: { x: number; y: number }[] = [];
  const padTop = 42,
    padBottom = 120;
  const usableHeight = PITCH_H - padTop - padBottom;
  const numLines = lines.length;

  lines.forEach((playersPerLine, lineIndex) => {
    const lineProgress = numLines === 1 ? 0.5 : lineIndex / (numLines - 1);
    const y = padTop + lineProgress * usableHeight;

    for (let playerIndex = 0; playerIndex < playersPerLine; playerIndex++) {
      const playerProgress =
        playersPerLine === 1 ? 0.5 : playerIndex / (playersPerLine - 1);
      const x =
        PITCH_HORIZONTAL_PADDING +
        playerProgress * (PITCH_W - 2 * PITCH_HORIZONTAL_PADDING);
      positions.push({ x, y });
    }
  });

  positions.forEach((position, index) => {
    const player = players[index];
    if (player) {
      player.x = position.x;
      player.y = position.y;
    }
  });
}

function applyFormation(key: FormationKey) {
  updatePlayerPositions(key);

  publish(SocketMessage.ActiveFormationUpdate, {
    data: {
      location: props.location,
      activeFormation: key,
      players,
    },
  });
}

// ── Pitch drag ───────────────────────────────────────────────

function startPitchDrag(e: MouseEvent, player: Player) {
  drag.id = player.number;
  drag.source = "pitch";
  drag.sub = null;
  if (!pitchEl.value) return;
  const rect = pitchEl.value.getBoundingClientRect();
  dragOffsetX = e.clientX - rect.left - (player.x ?? 0);
  dragOffsetY = e.clientY - rect.top - (player.y ?? 0);
}

// ── Bench drag ───────────────────────────────────────────────

function startBenchDrag(e: MouseEvent, sub: Player) {
  if (isPendingLocked(sub.number)) return;

  drag.id = sub.number;
  drag.source = "bench";
  drag.sub = sub;
  dragOffsetX = 16;
  dragOffsetY = 16;
}

// ── Shared mousemove (on .wrap) ──────────────────────────────

function onMouseMove(e: MouseEvent) {
  if (drag.source === "pitch") {
    const player = players.find((p) => p.number === drag.id);
    if (!player) return;
    if (!pitchEl.value) return;
    const rect = pitchEl.value.getBoundingClientRect();
    player.x = Math.max(
      16,
      Math.min(PITCH_W - 16, e.clientX - rect.left - dragOffsetX),
    );
    player.y = Math.max(
      16,
      Math.min(PITCH_H - 16, e.clientY - rect.top - dragOffsetY),
    );
  }
}

function stopDrag(_e: MouseEvent) {
  if (drag.source === "bench" && drag.sub) {
    // Check if dropped on a player
    const target =
      hoveredPlayerId.value !== null
        ? players.find((p) => p.number === hoveredPlayerId.value)
        : null;

    if (
      target &&
      !isPendingLocked(drag.sub.number) &&
      !isPendingLocked(target.number)
    ) {
      pendingSubs.value.push([drag.sub, target]);
    }
  }

  drag.id = null;
  drag.source = null;
  drag.sub = null;
  hoveredPlayerId.value = null;
}

// ── Substitution ─────────────────────────────────────────────

function cancelPendingSub(index: number) {
  pendingSubs.value = pendingSubs.value.filter((_, i) => i !== index);
}

function onPlayerMouseEnter(player: Player) {
  if (drag.source === "bench" && isPendingLocked(player.number)) {
    hoveredPlayerId.value = null;
    return;
  }
  hoveredPlayerId.value = player.number;
}

function performSub() {
  // Server
  publish(SocketMessage.SubstitutionShow, {
    data: {
      location: props.location,
      subs: pendingSubs.value,
    },
  });

  // Client
  for (const [subIn, playerOut] of pendingSubs.value) {
    const playerIndex = players.findIndex((p) => p.number === playerOut.number);
    const subIndex = subs.findIndex((s) => s.number === subIn.number);

    if (playerIndex === -1 || subIndex === -1) continue;
    const player = players[playerIndex];
    const sub = subs[subIndex];

    if (!player || !sub) continue;
    players[playerIndex] = sub;
    subs[subIndex] = player;
  }
  updatePlayerPositions();
  pendingSubs.value = []
  // FIXME: Ideally shouldn't have to republish ActiveFormationUpdate, but this
  // allows for the player positions to be sent to the server for now
  publish(SocketMessage.ActiveFormationUpdate, {
    data: {
      location: props.location,
      activeFormation: activeFormation.value,
      players,
    },
  });
}
</script>

<template>
  <div
    class="wrap"
    :style="layoutVars"
    @mousemove="onMouseMove"
    @mouseup="stopDrag"
  >
    <div>{{ props.name }} ({{ props.shortName }})</div>

    <!-- Controls -->
    <div class="wrap row">
      <select
        class="controls"
        :value="activeFormation"
        @change="applyFormation($event.target.value)"
      >
        <option v-for="key in Formation" :key="key" :value="key">
          {{ key }}
        </option>
      </select>
      <Button class="action">Edit Players</Button>
    </div>
    <ToggleOverlayButton
      v-bind="{
        val: Overlay.TeamFormation,
        name: state.graphics.teamFormation.name,
        showMessage: SocketMessage.TeamFormationShow,
        hideMessage: SocketMessage.TeamFormationHide,
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
        v-for="player in players"
        :key="player.number"
        class="player"
        :title="`${player.forename} ${player.surname}`"
        :class="{
          dragging: drag.id === player.number && drag.source === 'pitch',
          'sub-target':
            drag.source === 'bench' && hoveredPlayerId === player.number,
        }"
        :style="{ left: player.x + 'px', top: player.y + 'px' }"
        @mousedown.prevent="startPitchDrag($event, player)"
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
            :key="`${item[0].number}-${item[1].number}-${index}`"
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
          :key="sub.number"
          :title="`${sub.forename} ${sub.surname}`"
          class="sub"
          :class="{
            dragging: drag.id === sub.number && drag.source === 'bench',
            'pending-locked': isPendingLocked(sub.number),
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
  width: var(--pitch-width);
  max-width: var(--pitch-width);
  user-select: none;

  .row {
    flex-direction: row;
    justify-content: space-between;
  }
}

.pitch {
  position: relative;
  width: var(--pitch-width);
  height: var(--pitch-height);
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
