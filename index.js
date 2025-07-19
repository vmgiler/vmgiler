const fs = require('fs');
const path = require('path');
const https = require('https');

// Fetches the current temperature in Guayaquil using the Open-Meteo API
function getTemperatureGYE(callback) {
  // Open-Meteo API does not require an API key
  const url = 'https://api.open-meteo.com/v1/forecast?latitude=-2.17&longitude=-79.92&current_weather=true';
  https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        const temp = json.current_weather?.temperature;
        callback(temp !== undefined ? temp : 'N/A');
      } catch {
        callback('N/A');
      }
    });
  }).on('error', () => callback('N/A'));
}

// Reads README.md.tpl, replaces placeholders with current date/time and temperature, and writes to README.md
function updateReadmeWithDateAndTemp() {
  const tplPath = path.join(__dirname, 'README.md.tpl'); // Template file path
  const outPath = path.join(__dirname, 'README.md');     // Output file path
  let content = fs.readFileSync(tplPath, 'utf8');        // Read template content
  const now = new Date();
  // Format date and time in Guayaquil timezone as YYYY-MM-DDTHH:mm:ss
  const dateTime = now.toLocaleString('sv-SE', { timeZone: 'America/Guayaquil' }).replace(' ', 'T');

  // Fetch temperature and update the README
  getTemperatureGYE((temperature) => {
    content = content.replace('{{ current_date }}', dateTime);
    content = content.replace('{{ current_temperature }}', `${temperature}°C`);
    fs.writeFileSync(outPath, content, 'utf8'); // Write updated content to README.md
    console.log(`README.md actualizado con fecha ${dateTime} y temperatura ${temperature}°C`);
  });
}

// Run the update function
updateReadmeWithDateAndTemp();