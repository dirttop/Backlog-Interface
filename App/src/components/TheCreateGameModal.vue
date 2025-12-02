<script setup lang="ts">
import { reactive } from 'vue';
import type { Game } from '../types';

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save', game: Partial<Game>): void;
}>();

const props = defineProps<{
  game?: Game | null;
}>();

const form = reactive({
  SteamAppId: '',
  Title: '',
  Genre: '',
  Developer: '',
  ReleaseYear: '',
  Completed: false,
  Dropped: false,
  CompletedOn: '',
  PlaytimeHours: '',
  Rating: '',
  Review: ''
});

if (props.game) {
  form.SteamAppId = props.game.SteamAppId.toString();
  form.Title = props.game.Title;
  form.Genre = props.game.Genre || '';
  form.Developer = props.game.Developer || '';
  form.ReleaseYear = props.game.ReleaseYear?.toString() || '';
  form.Completed = props.game.Completed;
  form.Dropped = props.game.Dropped;
  form.CompletedOn = props.game.CompletedOn ? (props.game.CompletedOn.split('T')[0] || '') : '';
  form.PlaytimeHours = props.game.PlaytimeHours?.toString() || '';
  form.Rating = props.game.Rating?.toString() || '';
  form.Review = props.game.Review || '';
}

const handleSubmit = () => {
  const newGame: any = {
    SteamAppId: Number(form.SteamAppId),
    Title: form.Title,
    Genre: form.Genre,
    Completed: form.Completed,
    Dropped: form.Dropped
  };

  if (form.Completed && form.CompletedOn) {
    newGame.CompletedOn = new Date(form.CompletedOn).toISOString();
  } else {
    newGame.CompletedOn = null;
  }

  if (form.Developer) newGame.Developer = form.Developer;
  if (form.ReleaseYear) newGame.ReleaseYear = Number(form.ReleaseYear);
  if (form.PlaytimeHours) newGame.PlaytimeHours = Number(form.PlaytimeHours);
  if (form.Rating) newGame.Rating = Number(form.Rating);
  if (form.Review) newGame.Review = form.Review;

  emit('save', newGame);
};
</script>

<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <h2>{{ game ? 'Edit Game' : 'Add New Game' }}</h2>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="steamAppId">Steam App ID *</label>
          <input 
            id="steamAppId" 
            v-model="form.SteamAppId" 
            type="number" 
            required 
            placeholder="e.g. 892970" 
            :disabled="!!game"
            :class="{ disabled: !!game }"
          />
        </div>

        <div class="form-group">
          <label for="title">Title *</label>
          <input id="title" v-model="form.Title" type="text" required placeholder="e.g. Valheim" />
        </div>

        <div class="form-group">
          <label for="genre">Genre *</label>
          <input id="genre" v-model="form.Genre" type="text" required placeholder="e.g. Survival" />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="developer">Developer</label>
            <input id="developer" v-model="form.Developer" type="text" />
          </div>

          <div class="form-group">
            <label for="releaseYear">Release Year</label>
            <input id="releaseYear" v-model="form.ReleaseYear" type="number" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="playtime">Playtime (Hours)</label>
            <input id="playtime" v-model="form.PlaytimeHours" type="number" step="0.1" />
          </div>

          <div class="form-group">
            <label for="rating">Rating (0-5)</label>
            <input id="rating" v-model="form.Rating" type="number" step="0.1" min="0" max="5" />
          </div>
        </div>

        <div class="form-group checkbox-group">
          <label>
            <input type="checkbox" v-model="form.Completed" />
            Completed
          </label>
          <label>
            <input type="checkbox" v-model="form.Dropped" />
            Dropped
          </label>
        </div>

        <div class="form-group" v-if="form.Completed">
          <label for="completedOn">Completed On</label>
          <input id="completedOn" v-model="form.CompletedOn" type="date" />
        </div>

        <div class="form-group">
          <label for="review">Review</label>
          <textarea id="review" v-model="form.Review" rows="3"></textarea>
        </div>

        <div class="modal-actions">
          <button type="button" class="cancel-btn" @click="$emit('close')">Cancel</button>
          <button type="submit" class="submit-btn">{{ game ? 'Save Changes' : 'Add Game' }}</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #333;
}

.form-group {
  margin-bottom: 1rem;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.form-row .form-group {
  flex: 1;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #555;
}

input[type="text"],
input[type="number"],
textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

input.disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
  color: #888;
}

input:focus,
textarea:focus {
  outline: none;
  border-color: #666;
}

.checkbox-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

button {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  border: none;
}

.cancel-btn {
  background: #eee;
  color: #333;
}

.cancel-btn:hover {
  background: #ddd;
}

.submit-btn {
  background: #333;
  color: white;
}

.submit-btn:hover {
  background: #555;
}
</style>
