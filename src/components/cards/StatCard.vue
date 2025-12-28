<script setup>
defineProps({
  title: String,
  value: [String, Number],
  subtitle: String,
  icon: String
})
</script>

<template>
  <div class="bg-white border border-gray-100 rounded-xl p-5 hover:border-emerald-200 transition-colors duration-300">
    <div class="flex items-start justify-between">
      <div>
        <p class="text-gray-400 text-xs font-medium uppercase tracking-wider">{{ title }}</p>
        <p class="text-3xl font-semibold text-gray-800 mt-1">{{ value }}</p>
        <p v-if="subtitle" class="text-gray-400 text-xs mt-1">{{ subtitle }}</p>
      </div>
      <div class="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 text-sm font-medium">
        {{ icon }}
      </div>
    </div>
  </div>
</template>
