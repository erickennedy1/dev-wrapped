/**
 * BACKEND DO DEV WRAPPED
 *
 * Este servidor faz a "ponte" entre o usuario e o Google/Slack.
 * Ele é necessario porque o Google/Slack so confiam em servidores,
 * nao em codigo que roda no navegador do usuario.
 */

import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// CORS permite que o frontend fale com o backend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}))

app.use(express.json())

// ============================================
// GOOGLE OAUTH
// ============================================

// Passo 1: Usuario clica em "Conectar com Google"
// Este endpoint retorna a URL para onde o usuario deve ir
app.get('/auth/google', (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/auth/google/callback'

  // Scopes = permissoes que queremos (ler emails e calendario)
  const scopes = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/userinfo.email'
  ].join(' ')

  // URL do Google onde o usuario vai autorizar
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent(scopes)}` +
    `&access_type=offline` +
    `&prompt=consent`

  res.json({ url: authUrl })
})

// Passo 2: Google manda o usuario de volta com um "codigo"
// Este endpoint troca o codigo por um token de acesso
app.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query

  if (!code) {
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5174'}?error=no_code`)
  }

  try {
    // Troca o codigo por um token de acesso
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/auth/google/callback',
        grant_type: 'authorization_code'
      })
    })

    const tokens = await tokenResponse.json()

    if (tokens.error) {
      console.error('Google token error:', tokens)
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5174'}?error=token_error`)
    }

    // Redireciona de volta pro frontend com os tokens
    const params = new URLSearchParams({
      google_token: tokens.access_token,
      google_refresh: tokens.refresh_token || '',
      google_expires: tokens.expires_in || 3600
    })
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}?${params}`)

  } catch (error) {
    console.error('Google OAuth error:', error)
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}?error=oauth_error`)
  }
})

// Endpoint para renovar o token usando refresh_token
app.post('/auth/google/refresh', async (req, res) => {
  const { refresh_token } = req.body

  if (!refresh_token) {
    return res.status(400).json({ error: 'refresh_token is required' })
  }

  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        refresh_token,
        grant_type: 'refresh_token'
      })
    })

    const tokens = await tokenResponse.json()

    if (tokens.error) {
      console.error('Google refresh error:', tokens)
      return res.status(401).json({ error: 'refresh_failed' })
    }

    res.json({
      access_token: tokens.access_token,
      expires_in: tokens.expires_in || 3600
    })
  } catch (error) {
    console.error('Google refresh error:', error)
    res.status(500).json({ error: 'refresh_error' })
  }
})

// ============================================
// HEALTH CHECK
// ============================================

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend rodando!' })
})

// ============================================
// INICIAR SERVIDOR
// ============================================

app.listen(PORT, () => {
  console.log(``)
  console.log(`Backend rodando em http://localhost:${PORT}`)
  console.log(``)
  console.log(`Endpoints disponiveis:`)
  console.log(`  GET /auth/google    - Inicia OAuth do Google`)
  console.log(`  GET /auth/slack     - Inicia OAuth do Slack`)
  console.log(`  GET /health         - Verifica se o servidor esta rodando`)
  console.log(``)
})
