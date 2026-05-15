<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";

const PITCH_W = 250;
const PITCH_H = 400;
const PITCH_HORIZONTAL_PADDING = 46;

const FORMATIONS = {
  "4-4-2": [1, 4, 4, 2],
  "4-3-3": [1, 4, 3, 3],
  "4-2-3-1": [1, 4, 2, 3, 1],
  "3-5-2": [1, 3, 5, 2],
  "5-3-2": [1, 5, 3, 2],
  "4-1-4-1": [1, 4, 1, 4, 1],
};

const SUB_COUNT = 8;

const formationKeys = Object.keys(FORMATIONS);
const activeFormation = ref("4-4-2");
const players = reactive([]);
const subs = reactive([]);
const pitchEl = ref(null);
const hoveredPlayerId = ref(null);

// Unified drag state
const drag = reactive({
  id: null,
  source: null,
  sub: null,
});

let dragOffsetX = 0;
let dragOffsetY = 0;
let idCounter = 0;
const nextId = () => ++idCounter;

// ── Formations ──────────────────────────────────────────────

function buildPositions(lines) {
  const positions = [];
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

  return positions;
}

function applyFormation(key) {
  activeFormation.value = key;
  const newPositions = buildPositions(FORMATIONS[key]);

  // Create players on first call, update positions on subsequent calls
  if (players.length === 0) {
    newPositions.forEach((p, i) => {
      players.push({
        id: nextId(),
        num: i + 1,
        x: p.x,
        y: p.y,
        subbed: false,
      });
    });
  } else {
    // Update positions while preserving num and subbed status
    newPositions.forEach((position, index) => {
      if (index < players.length) {
        players[index].x = position.x;
        players[index].y = position.y;
      }
    });
  }

  // Reset subs used state
  subs.forEach((s) => {
    s.used = false;
  });
}

function initSubs() {
  subs.length = 0;
  for (let i = 0; i < SUB_COUNT; i++) {
    subs.push({ id: nextId(), num: 12 + i, used: false });
  }
}

// ── Pitch drag ───────────────────────────────────────────────

function startPitchDrag(e, player) {
  drag.id = player.id;
  drag.source = "pitch";
  drag.sub = null;
  const rect = pitchEl.value.getBoundingClientRect();
  dragOffsetX = e.clientX - rect.left - player.x;
  dragOffsetY = e.clientY - rect.top - player.y;
}

// ── Bench drag ───────────────────────────────────────────────

function startBenchDrag(e, sub) {
  drag.id = sub.id;
  drag.source = "bench";
  drag.sub = sub;
  dragOffsetX = 16;
  dragOffsetY = 16;
}

// ── Shared mousemove (on .wrap) ──────────────────────────────

function onMouseMove(e) {
  if (drag.source === "pitch") {
    const player = players.find((p) => p.id === drag.id);
    if (!player) return;
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

  if (drag.source === "bench") {
    // Bench drag logic can be removed or kept for future use
  }
}

function stopDrag(e) {
  if (drag.source === "bench" && drag.sub) {
    // Check if dropped on a player
    const target =
      hoveredPlayerId.value !== null
        ? players.find((p) => p.id === hoveredPlayerId.value)
        : null;

    if (target) {
      performSub(drag.sub, target);
    }
  }

  drag.id = null;
  drag.source = null;
  drag.sub = null;
  hoveredPlayerId.value = null;
}

// ── Substitution ─────────────────────────────────────────────

function performSub(sub, outPlayer) {
  const prevNum = outPlayer.num;

  outPlayer.num = sub.num;
  outPlayer.subbed = true;

  sub.num = prevNum;
  sub.used = false;
}

// ── Lifecycle ────────────────────────────────────────────────

onMounted(() => {
  initSubs();
  applyFormation(activeFormation.value);
});
</script>

<template>
  <div class="wrap" @mousemove="onMouseMove" @mouseup="stopDrag">
    <!-- Formation picker -->
    <select
      class="controls"
      :value="activeFormation"
      @change="applyFormation($event.target.value)"
    >
      <option v-for="key in formationKeys" :key="key" :value="key">
        {{ key }}
      </option>
    </select>

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
      <div
        v-for="player in players"
        :key="player.id"
        class="player"
        :class="{
          dragging: drag.id === player.id && drag.source === 'pitch',
          'sub-target':
            drag.source === 'bench' && hoveredPlayerId === player.id,
        }"
        :style="{ left: player.x + 'px', top: player.y + 'px' }"
        @mousedown.prevent="startPitchDrag($event, player)"
        @mouseenter="hoveredPlayerId = player.id"
        @mouseleave="hoveredPlayerId = null"
      >
        {{ player.num }}
        <!-- Sub arrow badge -->
        <span v-if="player.subbed" class="sub-badge">↕</span>
      </div>
    </div>

    <!-- Bench -->
    <div class="bench-wrap">
      <div class="bench" ref="benchEl">
        <div
          v-for="sub in subs"
          :key="sub.id"
          class="sub"
          :class="{
            dragging: drag.id === sub.id && drag.source === 'bench',
            used: sub.used,
          }"
          @mousedown.prevent="!sub.used && startBenchDrag($event, sub)"
        >
          {{ sub.num }}
          <span v-if="sub.used" class="used-tick">✓</span>
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
  gap: 10px;
  user-select: none;
}

.pitch {
  position: relative;
  width: 250px;
  height: 400px;
  background: #2d7a3a;
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
  color: #555;
  font-size: 12px;
  padding: 4px 8px;
  font-family: inherit;
  cursor: pointer;
}

.bench-wrap {
  width: 250px;
  overflow-x: auto;
}

.bench {
  display: flex;
  gap: 10px;
  flex-wrap: nowrap;
  padding-bottom: 4px;
}

.sub {
  position: relative;
  width: 44px;
  height: 44px;
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
.sub.used {
  opacity: 0.3;
  cursor: default;
}

.used-tick {
  position: absolute;
  top: -6px;
  right: -6px;
  background: #4caf50;
  color: #fff;
  border-radius: 50%;
  width: 14px;
  height: 14px;
  font-size: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
