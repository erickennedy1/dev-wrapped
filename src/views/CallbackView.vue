<script setup>
/**
 * Esta pagina nao e mais usada.
 * O OAuth agora e tratado pelo backend que redireciona direto para a home.
 * Mantida apenas para compatibilidade com rotas antigas.
 */
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(() => {
  // Redireciona para home
  router.push('/')
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center">
    <div class="text-center">
      <div class="inline-block w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
      <p class="text-gray-600">Conectando sua conta...</p>
    </div>
  </div>
</template>
