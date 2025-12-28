<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: {
    type: Array,
    default: () => Array(12).fill(0)
  },
  title: String
})

const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

const maxValue = computed(() => Math.max(...props.data, 1))
</script>

<template>
  <div class="bg-white border border-gray-100 rounded-xl p-5">
    <h3 v-if="title" class="text-gray-800 font-medium text-sm mb-5">{{ title }}</h3>

    <div class="flex items-end justify-between gap-1.5 h-32">
      <div
        v-for="(value, index) in data"
        :key="index"
        class="flex-1 flex flex-col items-center gap-1.5"
      >
        <div class="w-full flex flex-col items-center justify-end h-24">
          <span class="text-[10px] text-gray-400 mb-1">{{ value || '' }}</span>
          <div
            class="w-full rounded-sm bg-emerald-400 transition-all duration-500"
            :style="{ height: `${(value / maxValue) * 100}%`, minHeight: value > 0 ? '2px' : '0' }"
          ></div>
        </div>
        <span class="text-[10px] text-gray-400">{{ months[index] }}</span>
      </div>
    </div>
  </div>
</template>
