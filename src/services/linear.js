/**
 * LINEAR SERVICE
 *
 * Linear usa GraphQL API com Personal API Key.
 * O usuario pode criar a key em: Settings > Account > Security & Access
 *
 * Documentacao: https://developers.linear.app/docs/graphql/working-with-the-graphql-api
 */

const API_URL = 'https://api.linear.app/graphql'

let accessToken = localStorage.getItem('linear_token')

// Funcao helper para fazer queries GraphQL
async function graphql(query, variables = {}) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': accessToken
    },
    body: JSON.stringify({ query, variables })
  })

  const data = await response.json()

  if (data.errors) {
    console.error('Linear GraphQL errors:', data.errors)
    throw new Error(data.errors[0]?.message || 'GraphQL error')
  }

  return data.data
}

export const linearService = {
  setAccessToken(token) {
    accessToken = token
    localStorage.setItem('linear_token', token)
  },

  clearToken() {
    accessToken = null
    localStorage.removeItem('linear_token')
  },

  isConnected() {
    return !!accessToken
  },

  // Valida se o token funciona
  async validateToken(token) {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({
          query: `{ viewer { id name email } }`
        })
      })

      const data = await response.json()
      return !data.errors && data.data?.viewer?.id
    } catch (error) {
      console.error('Error validating Linear token:', error)
      return false
    }
  },

  // Busca estatisticas do ano
  async getYearStats(year) {
    // Busca info do usuario
    const userQuery = `{
      viewer {
        id
        name
        email
      }
    }`
    const userData = await graphql(userQuery)
    const user = userData.viewer

    // Busca issues criadas pelo usuario no ano
    const issuesCreatedQuery = `
      query IssuesCreated($userId: ID!) {
        issues(
          filter: {
            creator: { id: { eq: $userId } }
          }
          first: 250
        ) {
          nodes {
            id
            title
            createdAt
            completedAt
            state {
              name
              type
            }
            project {
              id
              name
            }
          }
        }
      }
    `

    const issuesCreatedData = await graphql(issuesCreatedQuery, {
      userId: user.id
    })

    // Filtra no JavaScript as issues do ano
    const allCreatedIssues = issuesCreatedData.issues.nodes
    const issuesCreated = allCreatedIssues.filter(issue => {
      const createdDate = new Date(issue.createdAt)
      return createdDate.getFullYear() === year
    })

    // Busca issues atribuidas ao usuario
    const issuesAssignedQuery = `
      query IssuesAssigned($userId: ID!) {
        issues(
          filter: {
            assignee: { id: { eq: $userId } }
          }
          first: 250
        ) {
          nodes {
            id
            title
            createdAt
            completedAt
            state {
              name
              type
            }
            project {
              id
              name
            }
          }
        }
      }
    `

    const issuesAssignedData = await graphql(issuesAssignedQuery, {
      userId: user.id
    })

    // Filtra issues completadas no ano
    const allAssignedIssues = issuesAssignedData.issues.nodes
    const issuesCompleted = allAssignedIssues.filter(issue => {
      if (!issue.completedAt) return false
      const completedDate = new Date(issue.completedAt)
      return completedDate.getFullYear() === year
    })

    // Calcula issues por mes (criadas)
    const createdByMonth = Array(12).fill(0)
    issuesCreated.forEach(issue => {
      const month = new Date(issue.createdAt).getMonth()
      createdByMonth[month]++
    })

    // Calcula issues por mes (completadas)
    const completedByMonth = Array(12).fill(0)
    issuesCompleted.forEach(issue => {
      if (issue.completedAt) {
        const month = new Date(issue.completedAt).getMonth()
        completedByMonth[month]++
      }
    })

    // Agrupa por projeto
    const projectsMap = {}
    issuesCompleted.forEach(issue => {
      if (issue.project) {
        const projectName = issue.project.name
        if (!projectsMap[projectName]) {
          projectsMap[projectName] = { name: projectName, completed: 0 }
        }
        projectsMap[projectName].completed++
      }
    })

    const topProjects = Object.values(projectsMap)
      .sort((a, b) => b.completed - a.completed)
      .slice(0, 5)

    // Calcula media por semana
    const weeksInYear = 52
    const avgPerWeek = Math.round((issuesCompleted.length / weeksInYear) * 10) / 10

    return {
      user: {
        name: user.name,
        email: user.email
      },
      issuesCreated: issuesCreated.length,
      issuesCompleted: issuesCompleted.length,
      createdByMonth,
      completedByMonth,
      topProjects,
      averagePerWeek: avgPerWeek
    }
  }
}
