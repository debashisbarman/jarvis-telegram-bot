import express from 'express'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'

const app = express()
app.use(express.json())

const ALLOWED_USERS = (process.env.ALLOWED_USERNAMES || '').split(',').map(u => u.trim())

app.post('/telegram', async (req, res) => {
  res.status(200).end()

  const { message } = req.body
  if (!message?.text || !ALLOWED_USERS.includes(message.from.username)) return

  try {
    const client = new Client({ name: 'telegram-bot', version: '1.0.0' })
    await client.connect(new StreamableHTTPClientTransport(
      new URL(`${process.env.JARVIS_URL}/mcp`),
      { requestInit: { headers: { Authorization: `Bearer ${process.env.AGENT_API_KEY}` } }, timeout: 900000 }
    ))
    await client.callTool({
      name: 'chat',
      arguments: {
        message: `New Telegram message from @${message.from.username} in chat ${message.chat.id}: ${message.text}`
      }
    })
    await client.close()
  } catch (e) {
    console.error(e)
  }
})

app.get('/', (req, res) => res.send('OK'))

app.listen(process.env.PORT || 3000, () => console.log('Running'))
