const {
  WebhookClient
} = require('discord.js')
const {
  WEBHOOK_URL
} = process.env

const webhookClient = new WebhookClient({
  url: WEBHOOK_URL
})

module.exports = webhookClient