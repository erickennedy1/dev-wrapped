const GITHUB_API_BASE = 'https://api.github.com'

export const githubService = {
  accessToken: null,

  setAccessToken(token) {
    this.accessToken = token
    localStorage.setItem('github_token', token)
  },

  getAccessToken() {
    if (!this.accessToken) {
      this.accessToken = localStorage.getItem('github_token')
    }
    return this.accessToken
  },

  clearToken() {
    this.accessToken = null
    localStorage.removeItem('github_token')
  },

  isConnected() {
    return !!this.getAccessToken()
  },

  async validateToken(token) {
    try {
      const response = await fetch(`${GITHUB_API_BASE}/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json'
        }
      })
      return response.ok
    } catch {
      return false
    }
  },

  async getUser() {
    const response = await fetch(`${GITHUB_API_BASE}/user`, {
      headers: {
        Authorization: `Bearer ${this.getAccessToken()}`,
        Accept: 'application/vnd.github.v3+json'
      }
    })
    return response.json()
  },

  async getYearStats(year = new Date().getFullYear()) {
    const user = await this.getUser()
    const username = user.login

    const [repos, prs, issues] = await Promise.all([
      this.getRepositories(),
      this.getPullRequests(username, year),
      this.getIssues(username, year)
    ])

    const commits = await this.getAllCommits(repos, year, username)

    // Ordenar repos por número de commits no ano
    const topRepositories = commits.repoCommits
      .sort((a, b) => b.commits - a.commits)
      .slice(0, 5)

    return {
      user,
      commits: commits.total,
      commitsByMonth: commits.byMonth,
      pullRequests: prs.total_count || 0,
      issues: issues.total_count || 0,
      repositories: repos.length,
      topRepositories
    }
  },

  async getRepositories() {
    const response = await fetch(
      `${GITHUB_API_BASE}/user/repos?per_page=100&sort=updated&affiliation=owner,collaborator`,
      {
        headers: {
          Authorization: `Bearer ${this.getAccessToken()}`,
          Accept: 'application/vnd.github.v3+json'
        }
      }
    )
    return response.json()
  },

  async getAllCommits(repos, year, username) {
    const since = `${year}-01-01T00:00:00Z`
    const until = `${year}-12-31T23:59:59Z`

    let total = 0
    const byMonth = Array(12).fill(0)
    const repoCommits = []

    // Limitar a 15 repos mais recentes para não estourar rate limit
    const recentRepos = repos.slice(0, 15)

    for (const repo of recentRepos) {
      try {
        const response = await fetch(
          `${GITHUB_API_BASE}/repos/${repo.full_name}/commits?author=${username}&since=${since}&until=${until}&per_page=100`,
          {
            headers: {
              Authorization: `Bearer ${this.getAccessToken()}`,
              Accept: 'application/vnd.github.v3+json'
            }
          }
        )

        if (response.ok) {
          const commits = await response.json()

          // Filtrar apenas commits onde o autor é realmente o usuário
          const userCommits = commits.filter(commit => {
            const authorLogin = commit.author?.login?.toLowerCase()
            const committerLogin = commit.committer?.login?.toLowerCase()
            const targetUser = username.toLowerCase()
            return authorLogin === targetUser || committerLogin === targetUser
          })

          total += userCommits.length

          if (userCommits.length > 0) {
            repoCommits.push({
              name: repo.name,
              fullName: repo.full_name,
              commits: userCommits.length,
              language: repo.language,
              isPrivate: repo.private
            })
          }

          userCommits.forEach(commit => {
            const month = new Date(commit.commit.author.date).getMonth()
            byMonth[month]++
          })
        }
      } catch (e) {
        console.warn(`Error fetching commits for ${repo.full_name}:`, e)
      }
    }

    return { total, byMonth, repoCommits }
  },

  async getPullRequests(username, year) {
    const query = `author:${username} created:${year}-01-01..${year}-12-31 type:pr`
    const response = await fetch(
      `${GITHUB_API_BASE}/search/issues?q=${encodeURIComponent(query)}&per_page=1`,
      {
        headers: {
          Authorization: `Bearer ${this.getAccessToken()}`,
          Accept: 'application/vnd.github.v3+json'
        }
      }
    )
    return response.json()
  },

  async getIssues(username, year) {
    const query = `author:${username} created:${year}-01-01..${year}-12-31 type:issue`
    const response = await fetch(
      `${GITHUB_API_BASE}/search/issues?q=${encodeURIComponent(query)}&per_page=1`,
      {
        headers: {
          Authorization: `Bearer ${this.getAccessToken()}`,
          Accept: 'application/vnd.github.v3+json'
        }
      }
    )
    return response.json()
  },

  getTopRepos(repos, limit) {
    return repos
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, limit)
      .map(repo => ({
        name: repo.name,
        stars: repo.stargazers_count,
        language: repo.language
      }))
  }
}

export default githubService
