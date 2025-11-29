<script setup lang="ts">
defineProps<{
  modelValue: string;
  searchMode: 'name' | 'id';
}>();

defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'update:searchMode', value: 'name' | 'id'): void;
}>();
</script>

<template>
  <div class="search-container">
    <div class="search-controls">
      <select 
        :value="searchMode"
        @change="$emit('update:searchMode', ($event.target as HTMLSelectElement).value as 'name' | 'id')"
        class="mode-select"
      >
        <option value="name">Search by Name</option>
        <option value="id">Search by ID</option>
      </select>
      <input
        type="text"
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        :placeholder="searchMode === 'name' ? 'Enter Game Name...' : 'Enter Game ID...'"
        class="search-input"
      />
    </div>
  </div>
</template>

<style scoped>
.search-container {
  margin-bottom: 2rem;
  width: 100%;
}

.search-controls {
  display: flex;
  gap: 1rem;
}

.mode-select {
  padding: 0.75rem 1rem;
  font-size: 1rem;
  background: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  color: inherit;
  cursor: pointer;
  min-width: 150px;
}

.search-input {
  flex: 1;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  background: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  color: inherit;
  transition: border-color 0.2s;
}

.search-input:focus, .mode-select:focus {
  outline: none;
  border-color: #666;
}
</style>
