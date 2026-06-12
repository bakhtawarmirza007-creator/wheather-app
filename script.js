
const API_KEY = CONFIG.WEATHER_API_KEY;


const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const geoBtn = document.getElementById('geo-btn');
const weatherCard = document.getElementById('weather-card');
const errorMessage = document.getElementById('error-message');

const locationName = document.getElementById('location-name');
const weatherIcon = document.getElementById('weather-icon');
const temperature = document.getElementById('temperature');
const description = document.getElementById('description');
const humidity = document.getElementById('humidity');


async function getWeatherByCity(city) {
    try {
        errorMessage.classList.add('hidden');
        
        // Step 1: Call the Geocoding endpoint to get exact Lat/Lon coordinates
        const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${API_KEY}`;
        const geoResponse = await fetch(geoUrl);
        const geoData = await geoResponse.json();

        // If the array is empty, the city name is genuinely invalid
        if (!geoData || geoData.length === 0) {
            throw new Error('City profile not found. Verify spelling and try again.');
        }

        // Extract the exact coordinates from the first matching result
        const { lat, lon } = geoData[0];

        // Step 2: Use those bulletproof coordinates to fetch the real weather data
        await getWeatherByCoords(lat, lon);

    } catch (error) {
        renderErrorState(error.message);
    }
}


function renderWeatherInterface(data) {
    locationName.textContent = `${data.name}, ${data.sys.country}`;
    temperature.textContent = `${Math.round(data.main.temp)}°C`;
    description.textContent = data.weather[0].description;
    humidity.textContent = `${data.main.humidity}%`;

    
    const stateTag = data.weather[0].main;
    evaluateWeatherTheme(stateTag);

    
    weatherCard.classList.remove('hidden');
}


function evaluateWeatherTheme(condition) {
    const body = document.body;
    body.className = ''; 

    switch (condition) {
        case 'Clear':
            weatherIcon.textContent = '☀️';
            body.classList.add('sunny-bg');
            break;
        case 'Rain':
        case 'Drizzle':
        case 'Thunderstorm':
            weatherIcon.textContent = '🌧️';
            body.classList.add('rainy-bg');
            break;
        case 'Clouds':
            weatherIcon.textContent = '☁️';
            body.classList.add('cloudy-bg');
            break;
        default:
            weatherIcon.textContent = '减轻'; 
            body.classList.add('default-bg');
            break;
    }
}


function renderErrorState(message) {
    weatherCard.classList.add('hidden');
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
}


searchBtn.addEventListener('click', () => {
    const rawInput = cityInput.value.trim();
    if (rawInput) getWeatherByCity(rawInput);
});

cityInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        const rawInput = cityInput.value.trim();
        if (rawInput) getWeatherByCity(rawInput);
    }
});


geoBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                getWeatherByCoords(latitude, longitude);
            },
            () => {
                renderErrorState('Location permission denied. Please search manually.');
            }
        );
    } else {
        renderErrorState('Your browser does not support tracking location.');
    }
});