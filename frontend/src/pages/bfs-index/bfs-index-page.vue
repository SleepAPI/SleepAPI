<template>
  <v-container class="bfs-index-page">
    <h1 class="text-h4 mb-3">Berry Finding S Index</h1>
    <p class="mb-4">
      How much each Pokémon benefits from Berry Finding S, based on
      <a :href="BFS_INDEX_SOURCE" target="_blank" rel="noopener noreferrer">u/VelocityRaptor22’s original BFS index</a>.
    </p>

    <div class="d-flex flex-wrap ga-4 mb-4">
      <v-switch
        v-model="includeUnevolved"
        label="Include unevolved Pokémon"
        color="primary"
        hide-details
        data-testid="include-unevolved"
      />
      <v-switch
        v-model="ingredientFinderM"
        label="Ingredient Finder M for ingredient specialists"
        color="primary"
        hide-details
        data-testid="ingredient-finder-m"
      />
    </div>

    <v-text-field
      v-model="searchQuery"
      label="Search Pokémon"
      prepend-inner-icon="mdi-magnify"
      variant="outlined"
      density="compact"
      clearable
      hide-details
      class="mb-4"
      data-testid="pokemon-search"
    />

    <h2 id="bfs-chart-title" class="chart-title text-h5 pa-4">Raptor BFS Value Index</h2>
    <div class="chart-container" role="region" aria-labelledby="bfs-chart-title">
      <table class="index-chart" aria-labelledby="bfs-chart-title">
        <colgroup>
          <col class="range-column" />
          <col />
        </colgroup>
        <thead>
          <tr>
            <th scope="col">Index range</th>
            <th scope="col">Pokémon · highest to lowest</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in filteredRows" :key="row.min">
            <th scope="row" class="range-label" :style="{ backgroundColor: rangeColor(row.min) }">
              {{ row.min.toFixed(1) }} - &lt;{{ row.max.toFixed(1) }}
            </th>
            <td>
              <ol class="pokemon-list">
                <li v-for="(entry, index) in row.entries" :key="entry.pokemon.name" class="pokemon-entry">
                  <img
                    :src="
                      avatarImage({
                        pokemonName: entry.pokemon.name,
                        shiny: false,
                        happy: false
                      })
                    "
                    :alt="entry.pokemon.displayName"
                    :title="`${entry.pokemon.displayName} · ${entry.pokemon.specialty} · ${formatBfsIndex(entry.score)}`"
                    width="72"
                    height="72"
                    loading="lazy"
                  />
                  <v-card
                    class="pokemon-score text-center text-x-small rounded-0"
                    :color="index % 2 === 0 ? 'white' : 'grey-lighten-2'"
                    variant="flat"
                    :aria-label="`${entry.pokemon.displayName}: ${formatBfsIndex(entry.score)}`"
                  >
                    {{ formatBfsIndex(entry.score) }}
                  </v-card>
                </li>
              </ol>
            </td>
          </tr>
          <tr v-if="filteredRows.length === 0">
            <td colspan="2"><span class="empty-row text-center" role="status">No matching Pokémon</span></td>
          </tr>
        </tbody>
      </table>
    </div>

    <v-card class="mt-5 pa-4" variant="tonal">
      <h2 class="text-h6 mb-2">How the index is calculated</h2>
      <p class="mb-3">Skill specialists: <code>(864 / f) × (1 − i) × b</code></p>
      <p>
        Ingredient specialists:
        <code>{{ ingredientFinderM ? '(864 / f) × (1 − 1.36 × i) × b' : '(864 / f) × (1 − i) × b' }}</code>
      </p>
      <p class="mt-3">
        <code>864</code> is the number of seconds in a day (86,400) divided by 100 to keep index scores compact.<br />
        <code>f</code> is base helping frequency in seconds.<br />
        <code>i</code> is base ingredient rate as a fraction.<br />
        <code>b</code> is base berry strength.
      </p>
      <p class="mt-3">
        “All” specialists use the skill formula by default: <code>(864 / f) × (1 − i) × b</code>, with their base
        ingredient rate. The Ingredient Finder M toggle does not affect them.
      </p>
      <p class="mt-3">
        Formula and chart concept by
        <a :href="BFS_INDEX_SOURCE" target="_blank" rel="noopener noreferrer">u/VelocityRaptor22</a>.
      </p>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { BFS_INDEX_SOURCE, buildBfsIndexRows, formatBfsIndex } from '@/services/bfs-index-service'
import { avatarImage } from '@/services/utils/image-utils'
import { computed, ref } from 'vue'

const includeUnevolved = ref(false)
const ingredientFinderM = ref(true)
const searchQuery = ref<string | null>('')
const rows = computed(() =>
  buildBfsIndexRows(undefined, {
    includeUnevolved: includeUnevolved.value,
    ingredientFinderM: ingredientFinderM.value
  })
)
const filteredRows = computed(() => {
  const query = normalizeSearch(searchQuery.value ?? '').trim()
  if (!query) return rows.value

  return rows.value
    .map((row) => ({
      ...row,
      entries: row.entries.filter((entry) => normalizeSearch(entry.pokemon.displayName).includes(query))
    }))
    .filter((row) => row.entries.length > 0)
})

function normalizeSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[.'’]/g, '')
    .toLowerCase()
}

function rangeColor(min: number): string {
  // Purple at the top, through green, to red at the bottom, matching the reference chart.
  const hue = Math.max(0, Math.min(260, ((min - 4.5) / 5.5) * 260))
  return `hsl(${hue} 45% 28%)`
}
</script>

<style scoped lang="scss">
.bfs-index-page {
  width: 100%;
  max-width: 1280px;
}

.chart-container {
  width: 100%;
  border-radius: 0 0 8px 8px;
}

.chart-title {
  background: #171717;
  color: #fff;
  text-align: center;
  border-radius: 8px 8px 0 0;
}

.index-chart {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  background: #444;
  color: #fff;

  thead {
    background: #171717;
    color: #fff;
  }

  thead th {
    padding: 8px;
    font-size: 0.8rem;
    text-align: left;
  }

  thead th:first-child {
    text-align: center;
  }

  tbody tr:nth-child(even) {
    background: #606060;
  }

  td {
    padding: 0;
  }

  th,
  td {
    border-bottom: 1px solid #222;
  }
}

.range-column {
  width: 112px;
}

.range-label {
  padding: 10px;
  font-size: 0.85rem;
  white-space: nowrap;
}

.pokemon-list {
  display: flex;
  flex-wrap: wrap;
  min-height: 88px;
  list-style: none;
  padding: 0;
  margin: 0;
  gap: 0;
}

.pokemon-entry {
  flex: 0 0 min(72px, 100%);

  img {
    display: block;
    width: 100%;
    height: 72px;
    object-fit: cover;
  }
}

.pokemon-score {
  width: 100%;
  height: 16px;
  line-height: 16px;
  color: #111;
  font-variant-numeric: tabular-nums;
}

.empty-row {
  display: block;
  padding: 20px;
  font-size: 0.85rem;
}
</style>
