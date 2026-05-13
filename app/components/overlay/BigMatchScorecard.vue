<script setup lang="ts"></script>

<template>
  <section class="overlay" ref="overlay">
    <div class="broadcast-large">
      <div class="ribbon-box">
        <div class="ribbon"></div>
        <div class="ribbon"></div>
      </div>

      <div class="scorecard-large">
        <!-- Home: Dunterlie Dynamos -->
        <div class="panel large-panel team-home">
          <div class="team-home-background background-large"></div>
          <span class="team-abbr-large">DUN</span>

          <div class="team-details-row home-details">
            <div class="scorers">
              <div class="scorer">42: Drew Lennie (24')</div>
              <div class="scorer">17: Matthew Blyth (35')</div>
            </div>
            <div class="team-name team-name-home">Dunterlie Dynamos</div>
          </div>

          <div class="score-row">
            <div class="score-large home-score-large">2</div>
          </div>
        </div>

        <div class="league-badge-large">
          <img src="../../assets/jmBall.png" alt="League Badge" />
        </div>

        <!-- Away: AC Malones -->
        <div class="panel large-panel team-away">
          <div class="team-away-background background-large"></div>

          <div class="score-row">
            <div class="score-large away-score-large">1</div>
          </div>

          <div class="team-details-row away-details">
            <div class="scorers">
              <div class="scorer">35: Joe Donnelly (42')</div>
            </div>
            <div class="team-name team-name-away">AC Malones</div>
          </div>

          <span class="team-abbr-large">MAL</span>
        </div>
      </div>

      <div class="timer-box-large">
        <span class="timer-text-large timer">55:00</span>
      </div>
    </div>
  </section>
</template>

<style scoped></style>
