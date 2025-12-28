<script setup>
import IconGithub from '@/components/icons/IconGithub.vue'
import IconLinear from '@/components/icons/IconLinear.vue'
import IconGoogle from '@/components/icons/IconGoogle.vue'

defineProps({
  name: String,
  description: String,
  serviceId: String,
  connected: Boolean,
  loading: Boolean
})

defineEmits(['connect', 'disconnect'])

const icons = {
  github: IconGithub,
  linear: IconLinear,
  google: IconGoogle
}
</script>

<template>
  <div class="bg-white border rounded-2xl p-6 transition-all duration-300 flex flex-col items-center text-center"
    :class="connected ? 'border-emerald-300 bg-emerald-50/30' : 'border-gray-100 hover:border-gray-200 hover:shadow-sm'">

    <!-- Icon -->
    <div class="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-4"
      :class="connected ? 'bg-emerald-100' : ''">
      <component
        :is="icons[serviceId]"
        class="w-7 h-7"
        :class="serviceId === 'github' || serviceId === 'linear' ? 'text-gray-900' : (connected ? 'text-emerald-600' : 'text-gray-700')"
      />
    </div>

    <!-- Name -->
    <h3 class="font-semibold text-gray-800 mb-1">{{ name }}</h3>

    <!-- Description -->
    <p class="text-gray-400 text-xs mb-4 leading-relaxed">{{ description }}</p>

    <!-- Button / Status -->
    <div class="mt-auto w-full">
      <button
        v-if="!connected"
        @click="$emit('connect')"
        :disabled="loading"
        class="w-full py-2.5 bg-gray-900 text-white text-sm rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
      >
        {{ loading ? '...' : 'Conectar' }}
      </button>

      <button
        v-else
        @click="$emit('disconnect')"
        class="w-full py-2.5 bg-emerald-100 text-emerald-700 text-sm rounded-xl font-medium hover:bg-emerald-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
      >
        <span class="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
        Conectado
      </button>
    </div>
  </div>
</template>
