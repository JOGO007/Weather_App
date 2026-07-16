const container = document.querySelector('.container');
const searchButton = document.querySelector('.search-box button');
const weatherBox = document.querySelector('.weather-box');
const weatherDetails = document.querySelector('.weather-details');
const error404 = document.querySelector('.not-found');
const input = document.querySelector('.search-box input');
const themeToggle = document.querySelector('#theme-toggle');
const geoButton = document.querySelector('.search-box .fa-location-dot');

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');

    const isDarkTheme = document.body.classList.contains('dark-theme');
    themeToggle.textContent = isDarkTheme ? '☀️' : '🌙';
    themeToggle.setAttribute('aria-label', isDarkTheme ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
});

function showError(message) {
    container.style.height = '400px';
    weatherBox.style.display = 'none';
    weatherDetails.style.display = 'none';
    error404.querySelector('p').textContent = message;
    error404.style.display = 'block';
    error404.classList.add('fadeIn');
}

function formatCityDateTime(dtUnix, timezoneOffsetSeconds) {
    const localDate = new Date((dtUnix + timezoneOffsetSeconds) * 1000);
    const formatted = localDate.toLocaleString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC'
    });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

async function fetchWeather(url) {
    try {
        const response = await fetch(url);
        const json = await response.json();

        if (json.cod === '404' || response.status !== 200) {
            showError('Oops! Invalid location');
            return;
        }

        error404.style.display = 'none';
        error404.classList.remove('fadeIn');

        const image = document.querySelector('.weather-box img');
        const temperature = document.querySelector('.weather-box .temperature');
        const description = document.querySelector('.weather-box .description');
        const dateTime = document.querySelector('.weather-box .date-time');
        const humidity = document.querySelector('.weather-details .humidity span');
        const wind = document.querySelector('.weather-details .wind span');

        switch (json.weather?.[0]?.main) {
            case 'Clear':
                image.src = 'images/clear.png';
                break;
            case 'Rain':
                image.src = 'images/rain.png';
                break;
            case 'Snow':
                image.src = 'images/snow.png';
                break;
            case 'Clouds':
                image.src = 'images/cloud.png';
                break;
            case 'Haze':
                image.src = 'images/mist.png';
                break;
            default:
                image.src = 'images/clear.png';
        }

        input.value = json.name || input.value;
        temperature.innerHTML = `${parseInt(json.main.temp)}<span>°C</span>`;
        description.textContent = json.weather?.[0]?.description || 'Sin descripción';
        dateTime.textContent = formatCityDateTime(json.dt, json.timezone);
        humidity.textContent = `${json.main.humidity}%`;
        wind.textContent = `${parseInt(json.wind.speed)} Km/h`;

        weatherBox.style.display = 'block';
        weatherDetails.style.display = 'flex';
        weatherBox.classList.add('fadeIn');
        weatherDetails.classList.add('fadeIn');
        container.style.height = '610px';
    } catch (error) {
        showError('Error al cargar el clima');
    }
}

function searchByCity() {
    const city = input.value.trim();
    if (!city) return;

    fetchWeather(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${APIKey}`);
}

function searchByCoords() {
    if (!navigator.geolocation) {
        showError('Tu navegador no soporta geolocalización');
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            fetchWeather(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${APIKey}`);
        },
        () => {
            showError('No se pudo obtener tu ubicación');
        }
    );
}

searchButton.addEventListener('click', searchByCity);

geoButton.addEventListener('click', searchByCoords);
geoButton.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        searchByCoords();
    }
});

input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        searchButton.click();
    }
});
