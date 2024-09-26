const weatherApiKey = 'c30a18fe37de4537b2344645242409'
function getWeather(city) {
    const url=` https://api.weatherapi.com/v1/current.json?key=${weatherApiKey}&q=${city}`;
    return fetch(url)
        .then(response => {
            if(!response.ok) {
                throw new Error('City not found');
            }
            return response.json();
        })
        .then(data => {

            displayWeather(data);
            getLast4HoursWeather(data.location.lat, data.location.lon);
        })
        .catch(error => {
            document.getElementById('weatherResult').innerHTML = `<p> ${error.message}</p>`;
            document.getElementById('weatherResult').style.display='block';
        });
}
function displayWeather(data) {
    const weatherResult = document.getElementById('weatherResult');
    weatherResult.style.display = 'block';
    console.log('Location:',data.location);
    console.log('Current Weather:', data.current);
    console.log('Current Weather Object:', data.current);
    const locationName = data.location?.name || "Unkonwn Location"
    const country = data.location?.country || "Unknown country";
    const temperature= data.current?.temp_c !== undefined ? data.current.temp_c : "N/A";
    const conditionText = data.current?.condition? data.current .condition.text :"no condition data";
    const conditionIcon = data.current?.condition ? data.current.condition.icon : "";
    const humidity = data.current?.humidity !== undefined ? data.current.humidity : "N/A";
    const windSpeed = data.current?.wind_kph !== undefined ? data.current.wind_kph : "N/A";
    console.log('updating dom with weather data...');
    weatherResult.innerHTML = `
        <h2>${locationName}, ${country}</h2>
        <p>Temperature: ${temperature}°C</p>
        <p>Condition: ${conditionText} <img src="${conditionIcon}" alt="${conditionText}"/></p>
        <p>Humidity: ${humidity}%</p>
        <p>Wind: ${windSpeed} kph</p>
    `;
    console.log('dom updated.');
}
function getLast4HoursWeather(lat,lon) {
    const date = new Date();

    const formattedDate = date.toISOString().split('T')[0];
    const url= `https://api.weatherapi.com/v1/history.json?key=${weatherApiKey}&q=${lat},${lon}&dt=${formattedDate}`;

    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('could not fetch last 4 hours weather');
            }
            return response.json();
        })
        .then(data => {

            displayLast4HoursWeather(data);
        })
        .catch(error => {
            console.error(error);
        });
}
function displayLast4HoursWeather(data) {
    const weatherResult = document.getElementById('weatherResult');
    console.log(weatherResult);
    const history = data.forecast.forecastday[0].hour;
    const currentTime = new Date();
    const istOffset = 5 * 60*60*1000 + 30 * 60* 1000;
    const currentISTTime = new Date(currentTime.getTime() + istOffset);
    const currentHour = currentISTTime.getHours();
    const last4Hours = [];
    for (let i=0; i<  4; i++){
        const hourIndex =(currentHour  -4 + i + 24) % 24;
        if (history[hourIndex]) {
            last4Hours.push(history[hourIndex]);
        }
    }

    const historicalWeather = last4Hours.map(hour =>{
        const utcDate = new Date(hour.time);
        const istHour = new Date(utcDate.getTime()+ istOffset);
        const timeString = istHour.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit',hour12:false});
        return `
            <div class='hour-data'>
                <p>${hour.time}: ${hour.temp_c}°C</p>
                <img src="${hour.condition.icon}" alt="${hour.condition.text}" />
                <p> ${hour.condition.text}</p>
            </div>
    `}).join('');
     weatherResult.innerHTML += `
        <h3> last 4 hours:</h3>
        <div class="last-4-hours">${historicalWeather}</div>
    `;
}
document.getElementById('getWeatherBtn').addEventListener('click', () => {
    const city = document.getElementById('city').value;
    getWeather(city);
});
document.getElementById('getLocationBtn').addEventListener('click', () => {
    navigator.geolocation.getCurrentPosition(position => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        getWeatherByCoords(lat,lon);
    });
});
function getWeatherByCoords(lat, lon) {
    const url=`https://api.weatherapi.com/v1/current.json?key=${weatherApiKey}&q=${lat},${lon}`;
    return fetch(url)
        .then(response => {
            if(!response.ok){
                throw new Error('unable to get weather for your location.');
            }
            return response.json();
    })
    .then(data => {
        displayWeather(data);
        getLast4HoursWeather(lat,lon);
    })
    .catch(error => {
        document.getElementById('weatherResult').innerHTML = `<p>${error.message}</p>`;
        document.getElementById('weatherResult').style.display = 'block';
    });
}