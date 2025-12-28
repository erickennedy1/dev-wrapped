<script setup>
import { ref } from 'vue'

const props = defineProps({
  show: Boolean,
  service: String,
  instructions: String,
  instructionUrl: String
})

const emit = defineEmits(['close', 'submit'])

const token = ref('')
const loading = ref(false)
const error = ref('')

const handleSubmit = async () => {
  if (!token.value.trim()) {
    error.value = 'Por favor, insira o token'
    return
  }

  loading.value = true
  error.value = ''

  emit('submit', token.value.trim())
}

const handleClose = () => {
  token.value = ''
  error.value = ''
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-gray-900/20 backdrop-blur-sm" @click="handleClose"></div>

      <!-- Modal -->
      <div class="relative bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 z-10 border border-gray-100">
        <button
          @click="handleClose"
          class="absolute top-4 right-4 text-gray-300 hover:text-gray-500 transition-colors cursor-pointer"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 class="text-xl font-semibold text-gray-800 mb-1">Conectar {{ service }}</h2>
        <p class="text-gray-400 text-sm mb-5">Siga as instrucoes abaixo para obter seu token</p>

        <div class="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-5">
          <p class="text-gray-600 text-sm whitespace-pre-line leading-relaxed">{{ instructions }}</p>
          <a
            :href="instructionUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 font-medium text-sm mt-3"
          >
            Abrir pagina
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-600 mb-2">
            Token de acesso
          </label>
          <input
            v-model="token"
            type="password"
            placeholder="Cole seu token aqui..."
            class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-100 focus:border-emerald-400 outline-none transition-all text-sm"
            @keyup.enter="handleSubmit"
          />
          <p v-if="error" class="text-red-500 text-xs mt-1.5">{{ error }}</p>
        </div>

        <p class="text-gray-400 text-xs mb-5">
          Seu token fica salvo apenas no seu navegador.
        </p>

        <div class="flex gap-3">
          <button
            @click="handleClose"
            class="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            @click="handleSubmit"
            :disabled="loading"
            class="flex-1 px-4 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            {{ loading ? 'Validando...' : 'Conectar' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
