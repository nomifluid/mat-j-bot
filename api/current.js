const getCurrent = require('../functions/getCurrent')
const webhookClient = require('../utils/webhookClient')

module.exports = async function handler(request, response) {
  const {
    stopId,
    routeName
  } = request.query
  try {
    const result = await getCurrent({
      stopId,
      routeName
    })
    let descriptor = "jede včas"
    if (result.delay) descriptor = `je o ${result.delay_min} minut opožděn.`
    if (result.cancel) descriptor = "je zrušen."
    const content = `${routeName}: spoj ${descriptor}. Předpokládáný odjezd: ${Date.parse(result.estimated_departure).toLocaleString('cs-CZ')}.`
    webhookClient.send({
      content
    })
    response.status(200)
  } catch (error) {
    response.status()
    const content = `${routeName}: nepodařilo se načíst zpoždění spoje.\n>${error}`
    webhookClient.send({
      content
    })
  }
}