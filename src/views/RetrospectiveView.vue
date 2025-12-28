<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import StatCard from '@/components/cards/StatCard.vue'
import MonthlyChart from '@/components/charts/MonthlyChart.vue'
import AppLogo from '@/components/AppLogo.vue'
import IconGithub from '@/components/icons/IconGithub.vue'
import IconLinear from '@/components/icons/IconLinear.vue'
import IconMail from '@/components/icons/IconMail.vue'
import IconCalendar from '@/components/icons/IconCalendar.vue'
import { githubService, linearService, googleService } from '@/services'

const router = useRouter()
const year = new Date().getFullYear()
const loading = ref(true)
const error = ref('')
const activeTab = ref('summary')

const githubUser = ref(null)
const githubStats = ref({
  commits: 0,
  pullRequests: 0,
  issues: 0,
  repositories: 0,
  commitsByMonth: Array(12).fill(0),
  topRepositories: []
})

const linearUser = ref(null)
const linearStats = ref({
  issuesCreated: 0,
  issuesCompleted: 0,
  createdByMonth: Array(12).fill(0),
  completedByMonth: Array(12).fill(0),
  topProjects: [],
  averagePerWeek: 0
})

const googleUser = ref(null)
const emailStats = ref({
  sent: 0,
  received: 0,
  sentByMonth: Array(12).fill(0),
  receivedByMonth: Array(12).fill(0),
  averageSentPerDay: 0,
  averageReceivedPerDay: 0
})

const calendarStats = ref({
  meetings: 0,
  totalEvents: 0,
  hours: 0,
  byMonth: Array(12).fill(0),
  averageMeetingsPerWeek: 0,
  averageDurationMinutes: 0,
  busiestDay: null
})

const loadingMessage = ref('Carregando...')

const availableTabs = computed(() => {
  const tabs = []
  if (githubService.isConnected()) tabs.push({ id: 'github', name: 'GitHub', icon: 'github' })
  if (linearService.isConnected()) tabs.push({ id: 'linear', name: 'Linear', icon: 'linear' })
  if (googleService.isConnected()) tabs.push({ id: 'gmail', name: 'Gmail', icon: 'mail' })
  if (googleService.isConnected()) tabs.push({ id: 'calendar', name: 'Calendar', icon: 'calendar' })
  tabs.push({ id: 'summary', name: 'Resumo', icon: 'summary' })
  return tabs
})

onMounted(async () => {
  if (!githubService.isConnected() && !linearService.isConnected() && !googleService.isConnected()) {
    router.push('/')
    return
  }

  try {
    if (githubService.isConnected()) {
      loadingMessage.value = 'Buscando dados do GitHub...'
      const stats = await githubService.getYearStats(year)
      githubUser.value = stats.user
      githubStats.value = {
        commits: stats.commits,
        pullRequests: stats.pullRequests,
        issues: stats.issues,
        repositories: stats.repositories,
        commitsByMonth: stats.commitsByMonth,
        topRepositories: stats.topRepositories
      }
    }

    if (linearService.isConnected()) {
      loadingMessage.value = 'Buscando dados do Linear...'
      const stats = await linearService.getYearStats(year)
      linearUser.value = stats.user
      linearStats.value = {
        issuesCreated: stats.issuesCreated,
        issuesCompleted: stats.issuesCompleted,
        createdByMonth: stats.createdByMonth,
        completedByMonth: stats.completedByMonth,
        topProjects: stats.topProjects,
        averagePerWeek: stats.averagePerWeek
      }
    }

    if (googleService.isConnected()) {
      loadingMessage.value = 'Buscando dados do Google...'
      const stats = await googleService.getYearStats(year)
      googleUser.value = stats.user
      emailStats.value = {
        sent: stats.email.totalSent,
        received: stats.email.totalReceived,
        sentByMonth: stats.email.sentByMonth,
        receivedByMonth: stats.email.receivedByMonth,
        averageSentPerDay: stats.email.averageSentPerDay,
        averageReceivedPerDay: stats.email.averageReceivedPerDay
      }
      calendarStats.value = {
        meetings: stats.calendar.totalMeetings,
        totalEvents: stats.calendar.totalEvents,
        hours: stats.calendar.totalDurationHours,
        byMonth: stats.calendar.meetingsByMonth,
        averageMeetingsPerWeek: stats.calendar.averageMeetingsPerWeek,
        averageDurationMinutes: stats.calendar.averageDurationMinutes,
        busiestDay: stats.calendar.busiestDay
      }
    }

    // Define a primeira aba disponível como ativa
    if (availableTabs.value.length > 0) {
      activeTab.value = availableTabs.value[0].id
    }
  } catch (e) {
    console.error('Error loading stats:', e)
    error.value = 'Erro ao carregar dados.'
  } finally {
    loading.value = false
  }
})

