<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import ServiceCard from '@/components/cards/ServiceCard.vue'
import TokenModal from '@/components/TokenModal.vue'
import AppLogo from '@/components/AppLogo.vue'
import { githubService, linearService, googleService } from '@/services'

const router = useRouter()

// URL do backend (mude para producao depois)
const BACKEND_URL = 'http://localhost:3001'

const services = ref([
  {
    id: 'github',
    name: 'GitHub',
    description: 'Commits, PRs e issues do ano',
    connected: false,
    loading: false,
    useOAuth: false,
    instructions: '1. Clique no link abaixo para criar um token\n2. Marque as opcoes "repo" e "read:user"\n3. Clique em "Generate token"\n4. Copie o token e cole aqui',
    instructionUrl: 'https://github.com/settings/tokens/new?description=Dev%20Wrapped&scopes=repo,read:user'
  },
  {
    id: 'linear',
    name: 'Linear',
    description: 'Issues criadas e completadas',
    connected: false,
    loading: false,
    useOAuth: false,
    instructions: '1. Clique no link abaixo\n2. Em "Personal API keys", clique em "Create key"\n3. De um nome (ex: Dev Wrapped)\n4. Copie a chave e cole aqui',
    instructionUrl: 'https://linear.app/settings/api'
  },
  {
    id: 'google',
    name: 'Google',
    description: 'Emails enviados e eventos',
    connected: false,
    loading: false,
    useOAuth: true
  }
])

const showModal = ref(false)
const currentService = ref(null)

onMounted(async () => {
  // Verifica se voltou do OAuth com um token na URL
  const urlParams = new URLSearchParams(window.location.search)

  // Token do Google veio na URL?
  const googleToken = urlParams.get('google_token')
  if (googleToken) {
    const googleRefresh = urlParams.get('google_refresh')
    const googleExpires = urlParams.get('google_expires') || '3600'
    googleService.setTokens(googleToken, googleRefresh, parseInt(googleExpires))
    // Limpa a URL
    window.history.replaceState({}, '', window.location.pathname)
  }

  
  // Erro no OAuth?
  const error = urlParams.get('error')
  if (error) {
    alert('Erro ao conectar: ' + error)
    window.history.replaceState({}, '', window.location.pathname)
  }

  // Atualiza o estado dos servicos conectados
  if (githubService.isConnected()) {
    const github = services.value.find(s => s.id === 'github')
    if (github) github.connected = true
  }
  if (linearService.isConnected()) {
    const linear = services.value.find(s => s.id === 'linear')
    if (linear) linear.connected = true
  }
  if (googleService.isConnected()) {
    const google = services.value.find(s => s.id === 'google')
    if (google) google.connected = true
  }
})

const connectService = async (serviceId) => {
  const service = services.value.find(s => s.id === serviceId)
  if (!service) return

  // Se o servico usa OAuth, redireciona para o backend
  if (service.useOAuth) {
    service.loading = true
    try {
      const response = await fetch(`${BACKEND_URL}/auth/${serviceId}`)
      const data = await response.json()

      if (data.url) {
        // Redireciona para Google/Slack
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Error starting OAuth:', error)
      alert('Erro ao conectar. Verifique se o backend esta rodando (npm run server)')
      service.loading = false
    }
    return
  }

  // Se nao usa OAuth (GitHub), abre o modal de token
  currentService.value = service
  showModal.value = true
}

const handleTokenSubmit = async (token) => {
  if (!currentService.value) return

  currentService.value.loading = true
  const serviceId = currentService.value.id

  try {
    let isValid = false

    if (serviceId === 'github') {
      isValid = await githubService.validateToken(token)
      if (isValid) githubService.setAccessToken(token)
    } else if (serviceId === 'linear') {
      isValid = await linearService.validateToken(token)
      if (isValid) linearService.setAccessToken(token)
    }

    if (isValid) {
      currentService.value.connected = true
      showModal.value = false
    } else {
      alert('Token invalido. Verifique se o token tem as permissoes corretas.')
    }
  } catch (error) {
    console.error('Error validating token:', error)
    alert('Erro ao validar token. Tente novamente.')
  } finally {
    currentService.value.loading = false
  }
}

const disconnectService = (serviceId) => {
  const service = services.value.find(s => s.id === serviceId)
  if (!service) return

  if (serviceId === 'github') {
    githubService.clearToken()
  } else if (serviceId === 'linear') {
    linearService.clearToken()
  } else if (serviceId === 'google') {
    googleService.clearToken()
  }

  service.connected = false
}

const connectedServices = computed(() =>
  services.value.filter(s => s.connected)
)

const canGenerateReport = computed(() => connectedServices.value.length > 0)

const generateReport = () => {
  if (canGenerateReport.value) {
    router.push('/retrospective')
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-2xl mx-auto px-6 py-16">
      <!-- Header -->
      <div class="text-center mb-12">
        <AppLogo size="xl" class="mx-auto mb-5" />
        <h1 class="text-2xl font-semibold text-gray-800 tracking-tight">devwrapped</h1>
        <p class="text-gray-400 text-sm mt-1">
          Sua retrospectiva de desenvolvedor
        </p>
      </div>

      <!-- Services Grid -->
      <div class="grid grid-cols-3 gap-3 mb-8">
        <ServiceCard
          v-for="service in services"
          :key="service.id"
          :name="service.name"
          :description="service.description"
          :service-id="service.id"
          :connected="service.connected"
          :loading="service.loading"
          @connect="connectService(service.id)"
          @disconnect="disconnectService(service.id)"
        />
      </div>

      <!-- Generate Button -->
      <button
        @click="generateReport"
        :disabled="!canGenerateReport"
        class="w-full py-3.5 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Gerar Retrospectiva
      </button>

      <p class="text-center text-gray-300 text-xs mt-4">
        Conecte pelo menos um servico
      </p>

    </div>

    <!-- Token Modal -->
    <TokenModal
      :show="showModal"
      :service="currentService?.name"
      :instructions="currentService?.instructions"
      :instruction-url="currentService?.instructionUrl"
      @close="showModal = false"
      @submit="handleTokenSubmit"
    />
  </div>
</template>
