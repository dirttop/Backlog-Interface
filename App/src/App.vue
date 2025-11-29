<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import GameCard from './components/GameCard.vue';
import TheSearchBar from './components/TheSearchBar.vue';
import TheCreateGameModal from './components/TheCreateGameModal.vue';
import type { Game } from './types';
import { useGames } from './composables/useGames';

const { 
  games, 
  loading, 
  error, 
  fetchGames, 
  fetchGameById, 
  createGame: apiCreateGame, 
  deleteGame: apiDeleteGame, 
  updateGame: apiUpdateGame 
} = useGames();

const searchQuery = ref('');
const searchMode = ref<'name' | 'id'>('name');
const displayedCount = ref(20);
const showCreateModal = ref(false);
const BATCH_SIZE = 20;

// Create game handler wrapper
const createGame = async (newGame: Partial<Game>) => {
  const success = await apiCreateGame(newGame);
  if (success) {
    showCreateModal.value = false;
    
    // Reset search if active so user can see the new game
    if (searchQuery.value) {
      searchQuery.value = '';
      searchMode.value = 'name';
      fetchGames();
    }
  }
};

// Delete game handler wrapper
const deleteGame = async (id: number) => {
  const success = await apiDeleteGame(id);
  if (success) {
    // If we're in ID search mode and deleted the only result, clear the search
    if (searchMode.value === 'id' && games.value.length === 0) {
      searchQuery.value = '';
      searchMode.value = 'name';
      fetchGames();
    }
  }
};

// Debounce search
let debounceTimeout: number | null = null;
watch(searchQuery, (newQuery) => {
  if (debounceTimeout) clearTimeout(debounceTimeout);
  
  debounceTimeout = setTimeout(() => {
    if (searchMode.value === 'id') {
      fetchGameById(newQuery);
    } else {
      fetchGames(newQuery);
    }
  }, 500);
});

// Watch mode change to reset or fetch appropriate data
watch(searchMode, () => {
  searchQuery.value = '';
  fetchGames(); // Always reset to all games when switching modes
});

// Get the subset of games to display
const displayedGames = computed(() => {
  return games.value.slice(0, displayedCount.value);
});

// Load more games
const loadMore = () => {
  if (displayedCount.value < games.value.length) {
    displayedCount.value += BATCH_SIZE;
  }
};

// Reset displayed count when search changes
watch([searchQuery, searchMode], () => {
  displayedCount.value = BATCH_SIZE;
});

// Infinite scroll handler
const handleScroll = () => {
  const bottomOfWindow = Math.max(window.pageYOffset, document.documentElement.scrollTop, document.body.scrollTop) + window.innerHeight === document.documentElement.offsetHeight;
  if (bottomOfWindow) {
    loadMore();
  }
};

onMounted(() => {
  fetchGames();
  window.addEventListener('scroll', handleScroll);
});
</script>

<template>
  <div class="app-container">
    <header class="app-header">
      <h1>Backlog</h1>
      <button class="create-btn" @click="showCreateModal = true">Add Game</button>
    </header>

    <main>
      <TheSearchBar 
        v-model="searchQuery" 
        v-model:searchMode="searchMode"
      />

      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <div v-else-if="loading && games.length === 0" class="loading">
        Loading games...
      </div>

      <div v-else class="games-list">
        <GameCard
          v-for="game in displayedGames"
          :key="game.SteamAppId"
          :game="game"
          @delete="deleteGame"
          @update="apiUpdateGame"
        />
        
        <div v-if="displayedGames.length === 0 && !loading" class="no-results">
          No games found matching "{{ searchQuery }}"
        </div>

        <div v-if="displayedCount < games.length" class="load-more-trigger">
          Loading more...
        </div>
      </div>
    </main>

    <TheCreateGameModal
      v-if="showCreateModal"
      @close="showCreateModal = false"
      @create="createGame"
    />
  </div>
</template>

<style scoped>
.app-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  min-height: 100vh;
}

header {
  margin-bottom: 3rem;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.app-header h1 {
  margin: 0;
}

.create-btn {
  background-color: #333;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.create-btn:hover {
  background-color: #555;
}

h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: inherit;
  margin: 0;
}

.error-message {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: #fca5a5;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
}

.loading, .no-results, .load-more-trigger {
  text-align: center;
  padding: 2rem;
  color: rgba(255, 255, 255, 0.5);
}
</style>
