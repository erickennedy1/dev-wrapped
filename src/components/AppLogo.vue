<script setup>
defineProps({
  size: {
    type: String,
    default: 'md' // sm, md, lg
  }
})

const sizes = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-20 h-20'
}
</script>

<template>
  <div :class="['relative', sizes[size]]">
    <!-- Fundo circular -->
    <div class="absolute inset-0 bg-gray-900 rounded-full"></div>

    <!-- Gato minimalista e profissional -->
    <svg
      class="absolute inset-0 w-full h-full p-2"
      viewBox="0 0 32 32"
      fill="none"
    >
      <!-- Cabeca do gato - forma geometrica -->
      <path
        d="M6 13 L6 22 Q6 26 10 27 L22 27 Q26 26 26 22 L26 13 L26 8 L22 12 L16 10 L10 12 L6 8 Z"
        fill="white"
      />

      <!-- Orelha esquerda - triangulo -->
      <path
        d="M6 8 L6 14 L10 12 Z"
        fill="white"
      />

      <!-- Orelha direita - triangulo -->
      <path
        d="M26 8 L26 14 L22 12 Z"
        fill="white"
      />

      <!-- Interior orelha esquerda -->
      <path
        d="M7 10 L7 13 L9 12 Z"
        fill="#10b981"
      />

      <!-- Interior orelha direita -->
      <path
        d="M25 10 L25 13 L23 12 Z"
        fill="#10b981"
      />

      <!-- Olho esquerdo -->
      <ellipse cx="11" cy="18" rx="2" ry="2.5" fill="#111827" />
      <circle cx="11.5" cy="17.5" r="0.7" fill="white" />

      <!-- Olho direito -->
      <ellipse cx="21" cy="18" rx="2" ry="2.5" fill="#111827" />
      <circle cx="21.5" cy="17.5" r="0.7" fill="white" />

      <!-- Nariz - triangulo invertido -->
      <path
        d="M14.5 22 L16 24 L17.5 22 Z"
        fill="#111827"
      />

      <!-- Linha do focinho -->
      <path
        d="M16 24 L16 25.5"
        stroke="#111827"
        stroke-width="1"
        stroke-linecap="round"
      />
    </svg>
  </div>
</template>
