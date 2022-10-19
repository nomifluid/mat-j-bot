const convert = require("xml-js");
const axios = require("axios");
// RSS_URL
const {
  RSS_URL
} = require("../config.json");

async function getPlanned({
  routeName
}) {
  // fetch disruptions
  const {
    data
  } = await axios.get(RSS_URL);
  return new Promise((resolve) => {
    // parse xml
    const disruptions = convert.xml2js(data, {
      compact: true
    }).rss.channel.item;
    for (let i = 0; i < disruptions.length; i++) {
      const disruption = disruptions[i];
      const {
        title: {
          _text: t
        },
        description: {
          _cdata: description
        },
      } = disruption;
      // parse text
      const title = String(t).toLowerCase();
      const lines = description
        .slice(
          description.indexOf("Dotčené linky:") + "Dotčené linky:".length,
          description.length
        )
        .replaceAll(",", "")
        .split(" ")
        .filter(Boolean);
      if (lines.find((x) => x === routeName)) {
        // return {route_name, cancel, delay, disruption, disruption_text}
        return resolve({
          route_name: routeName,
          cancel: title.includes("neodjetí"),
          delay: title.includes("zpoždění"),
          disruption: true,
          disruption_title: title,
          disruption_text: description
        });
      }
    }
    resolve({
      cancel: false,
      delay: false,
      disruption: false,
    });
  });
}

module.exports = getPlanned