async function getWeather() {
    const city = document.getElementById("city").value.trim();
    const message = document.getElementById("message");

    if (!city) {
        message.textContent = "Please enter a city name.";
        return;
    }

    message.textContent = "Getting weather...";

    try {
        const response = await fetch(`/weather?city=${encodeURIComponent(city)}`);
        const data = await response.json();

        if (data.error) {
            message.textContent = data.error;
            return;
        }

        document.getElementById("cityName").textContent =
            `${data.city}, ${data.country}`;

        document.getElementById("temperature").textContent =
            `${Math.round(data.temperature)}°C`;

        document.getElementById("humidity").textContent =
            `${data.humidity}%`;

        document.getElementById("wind").textContent =
            `${data.wind_speed} km/h`;

        document.getElementById("feelsLike").textContent =
            `${Math.round(data.feels_like)}°C`;

        document.getElementById("condition").textContent =
            getWeatherCondition(data.weather_code);
            document.getElementById("weatherIcon").textContent =
    getWeatherIcon(data.weather_code);

        message.textContent = "";

    } catch (error) {
        message.textContent =
            "Could not connect to the weather service.";
    }
}


function getWeatherCondition(code) {

    if (code === 0) {
        return "Clear sky";
    }

    if (code === 1 || code === 2 || code === 3) {
        return "Cloudy";
    }

    if (code === 45 || code === 48) {
        return "Foggy";
    }

    if (code >= 51 && code <= 57) {
        return "Drizzle";
    }

    if (code >= 61 && code <= 67) {
        return "Rain";
    }

    if (code >= 71 && code <= 77) {
        return "Snow";
    }

    if (code >= 80 && code <= 82) {
        return "Rain showers";
    }

    if (code === 85 || code === 86) {
        return "Snow showers";
    }

    if (code >= 95) {
        return "Thunderstorm";
    }

    return "Unknown";
}
function getWeatherIcon(code) {

    if (code === 0) {
        return "☀️";
    }

    if (code === 1 || code === 2) {
        return "⛅";
    }

    if (code === 3) {
        return "☁️";
    }

    if (code === 45 || code === 48) {
        return "🌫️";
    }

    if (code >= 51 && code <= 57) {
        return "🌦️";
    }

    if (code >= 61 && code <= 67) {
        return "🌧️";
    }

    if (code >= 71 && code <= 77) {
        return "❄️";
    }

    if (code >= 80 && code <= 82) {
        return "🌦️";
    }

    if (code === 85 || code === 86) {
        return "🌨️";
    }

    if (code >= 95) {
        return "⛈️";
    }

    return "🌤️";
}