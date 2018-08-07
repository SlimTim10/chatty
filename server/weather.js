'use strict';

const R = require('ramda');
const https = require('https');
const OWM_API_KEY = process.env.OWM_API_KEY;

const getWeather = city => callback => {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${OWM_API_KEY}`;
  https.get(url, (res) => {
    let body = '';

    res.on('data', (d) => {
      body += d;
    });

    res.on('end', () => {
      const die = () => {
        callback('Could not find weather data');
      };
      
      const response = JSON.parse(body);
      const city = R.prop('name', response);
      if (!city) return die();
      const weather = R.prop('weather', response);
      const condition = (weather && weather.length > 0) ? weather[0].description : null;
      const main = R.prop('main', response);
      const temperature = (main && main.temp) ? main.temp : null;
      const high = (main && main.temp_min) ? main.temp_min : null;
      const low = (main && main.temp_max) ? main.temp_max : null;
      const parts = [
        `Current weather in: ${city}`,
        `Temperature: ${temperature} C`,
        `High: ${high} C`,
        `Low: ${low} C`,
        `Condition: ${condition}`
      ];
      callback(parts.join('\n'));
    });

  }).on('error', (e) => {
    console.error(e);
  });
};

module.exports = { getWeather };
