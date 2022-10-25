const getPlanned = require('../functions/getPlanned')
const getCurrent = require('../functions/getCurrent')
const webhookClient = require('../utils/webhookClient')
const {
  EmbedBuilder
} = require('discord.js')

const USERNAME = 'matěj stach'

module.exports = async function handler(request, response) {
  const {
    stopId,
    routeName
  } = request.query
  try {
    const planned = await getPlanned({
      routeName
    })
    const current = await getCurrent({
      stopId,
      routeName
    })

    if (!current) {
      const content = `${routeName}: Nepodařilo se načíst nejbližší spoj.`
      await webhookClient.send({
        content,
        username: USERNAME
      })
      response.status(200).send({
        success: false,
        content
      })
      return
    }

    const fields = [{
        name: 'Zpoždění',
        value: current.delay_min ? (current.delay_min + ' min') : 'nedostupné'
      },
      {
        name: 'Pravidelný odjezd',
        value: new Date(current.scheduled_departure).toLocaleTimeString('cs-CZ', {
          timeZone: 'Europe/Prague'
        }),
        inline: true,
      },
      {
        name: 'Předpokládáný odjezd',
        value: new Date(current.estimated_departure).toLocaleTimeString('cs-CZ', {
          timeZone: 'Europe/Prague'
        }),
        inline: true
      },

    ]
    if (planned.disruption_title) fields.push({
      name: String(planned.disruption_title).toUpperCase(),
      value: String(planned.disruption_text).replaceAll('&nbsp;', ' ')
    })

    // HEADSIGN
    const headsign = `${routeName} ›${current.headsign}`

    // SERVICE STATE
    let serviceState = 'jede včas'
    if (current.cancel) {
      serviceState = 'je zrušen'
    } else {
      if (current.delay_min > 0)
        serviceState = `je o ${current.delay_min} min opožděn`

    }

    // SERVICE DISRUPTION
    let disruptions = []
    if (planned.delay) disruptions.push('zpoždění spoje')
    if (planned.cancel) disruptions.push('neodjetí spoje')
    let serviceDisruption = ''
    if (disruptions.length > 0) serviceDisruption = `Mimořádnost: ${disruptions.join(', ')}.`

    const contentDeparture = current.estimated_departure ? `Odjezd: ${new Date(current.estimated_departure).toLocaleTimeString('cs-CZ', {
          timeZone: 'Europe/Prague'
        })}` : ''
    let content = `${headsign}: Spoj ${serviceState}. ${serviceDisruption} ${contentDeparture}`

    const embed = new EmbedBuilder().setTitle(headsign).setColor(0x8F00FF).addFields(fields)
    await webhookClient.send({
      username: USERNAME,
      content,
      embeds: [embed]
    })
    response.status(200).send({
      success: true,
      error: null,
      content
    })
  } catch (error) {
    console.log(error);
    const content = `${routeName}: Nepodařilo se načíst informace o spoji.\n> ${error}`
    await webhookClient.send({
      username: USERNAME,
      content,
    })
    response.status(200).send({
      success: false,
      error,
      content
    })
  }
}