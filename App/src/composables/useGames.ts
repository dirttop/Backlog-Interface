import { ref } from 'vue';
import { API_BASE_URL } from '../config';
import type { Game } from '../types';

export function useGames() {
  const games = ref<Game[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Fetch games from API (optionally by title)
  const fetchGames = async (title?: string) => {
    loading.value = true;
    error.value = null;
    try {
      let url = API_BASE_URL;
      if (title) {
        url += `/${encodeURIComponent(title)}`;
      }
      
      const response = await fetch(url);
      
      if (response.status === 404) {
        games.value = [];
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch games');
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('API returned non-JSON response:', text);
        throw new Error('API returned non-JSON response');
      }

      const data = await response.json();
      
      // If searching by title, the API returns a single object, but we want an array
      if (title && !Array.isArray(data)) {
        games.value = [data];
      } else {
        games.value = Array.isArray(data) ? data : (data.games || []);
      }
    } catch (e) {
      console.error(e);
      error.value = 'Failed to load games. Please try again later.';
    } finally {
      loading.value = false;
    }
  };

  // Fetch single game by ID
  const fetchGameById = async (id: string) => {
    if (!id) {
      fetchGames();
      return;
    }
    
    loading.value = true;
    error.value = null;
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`);
      
      if (response.status === 404) {
        games.value = [];
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch game');
      }
      
      const data = await response.json();
      games.value = [data];
    } catch (e) {
      console.error(e);
      error.value = 'Failed to find game with that ID.';
      games.value = [];
    } finally {
      loading.value = false;
    }
  };

  // Create game handler
  const createGame = async (newGame: Partial<Game>) => {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newGame),
      });

      if (!response.ok) {
        throw new Error('Failed to create game');
      }

      const createdGame = await response.json();
      
      // Add to local state
      games.value.unshift(createdGame);
      return true; // Success
    } catch (e) {
      console.error(e);
      alert('Failed to create game. Please check your input and try again.');
      return false; // Failure
    }
  };

  // Delete game handler
  const deleteGame = async (id: number) => {
    if (!confirm('Are you sure you want to delete this game?')) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete game');
      }

      // Remove from local state
      games.value = games.value.filter(g => g.SteamAppId !== id);
      return true;
    } catch (e) {
      console.error(e);
      alert('Failed to delete game. Please try again.');
      return false;
    }
  };

  // Update game handler
  const updateGame = async (updatedGame: Game) => {
    try {
      // Remove ValidatedOn as requested
      const { ValidatedOn, ...gameData } = updatedGame;

      const response = await fetch(`${API_BASE_URL}/${updatedGame.SteamAppId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gameData),
      });

      if (!response.ok) {
        throw new Error('Failed to update game');
      }

      // Update local state
      const index = games.value.findIndex(g => g.SteamAppId === updatedGame.SteamAppId);
      if (index !== -1) {
        try {
          const responseData = await response.json();
          games.value[index] = responseData;
        } catch (e) {
          // If no JSON returned, just use our local update
          games.value[index] = updatedGame;
        }
      }
      return true;
    } catch (e) {
      console.error(e);
      alert('Failed to update game status. Please try again.');
      return false;
    }
  };

  return {
    games,
    loading,
    error,
    fetchGames,
    fetchGameById,
    createGame,
    deleteGame,
    updateGame
  };
}