const monthNames = [
  'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

const totalContributions = () =>
  githubStats.value.commits +
  githubStats.value.pullRequests +
  githubStats.value.issues

const getMostProductiveMonth = () => {
  const monthTotals = monthNames.map((_, index) => {
    let total = 0
    if (githubService.isConnected()) {
      total += githubStats.value.commitsByMonth[index] || 0
    }
    if (googleService.isConnected()) {
      total += calendarStats.value.byMonth[index] || 0
      total += emailStats.value.sentByMonth[index] || 0
    }
    return total
  })

  const maxIndex = monthTotals.indexOf(Math.max(...monthTotals))
  return monthNames[maxIndex]
}

const getDailyAverage = () => {
  let total = 0
  if (githubService.isConnected()) {
    total += githubStats.value.commits
  }
  if (googleService.isConnected()) {
    total += calendarStats.value.meetings
    total += emailStats.value.sent
  }
  return Math.round(total / 365)
}

const goBack = () => {
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white border-b border-gray-100">
      <div class="w-full px-6 py-5 relative">
        <button
          @click="goBack"
          class="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div class="flex items-center justify-center gap-3">
          <AppLogo size="sm" />
          <span class="font-medium text-gray-800">devwrapped</span>
        </div>
      </div>
    </header>

    <main class="w-full px-6 py-8">
      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-20">
        <!-- Gato animado -->
        <div class="relative mb-8">
          <div class="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center animate-pulse-slow">
            <svg class="w-14 h-14" viewBox="0 0 32 32" fill="none">
              <!-- Cabeca do gato -->
              <path
                d="M6 13 L6 22 Q6 26 10 27 L22 27 Q26 26 26 22 L26 13 L26 8 L22 12 L16 10 L10 12 L6 8 Z"
                fill="white"
                class="animate-float"
              />
              <!-- Orelhas -->
              <path d="M6 8 L6 14 L10 12 Z" fill="white" />
              <path d="M26 8 L26 14 L22 12 Z" fill="white" />
              <path d="M7 10 L7 13 L9 12 Z" fill="#10b981" />
              <path d="M25 10 L25 13 L23 12 Z" fill="#10b981" />
              <!-- Olhos piscando -->
              <ellipse cx="11" cy="18" rx="2" ry="2.5" fill="#111827" class="animate-blink" />
              <ellipse cx="21" cy="18" rx="2" ry="2.5" fill="#111827" class="animate-blink" />
              <circle cx="11.5" cy="17.5" r="0.7" fill="white" />
              <circle cx="21.5" cy="17.5" r="0.7" fill="white" />
              <!-- Nariz -->
              <path d="M14.5 22 L16 24 L17.5 22 Z" fill="#111827" />
            </svg>
          </div>

          <!-- Particulas ao redor -->
          <div class="absolute -top-2 -left-2 w-3 h-3 bg-emerald-400 rounded-full animate-orbit-1"></div>
          <div class="absolute -top-1 -right-3 w-2 h-2 bg-blue-400 rounded-full animate-orbit-2"></div>
          <div class="absolute -bottom-2 -left-1 w-2 h-2 bg-purple-400 rounded-full animate-orbit-3"></div>
        </div>

        <!-- Texto -->
        <div class="text-center mb-6">
          <p class="text-gray-700 font-medium">{{ loadingMessage }}</p>
        </div>

        <!-- Barra de progresso estilizada -->
        <div class="w-48 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div class="h-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-400 rounded-full animate-progress"></div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-24">
        <p class="text-gray-500 text-sm">{{ error }}</p>
        <button
          @click="goBack"
          class="mt-4 text-emerald-600 text-sm font-medium hover:text-emerald-700 cursor-pointer"
        >
          Voltar
        </button>
      </div>

      <!-- Content -->
      <template v-else>
        <!-- Title -->
        <div class="mb-6">
          <h1 class="text-xl font-semibold text-gray-800">{{ year }}</h1>
          <p class="text-gray-400 text-sm">Seu ano em numeros</p>
        </div>

        <!-- Tab Navigation -->
        <div class="flex flex-wrap gap-2 mb-8">
          <button
            v-for="tab in availableTabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
            :class="activeTab === tab.id
              ? 'bg-emerald-500 text-white'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'"
          >
            <IconGithub v-if="tab.icon === 'github'" :class="['w-4 h-4', activeTab !== tab.id && 'text-gray-900']" />
            <IconLinear v-if="tab.icon === 'linear'" :class="['w-4 h-4', activeTab !== tab.id && 'text-gray-900']" />
            <IconMail v-if="tab.icon === 'mail'" class="w-4 h-4" />
            <IconCalendar v-if="tab.icon === 'calendar'" class="w-4 h-4" />
            <svg v-if="tab.icon === 'summary'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            {{ tab.name }}
          </button>
        </div>

        <!-- GitHub Section -->
        <section v-if="activeTab === 'github'" class="animate-fade-in">
          <div class="flex items-center gap-2.5 mb-4">
            <IconGithub class="w-4 h-4 text-gray-900" />
            <h2 class="text-sm font-medium text-gray-700">GitHub</h2>
            <span v-if="githubUser" class="text-xs text-gray-400">@{{ githubUser.login }}</span>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <StatCard title="Commits" :value="githubStats.commits" icon="C" />
            <StatCard title="Pull Requests" :value="githubStats.pullRequests" icon="PR" />
            <StatCard title="Issues" :value="githubStats.issues" icon="I" />
            <StatCard title="Repos" :value="githubStats.repositories" icon="R" />
          </div>

          <MonthlyChart :data="githubStats.commitsByMonth" title="Commits" />

          <div v-if="githubStats.topRepositories.length > 0" class="mt-4 bg-white border border-gray-100 rounded-xl p-4">
            <h3 class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Top Repositorios</h3>
            <div class="space-y-2">
              <div
                v-for="(repo, index) in githubStats.topRepositories"
                :key="repo.name"
                class="flex items-center justify-between py-1.5"
              >
                <div class="flex items-center gap-2.5">
                  <span class="text-xs text-gray-400 w-4">{{ index + 1 }}</span>
                  <span class="text-sm text-gray-700">{{ repo.name }}</span>
                  <span v-if="repo.language" class="text-xs text-gray-400">{{ repo.language }}</span>
                </div>
                <span class="text-sm font-medium text-emerald-600">{{ repo.commits }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Linear Section -->
        <section v-if="activeTab === 'linear'" class="animate-fade-in">
          <div class="flex items-center gap-2.5 mb-4">
            <IconLinear class="w-4 h-4 text-gray-900" />
            <h2 class="text-sm font-medium text-gray-700">Linear</h2>
            <span v-if="linearUser" class="text-xs text-gray-400">{{ linearUser.email }}</span>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            <StatCard title="Issues Criadas" :value="linearStats.issuesCreated" icon="+" />
            <StatCard title="Issues Completadas" :value="linearStats.issuesCompleted" icon="✓" />
            <StatCard title="Media/Semana" :value="linearStats.averagePerWeek" icon="~" />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <MonthlyChart :data="linearStats.createdByMonth" title="Criadas" />
            <MonthlyChart :data="linearStats.completedByMonth" title="Completadas" />
          </div>

          <div v-if="linearStats.topProjects.length > 0" class="mt-4 bg-white border border-gray-100 rounded-xl p-4">
            <h3 class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Top Projetos</h3>
            <div class="space-y-2">
              <div
                v-for="(project, index) in linearStats.topProjects"
                :key="project.name"
                class="flex items-center justify-between py-1.5"
              >
                <div class="flex items-center gap-2.5">
                  <span class="text-xs text-gray-400 w-4">{{ index + 1 }}</span>
                  <span class="text-sm text-gray-700">{{ project.name }}</span>
                </div>
                <span class="text-sm font-medium text-emerald-600">{{ project.completed }} issues</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Gmail Section -->
        <section v-if="activeTab === 'gmail'" class="animate-fade-in">
          <div class="flex items-center gap-2.5 mb-4">
            <IconMail class="w-4 h-4 text-gray-600" />
            <h2 class="text-sm font-medium text-gray-700">Gmail</h2>
            <span v-if="googleUser" class="text-xs text-gray-400">{{ googleUser.email }}</span>
          </div>

          <div class="grid grid-cols-2 gap-3 mb-4">
            <StatCard title="Enviados" :value="emailStats.sent" :subtitle="`${emailStats.averageSentPerDay}/dia`" icon="E" />
            <StatCard title="Recebidos" :value="emailStats.received" :subtitle="`${emailStats.averageReceivedPerDay}/dia`" icon="R" />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <MonthlyChart :data="emailStats.sentByMonth" title="Enviados" />
            <MonthlyChart :data="emailStats.receivedByMonth" title="Recebidos" />
          </div>
        </section>

        <!-- Calendar Section -->
        <section v-if="activeTab === 'calendar'" class="animate-fade-in">
          <div class="flex items-center gap-2.5 mb-4">
            <IconCalendar class="w-4 h-4 text-gray-600" />
            <h2 class="text-sm font-medium text-gray-700">Calendar</h2>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <StatCard title="Reunioes" :value="calendarStats.meetings" icon="R" />
            <StatCard title="Horas" :value="`${calendarStats.hours}h`" icon="H" />
            <StatCard title="Media" :value="`${calendarStats.averageDurationMinutes}min`" icon="M" />
            <StatCard title="Eventos" :value="calendarStats.totalEvents" icon="E" />
          </div>

          <MonthlyChart :data="calendarStats.byMonth" title="Reunioes" />

          <div v-if="calendarStats.busiestDay" class="mt-4 bg-white border border-gray-100 rounded-xl p-4">
            <p class="text-xs text-gray-400 mb-1">Dia mais ocupado</p>
            <p class="text-sm text-gray-700">
              <span class="font-medium capitalize">{{ calendarStats.busiestDay.day }}</span>
              <span class="text-gray-400"> · {{ calendarStats.busiestDay.count }} reunioes</span>
            </p>
          </div>
        </section>

        <!-- Summary Section -->
        <section v-if="activeTab === 'summary'" class="animate-fade-in">
          <!-- Numeros principais -->
          <div class="bg-white border border-gray-100 rounded-xl p-6 mb-6">
            <h2 class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-5">Resumo Geral</h2>

            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              <div v-if="githubService.isConnected()" class="text-center">
                <p class="text-2xl font-semibold text-gray-800">{{ totalContributions() }}</p>
                <p class="text-xs text-gray-400 mt-0.5">contribuicoes</p>
              </div>
              <div v-if="githubService.isConnected()" class="text-center">
                <p class="text-2xl font-semibold text-gray-800">{{ githubStats.repositories }}</p>
                <p class="text-xs text-gray-400 mt-0.5">repositorios</p>
              </div>
              <div v-if="linearService.isConnected()" class="text-center">
                <p class="text-2xl font-semibold text-gray-800">{{ linearStats.issuesCompleted }}</p>
                <p class="text-xs text-gray-400 mt-0.5">issues completadas</p>
              </div>
              <div v-if="googleService.isConnected()" class="text-center">
                <p class="text-2xl font-semibold text-gray-800">{{ emailStats.sent + emailStats.received }}</p>
                <p class="text-xs text-gray-400 mt-0.5">emails</p>
              </div>
              <div v-if="googleService.isConnected()" class="text-center">
                <p class="text-2xl font-semibold text-gray-800">{{ calendarStats.meetings }}</p>
                <p class="text-xs text-gray-400 mt-0.5">reunioes</p>
              </div>
              <div v-if="googleService.isConnected()" class="text-center">
                <p class="text-2xl font-semibold text-gray-800">{{ calendarStats.hours }}h</p>
                <p class="text-xs text-gray-400 mt-0.5">em calls</p>
              </div>
            </div>
          </div>

          <!-- Destaques -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <!-- Mes mais produtivo -->
            <div class="bg-white border border-gray-100 rounded-xl p-5">
              <p class="text-xs text-gray-400 mb-2">Mes mais produtivo</p>
              <p class="text-lg font-semibold text-gray-800 capitalize">{{ getMostProductiveMonth() }}</p>
              <p class="text-xs text-gray-400 mt-1">baseado em todas as atividades</p>
            </div>

            <!-- Dia mais ocupado -->
            <div v-if="calendarStats.busiestDay" class="bg-white border border-gray-100 rounded-xl p-5">
              <p class="text-xs text-gray-400 mb-2">Dia mais ocupado</p>
              <p class="text-lg font-semibold text-gray-800 capitalize">{{ calendarStats.busiestDay.day }}</p>
              <p class="text-xs text-gray-400 mt-1">{{ calendarStats.busiestDay.count }} eventos</p>
            </div>

            <!-- Media diaria -->
            <div class="bg-white border border-gray-100 rounded-xl p-5">
              <p class="text-xs text-gray-400 mb-2">Media diaria</p>
              <p class="text-lg font-semibold text-gray-800">{{ getDailyAverage() }} atividades</p>
              <p class="text-xs text-gray-400 mt-1">commits + emails + eventos</p>
            </div>
          </div>

          <!-- Footer message -->
          <div class="text-center py-8">
            <p class="text-emerald-600 text-sm font-medium">Bom trabalho!</p>
            <p class="text-gray-400 text-xs mt-1">Continue assim em {{ year + 1 }}</p>
          </div>
        </section>
      </template>
    </main>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Loading animations */
.animate-pulse-slow {
  animation: pulseSlow 2s ease-in-out infinite;
}

@keyframes pulseSlow {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 20px 10px rgba(16, 185, 129, 0);
  }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-2px); }
}

