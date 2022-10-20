// require('dotenv').config()
const axios = require('axios');
// API_URL
const {
  API_URL
} = require("../config.json");
// API_KEY
const {
  API_KEY
} = process.env

const API_PATH = '/departureboards/'
// {stopId, lineId}
async function getCurrent({
  stopId,
  routeName
}) {


  // fetch departure board
  const {
    data: departures
  } = await axios.get(API_URL + API_PATH, {
    params: {
      ids: stopId
    },
    headers: {
      'x-access-token': API_KEY
    }
  })
  const firstArrival = departures.filter(x => x.route.short_name === routeName)[0]
  if (!firstArrival) return null;
  return {
    route_name: firstArrival.route.short_name,
    headsign: firstArrival.trip.headsign,
    stop_name: firstArrival.stop.name,
    cancel: firstArrival.trip.is_canceled,
    delay: firstArrival.delay.is_available,
    delay_min: firstArrival.delay.minutes || 0,
    scheduled_departure: firstArrival.departure_timestamp.scheduled,
    estimated_departure: firstArrival.departure_timestamp.predicted
  }

}

module.exports = getCurrent