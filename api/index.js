const getPlanned = require('../functions/getPlanned')
const getCurrent = require('../functions/getCurrent')
const webhookClient = require('../utils/webhookClient')
const {
  EmbedBuilder
} = require('discord.js')

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
      })
      response.status(200).send({
        success: false,
        content
      })

      return
    }

    const fields = [{
        name: 'Zpoždění',
        value: `${current.delay_min || 'N/A'} min`
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
      name: planned.disruption_title,
      value: planned.disruption_text
    })
    const embed = new EmbedBuilder().setTitle(`${routeName}, směr ${current.headsign}, ze zastávky ${current.stop_name}`).setColor(0x00FFFF).addFields(fields)
    let content = current.delay ? '' : 'Spoj jede včas. '
    if (current.delay) content = `${routeName} →${current.headsign}: Spoj bude o ${current.delay_min} min opožděn.`
    if (current.cancel) content = 'Spoj je zrušen.'
    if (planned.cancel || planned.delay) content += `Spoje se týká mimořádnost: ${[planned.cancel, planned.delay].filter(Boolean).join(', ')} spoje.`
    await webhookClient.send({
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
      content,
    })
    response.status(200).send({
      success: false,
      error,
      content
    })
  }
}