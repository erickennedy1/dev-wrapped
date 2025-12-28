<script setup>
defineProps({
  userName: String
})
</script>

<template>
  <header class="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-6 px-8 shadow-lg">
    <div class="max-w-6xl mx-auto flex justify-between items-center">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
          <span class="text-2xl">*</span>
        </div>
        <h1 class="text-2xl font-bold">Dev Wrapped</h1>
      </div>

      <div v-if="userName" class="flex items-center gap-3">
        <span class="text-white/80">{{ userName }}</span>
        <div class="w-8 h-8 bg-white/20 rounded-full"></div>
      </div>
    </div>
  </header>
</template>
