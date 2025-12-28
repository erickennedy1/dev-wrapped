const GOOGLE_API_BASE = 'https://www.googleapis.com'
const BACKEND_URL = 'http://localhost:3001'

export const googleService = {
  accessToken: null,
  refreshToken: null,
  tokenExpiry: null,

  setTokens(accessToken, refreshToken, expiresIn) {
    this.accessToken = accessToken
    this.refreshToken = refreshToken
    // Calcula quando o token expira (com 5 min de margem)
    this.tokenExpiry = Date.now() + (expiresIn - 300) * 1000

    localStorage.setItem('google_token', accessToken)
    if (refreshToken) {
      localStorage.setItem('google_refresh', refreshToken)
    }
    localStorage.setItem('google_expiry', this.tokenExpiry.toString())
  },

  // Mantém compatibilidade com código antigo
  setAccessToken(token) {
    this.accessToken = token
    localStorage.setItem('google_token', token)
  },

  getAccessToken() {
    if (!this.accessToken) {
      this.accessToken = localStorage.getItem('google_token')
    }
    return this.accessToken
  },

  getRefreshToken() {
    if (!this.refreshToken) {
      this.refreshToken = localStorage.getItem('google_refresh')
    }
    return this.refreshToken
  },

  getTokenExpiry() {
    if (!this.tokenExpiry) {
      const expiry = localStorage.getItem('google_expiry')
      this.tokenExpiry = expiry ? parseInt(expiry) : null
    }
    return this.tokenExpiry
  },

  isTokenExpired() {
    const expiry = this.getTokenExpiry()
    if (!expiry) return true
    return Date.now() > expiry
  },

  clearToken() {
    this.accessToken = null
    this.refreshToken = null
    this.tokenExpiry = null
    localStorage.removeItem('google_token')
    localStorage.removeItem('google_refresh')
    localStorage.removeItem('google_expiry')
  },

  isConnected() {
    return !!this.getAccessToken()
  },

  async ensureValidToken() {
    // Se o token não expirou, retorna o atual
    if (!this.isTokenExpired()) {
      return this.getAccessToken()
    }

    // Tenta renovar usando refresh_token
    const refreshToken = this.getRefreshToken()
    if (!refreshToken) {
      console.warn('Token expirado e sem refresh_token disponivel')
      this.clearToken()
      throw new Error('Token expirado. Por favor, reconecte com o Google.')
    }

    try {
      console.log('Renovando token do Google...')
      const response = await fetch(`${BACKEND_URL}/auth/google/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken })
      })

      if (!response.ok) {
        throw new Error('Falha ao renovar token')
      }

      const data = await response.json()
      this.setTokens(data.access_token, refreshToken, data.expires_in)
      console.log('Token renovado com sucesso!')
      return data.access_token
    } catch (error) {
      console.error('Erro ao renovar token:', error)
      this.clearToken()
      throw new Error('Falha ao renovar token. Por favor, reconecte com o Google.')
    }
  },

  async validateToken(token) {
    try {
      const response = await fetch(`${GOOGLE_API_BASE}/oauth2/v1/tokeninfo?access_token=${token}`)
      const data = await response.json()
      return !data.error
    } catch {
      return false
    }
  },

  async getUser() {
    const token = await this.ensureValidToken()
    const response = await fetch(`${GOOGLE_API_BASE}/oauth2/v2/userinfo`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    const data = await response.json()

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      picture: data.picture
    }
  },

  async getYearStats(year = new Date().getFullYear()) {
    const user = await this.getUser()

    // Carregar dados em paralelo
    const [emailStats, calendarStats] = await Promise.all([
      this.getEmailStats(year),
      this.getCalendarStats(year)
    ])

    return {
      user,
      email: emailStats,
      calendar: calendarStats
    }
  },

  async getEmailStats(year) {
    const token = await this.ensureValidToken()
    const afterDate = `${year}/01/01`
    const beforeDate = `${year}/12/31`

    // Buscar emails enviados
    const sentQuery = `in:sent after:${afterDate} before:${beforeDate}`
    const sentResponse = await fetch(
      `${GOOGLE_API_BASE}/gmail/v1/users/me/messages?q=${encodeURIComponent(sentQuery)}&maxResults=500`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    )
    const sentData = await sentResponse.json()

    // Buscar emails recebidos
    const receivedQuery = `in:inbox after:${afterDate} before:${beforeDate}`
    const receivedResponse = await fetch(
      `${GOOGLE_API_BASE}/gmail/v1/users/me/messages?q=${encodeURIComponent(receivedQuery)}&maxResults=500`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    )
    const receivedData = await receivedResponse.json()

    const totalSent = sentData.resultSizeEstimate || 0
    const totalReceived = receivedData.resultSizeEstimate || 0

    // Buscar detalhes dos emails para distribuição por mês (amostra)
    const sentByMonth = await this.getEmailsByMonth(sentData.messages || [], year)
    const receivedByMonth = await this.getEmailsByMonth(receivedData.messages || [], year)

    return {
      totalSent,
      totalReceived,
      sentByMonth,
      receivedByMonth,
      averageSentPerDay: Math.round(totalSent / 365),
      averageReceivedPerDay: Math.round(totalReceived / 365)
    }
  },

  async getEmailsByMonth(messages, year) {
    const months = Array(12).fill(0)

    if (messages.length === 0) return months

    const token = await this.ensureValidToken()

    // Pegar uma amostra de até 50 emails para estimar distribuição
    const sampleSize = Math.min(messages.length, 50)
    const sample = messages.slice(0, sampleSize)

    for (const msg of sample) {
      try {
        const response = await fetch(
          `${GOOGLE_API_BASE}/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Date`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )
        const data = await response.json()

        const dateHeader = data.payload?.headers?.find(h => h.name === 'Date')
        if (dateHeader) {
          const date = new Date(dateHeader.value)
          if (date.getFullYear() === year) {
            months[date.getMonth()]++
          }
        }

        // Pequeno delay para evitar rate limiting
        await this.delay(50)
      } catch (e) {
        console.warn('Error fetching email details:', e)
      }
    }

    // Escalar os valores baseado no total
    const factor = messages.length / sampleSize
    return months.map(count => Math.round(count * factor))
  },

  async getCalendarStats(year) {
    const token = await this.ensureValidToken()
    const timeMin = new Date(`${year}-01-01T00:00:00Z`).toISOString()
    const timeMax = new Date(`${year}-12-31T23:59:59Z`).toISOString()

    const response = await fetch(
      `${GOOGLE_API_BASE}/calendar/v3/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax}&maxResults=2500&singleEvents=true&orderBy=startTime`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    const data = await response.json()
    console.log('Calendar API response:', data)
    const events = data.items || []

    // Calcular estatísticas de todos os eventos
    const eventsByMonth = Array(12).fill(0)
    let totalDurationMinutes = 0
    const eventsByDate = {}

    events.forEach(event => {
      const start = new Date(event.start?.dateTime || event.start?.date)
      const end = new Date(event.end?.dateTime || event.end?.date)

      // Contagem por mês
      eventsByMonth[start.getMonth()]++

      // Duração (apenas para eventos com hora específica)
      if (event.start?.dateTime && event.end?.dateTime) {
        const durationMinutes = (end - start) / (1000 * 60)
        totalDurationMinutes += durationMinutes
      }

      // Contagem por data específica
      const dateKey = start.toISOString().split('T')[0]
      eventsByDate[dateKey] = (eventsByDate[dateKey] || 0) + 1
    })

    // Encontrar a data específica com mais eventos
    const busiestEntry = Object.entries(eventsByDate)
      .sort((a, b) => b[1] - a[1])[0]

    let busiestDay = null
    if (busiestEntry) {
      const date = new Date(busiestEntry[0] + 'T12:00:00')
      busiestDay = {
        day: date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' }),
        count: busiestEntry[1]
      }
    }

    return {
      totalMeetings: events.length,
      totalEvents: events.length,
      totalDurationMinutes,
      totalDurationHours: Math.round(totalDurationMinutes / 60),
      meetingsByMonth: eventsByMonth,
      averageMeetingsPerWeek: Math.round(events.length / 52),
      averageDurationMinutes: events.length > 0 ? Math.round(totalDurationMinutes / events.length) : 0,
      busiestDay
    }
  },

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

export default googleService