.animate-blink {
  animation: blink 3s ease-in-out infinite;
  transform-origin: center center;
  transform-box: fill-box;
}

@keyframes blink {
  0%, 45%, 55%, 100% {
    transform: scaleY(1);
  }
  50% {
    transform: scaleY(0.1);
  }
}

.animate-orbit-1 {
  animation: orbit1 2s linear infinite;
}

@keyframes orbit1 {
  0% { transform: rotate(0deg) translateX(45px) rotate(0deg); }
  100% { transform: rotate(360deg) translateX(45px) rotate(-360deg); }
}

.animate-orbit-2 {
  animation: orbit2 2.5s linear infinite reverse;
}

@keyframes orbit2 {
  0% { transform: rotate(0deg) translateX(50px) rotate(0deg); }
  100% { transform: rotate(360deg) translateX(50px) rotate(-360deg); }
}

.animate-orbit-3 {
  animation: orbit3 3s linear infinite;
}

@keyframes orbit3 {
  0% { transform: rotate(120deg) translateX(48px) rotate(-120deg); }
  100% { transform: rotate(480deg) translateX(48px) rotate(-480deg); }
}

.animate-bounce-1 {
  animation: bounce 1s ease-in-out infinite;
}

.animate-bounce-2 {
  animation: bounce 1s ease-in-out infinite 0.15s;
}

.animate-bounce-3 {
  animation: bounce 1s ease-in-out infinite 0.3s;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); opacity: 0.5; }
  50% { transform: translateY(-4px); opacity: 1; }
}

.animate-progress {
  animation: progress 1.5s ease-in-out infinite;
}

@keyframes progress {
  0% { transform: translateX(-100%); width: 50%; }
  50% { width: 30%; }
  100% { transform: translateX(250%); width: 50%; }
}
</style>
