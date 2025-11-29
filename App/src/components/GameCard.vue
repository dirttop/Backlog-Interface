<script setup lang="ts">
import { computed, ref } from 'vue';
import type { Game } from '../types';

const props = defineProps<{
  game: Game;
}>();

const emit = defineEmits<{
  (e: 'delete', id: number): void;
  (e: 'update', game: Game): void;
}>();

const isExpanded = ref(false);

const status = computed(() => {
  if (props.game.Completed) return 'Completed';
  if (props.game.Dropped) return 'Dropped';
  return 'Backlog';
});

const handleStatusUpdate = (type: 'completed' | 'dropped' | 'backlog') => {
  const updatedGame = { ...props.game };
  
  if (type === 'completed') {
    updatedGame.Completed = true;
    updatedGame.Dropped = false;
  } else if (type === 'dropped') {
    updatedGame.Dropped = true;
    updatedGame.Completed = false;
  } else if (type === 'backlog') {
    updatedGame.Completed = false;
    updatedGame.Dropped = false;
  }
  
  emit('update', updatedGame);
};

const formattedCompletedDate = computed(() => {
  if (props.game.Completed && props.game.CompletedOn) {
    return new Date(props.game.CompletedOn).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
  return null;
});

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
};
</script>

<template>
  <div class="game-card" :class="{ expanded: isExpanded, completed: status === 'Completed', dropped: status === 'Dropped' }" @click="toggleExpand">
    <div class="card-header">
      <div class="game-info">
        <h3>{{ game.Title }}</h3>
        <div class="meta">
          <p class="platform" v-if="game.Genre">{{ game.Genre }}</p>
          <span class="separator" v-if="game.Genre && game.PlaytimeHours">•</span>
          <p class="playtime" v-if="game.PlaytimeHours">{{ game.PlaytimeHours }}h</p>
        </div>
      </div>
      <div class="game-status">
        <span v-if="formattedCompletedDate" class="completed-date">{{ formattedCompletedDate }}</span>
        <span v-if="status === 'Completed'" class="status-icon completed" title="Completed">✓</span>
        <span v-else-if="status === 'Dropped'" class="status-icon dropped" title="Dropped">✕</span>
        <span v-else class="status-text">{{ status }}</span>
      </div>
    </div>
    
    <transition name="expand">
      <div class="card-details" v-if="isExpanded">
        <div class="detail-row" v-if="game.Rating">
          <span class="label">Rating:</span>
          <span class="value">{{ game.Rating }}/5</span>
        </div>
        <div class="detail-row review" v-if="game.Review">
          <span class="label">Review:</span>
          <p class="value">{{ game.Review }}</p>
        </div>
        <div class="detail-row" v-if="!game.Rating && !game.Review">
          <span class="value empty">No details available</span>
        </div>
        
        <div class="actions">
          <button class="action-btn complete-btn" v-if="!game.Completed" @click.stop="handleStatusUpdate('completed')">Complete</button>
          <button class="action-btn drop-btn" v-if="!game.Dropped" @click.stop="handleStatusUpdate('dropped')">Drop</button>
          <button class="action-btn backlog-btn" v-if="game.Completed || game.Dropped" @click.stop="handleStatusUpdate('backlog')">Backlog</button>
          <button class="action-btn delete-btn" @click.stop="$emit('delete', game.SteamAppId)">Delete</button>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.game-card {
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 0.5rem;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
}

.actions {
  margin-top: 1rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.action-btn {
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.complete-btn {
  background-color: #4CAF50;
}

.complete-btn:hover {
  background-color: #45a049;
}

.drop-btn {
  background-color: #FF9800; /* Orange for drop action to distinguish from delete */
}

.drop-btn:hover {
  background-color: #f57c00;
}

.backlog-btn {
  background-color: #2196F3; /* Blue for backlog */
}

.backlog-btn:hover {
  background-color: #1976D2;
}

.delete-btn {
  background-color: #ff5252;
}

.delete-btn:hover {
  background-color: #d32f2f;
}


/* Status Colors */
.game-card.completed {
  background-color: #C8E6C9;
  border-color: #A5D6A7;
  color: #1a1a1a;
}

.game-card.dropped {
  background-color: #FFCDD2;
  border-color: #EF9A9A;
}


.game-card:hover {
  background-color: #f9f9f9;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.game-card.completed:hover {
  background-color: #A5D6A7;
}

.game-card.dropped:hover {
  background-color: #EF9A9A;
}


.game-card.expanded {
  background-color: #f0f0f0;
}

.game-card.completed.expanded {
  background-color: #A5D6A7;
}

.game-card.dropped.expanded {
  background-color: #EF9A9A;
}


.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.game-info h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1.1rem;
  color: inherit;
}

.meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
  font-size: 0.85rem;
}

.game-card.completed .meta,
.game-card.dropped .meta {
  color: #333;
}


.platform, .playtime {
  margin: 0;
}

.separator {
  opacity: 0.5;
}

.game-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.completed-date {
  font-size: 0.85rem;
  color: #555;
  font-weight: 500;
}

.game-card.completed .completed-date {
  color: #333;
}

.status-icon {
  font-size: 1.2rem;
  font-weight: bold;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-icon.completed {
  color: green;
}

.status-icon.dropped {
  color: #d32f2f;
}

.status-text {
  font-size: 0.85rem;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  background: #eee;
  color: #333;
}


.card-details {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
  overflow: hidden;
}

.game-card.completed .card-details,
.game-card.dropped .card-details {
  border-top-color: rgba(0, 0, 0, 0.1);
}


/* Expand Transition */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease-in-out;
  max-height: 500px;
  opacity: 1;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
  margin-top: 0;
  padding-top: 0;
  border-top-color: transparent;
}


.detail-row {
  margin-bottom: 0.5rem;
}

.detail-row:last-child {
  margin-bottom: 0;
}

.label {
  display: inline-block;
  font-weight: bold;
  font-size: 0.85rem;
  color: #555;
  margin-right: 0.5rem;
}

.game-card.completed .label,
.game-card.dropped .label {
  color: #333;
}


.value {
  color: inherit;
  font-size: 0.95rem;
}

.value.empty {
  color: #999;
  font-style: italic;
}

.game-card.completed .value.empty,
.game-card.dropped .value.empty {
  color: #555;
}

.review .value {
  display: block;
  margin-top: 0.25rem;
}
</style>
