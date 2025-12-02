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
const editingGame = ref<Game | null>(null);
const BATCH_SIZE = 20;

const handleSave = async (gameData: Partial<Game>) => {
  let success = false;
  
  if (editingGame.value) {
    success = await apiUpdateGame(gameData as Game);
  } else {
    success = await apiCreateGame(gameData);
  }

  if (success) {
    closeModal();
    if (!editingGame.value && searchQuery.value) {
      searchQuery.value = '';
      searchMode.value = 'name';
      fetchGames();
    }
  }
};

//add to force rebuild 3

const handleEditGame = (game: Game) => {
  editingGame.value = game;
  showCreateModal.value = true;
};

const closeModal = () => {
  showCreateModal.value = false;
  editingGame.value = null;
};

const deleteGame = async (id: number) => {
  const success = await apiDeleteGame(id);
  if (success) {
    if (searchMode.value === 'id' && games.value.length === 0) {
      searchQuery.value = '';
      searchMode.value = 'name';
      fetchGames();
    }
  }
};

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

watch(searchMode, () => {
  searchQuery.value = '';
  fetchGames();
});

const displayedGames = computed(() => {
  return games.value.slice(0, displayedCount.value);
});

const loadMore = () => {
  if (displayedCount.value < games.value.length) {
    displayedCount.value += BATCH_SIZE;
  }
};

watch([searchQuery, searchMode], () => {
  displayedCount.value = BATCH_SIZE;
});

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
          @edit="handleEditGame"
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
      :game="editingGame"
      @close="closeModal"
      @save="handleSave"
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
