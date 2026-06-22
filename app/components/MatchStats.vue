<script setup lang="ts">
const { state, publish } = useOutputSocket();
</script>

<template>
  <section class="match-stats-panel">
    <div class="container">
      <div class="match-timer">
        {{ state.matchTime.formatted }}
      </div>

      <div class="teams-and-score">
        <div class="teams">
          <div class="abbr">
            <div class="home-abbr">
              {{ state.home.shortName }}
            </div>

            <div class="v">v</div>

            <div class="away-abbr">
              {{ state.away.shortName }}
            </div>
          </div>

          <div class="names">
            <div class="home-name">
              {{ state.home.name }}
            </div>

            <div></div>

            <div class="away-name">
              {{ state.away.name }}
            </div>
          </div>

          <div class="scores">
            <div class="home-score">
              {{ state.home.goals.length }}
            </div>

            <div></div>

            <div class="away-score">
              {{ state.away.goals.length }}
            </div>
          </div>

          <div class="scorers">
            <div class="home-scorers">
              <ul v-for="goal in state.home.goals">
                <li>
                  ({{ getMinutes(goal.matchTime) }}') {{ goal.player.forename }}
                  {{ goal.player.surname }}
                </li>
              </ul>
            </div>
            <div class="away-scorers">
              <ul v-for="goal in state.away.goals">
                <li>
                  ({{ getMinutes(goal.matchTime) }}') {{ goal.player.forename }}
                  {{ goal.player.surname }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="css" scoped>
.match-stats-panel {
  --base-font-size: 20px;

  display: flex;
  justify-content: center;
  font-size: var(--base-font-size);
  font-family: var(--font-display);
}

.container {
  width: 100%;
  max-height: 100dvh;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 2dvh;
}

.match-timer {
  background: #000;
  color: #ffffff;
  margin-top: 2dvh;
  min-width: 6ch;
  text-align: center;
  padding: 0.2em 0.9em;
  font-size: 1.5em;
}

.teams {
  display: grid;
  grid-template-columns: 1fr 3em 1fr;
  row-gap: 0.2em;
  align-items: center;
}

.abbr {
  display: contents;
  font-family: var(--font-secondary);
  font-size: 2em;
}

.names {
  display: contents;
}

.v {
  grid-column: 2;
  justify-self: center;
  text-align: center;

  font-size: 0.7em;
  color: #0000007e;
}

.scores {
  display: contents;
  font-size: 3em;
  line-height: 0.9em;
}

.scorers {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: 1fr 3em 1fr;
  align-items: center;
  font-size: 0.8em;
  font-style: italic;
  background: #d6cfc7;
  border-radius: 0.5em;
  padding: 0.35em 0.6em;
}

.scorers ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
}

.home-abbr,
.home-name,
.home-score,
.home-scorers {
  grid-column: 1;
  text-align: right;
  justify-self: end;
}

.away-abbr,
.away-name,
.away-score,
.away-scorers {
  grid-column: 3;
  text-align: left;
  justify-self: start;
}
</style>
