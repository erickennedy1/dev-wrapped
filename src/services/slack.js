const SLACK_API_BASE = 'https://slack.com/api'

export const slackService = {
  accessToken: null,

  setAccessToken(token) {
    this.accessToken = token
    localStorage.setItem('slack_token', token)
  },

  getAccessToken() {
    if (!this.accessToken) {
      this.accessToken = localStorage.getItem('slack_token')
    }
    return this.accessToken
  },

  clearToken() {
    this.accessToken = null
    localStorage.removeItem('slack_token')
  },

  isConnected() {
    return !!this.getAccessToken()
  },

  async validateToken(token) {
    try {
      const response = await fetch(`${SLACK_API_BASE}/auth.test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
      const data = await response.json()
      return data.ok === true
    } catch {
      return false
    }
  },

  async getUser() {
    const response = await fetch(`${SLACK_API_BASE}/auth.test`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getAccessToken()}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    const data = await response.json()

    if (data.ok) {
      // Buscar info completa do usuário
      const userResponse = await fetch(`${SLACK_API_BASE}/users.info?user=${data.user_id}`, {
        headers: {
          'Authorization': `Bearer ${this.getAccessToken()}`
        }
      })
      const userData = await userResponse.json()

      return {
        id: data.user_id,
        name: userData.user?.real_name || data.user,
        username: data.user,
        team: data.team,
        teamId: data.team_id
      }
    }

    throw new Error('Failed to get user')
  },

  async getYearStats(year = new Date().getFullYear()) {
    const user = await this.getUser()

    // Buscar canais que o usuário participa
    const channels = await this.getChannels()

    let totalMessages = 0
    let messagesByMonth = Array(12).fill(0)
    let channelsWithMessages = 0
    const channelStats = []

    const startOfYear = Math.floor(new Date(`${year}-01-01`).getTime() / 1000)
    const endOfYear = Math.floor(new Date(`${year}-12-31T23:59:59`).getTime() / 1000)

    // Limitar a 20 canais para não estourar rate limit
    const channelsToCheck = channels.slice(0, 20)

    for (const channel of channelsToCheck) {
      try {
        const messages = await this.getChannelMessages(channel.id, startOfYear, endOfYear, user.id)

        if (messages.length > 0) {
          channelsWithMessages++
          totalMessages += messages.length

          channelStats.push({
            name: channel.name,
            messages: messages.length,
            isPrivate: channel.is_private
          })

          messages.forEach(msg => {
            const month = new Date(parseFloat(msg.ts) * 1000).getMonth()
            messagesByMonth[month]++
          })
        }

        // Pequeno delay para evitar rate limiting
        await this.delay(200)
      } catch (e) {
        console.warn(`Error fetching messages for channel ${channel.name}:`, e)
      }
    }

    // Ordenar canais por número de mensagens
    const topChannels = channelStats
      .sort((a, b) => b.messages - a.messages)
      .slice(0, 5)

    return {
      user,
      totalMessages,
      messagesByMonth,
      channelsParticipated: channelsWithMessages,
      totalChannels: channels.length,
      topChannels,
      averagePerDay: Math.round(totalMessages / 365)
    }
  },

  async getChannels() {
    const channels = []
    let cursor = ''

    // Buscar canais públicos e privados
    do {
      const response = await fetch(
        `${SLACK_API_BASE}/conversations.list?types=public_channel,private_channel&limit=200${cursor ? `&cursor=${cursor}` : ''}`,
        {
          headers: {
            'Authorization': `Bearer ${this.getAccessToken()}`
          }
        }
      )
      const data = await response.json()

      if (data.ok && data.channels) {
        // Filtrar apenas canais que o usuário é membro
        const memberChannels = data.channels.filter(c => c.is_member)
        channels.push(...memberChannels)
        cursor = data.response_metadata?.next_cursor || ''
      } else {
        break
      }
    } while (cursor)

    return channels
  },

  async getChannelMessages(channelId, oldest, latest, userId) {
    const messages = []
    let cursor = ''

    do {
      const response = await fetch(
        `${SLACK_API_BASE}/conversations.history?channel=${channelId}&oldest=${oldest}&latest=${latest}&limit=200${cursor ? `&cursor=${cursor}` : ''}`,
        {
          headers: {
            'Authorization': `Bearer ${this.getAccessToken()}`
          }
        }
      )
      const data = await response.json()

      if (data.ok && data.messages) {
        // Filtrar apenas mensagens do usuário (não bots, não system messages)
        const userMessages = data.messages.filter(msg =>
          msg.user === userId &&
          !msg.subtype && // Exclui mensagens de sistema
          msg.type === 'message'
        )
        messages.push(...userMessages)
        cursor = data.response_metadata?.next_cursor || ''

        // Limitar a 1000 mensagens por canal
        if (messages.length >= 1000) break
      } else {
        break
      }
    } while (cursor)

    return messages
  },

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

export default slackService
