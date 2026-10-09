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

        // Current weather
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

        // 7-day forecast
        displayForecast(data.forecast);

        message.textContent = "";

    } catch (error) {
        message.textContent =
            "Could not connect to the weather service.";
    }
}


function displayForecast(forecast) {

    const forecastContainer = document.getElementById("forecast");

    forecastContainer.innerHTML = "";

    forecast.forEach((day, index) => {

        const forecastCard = document.createElement("div");

        forecastCard.className = "forecast-card";

        let dayName;

        if (index === 0) {
            dayName = "Today";
        } else {
            const date = new Date(day.date + "T00:00:00");

            dayName = date.toLocaleDateString("en-US", {
                weekday: "short"
            });
        }

        forecastCard.innerHTML = `
            <h3>${dayName}</h3>

            <p class="forecast-date">
                ${formatDate(day.date)}
            </p>

            <div class="forecast-icon">
                ${getWeatherIcon(day.weather_code)}
            </div>

            <p class="forecast-condition">
                ${getWeatherCondition(day.weather_code)}
            </p>

            <p class="forecast-temperature">
                <strong>${Math.round(day.max_temperature)}°C</strong>
                / ${Math.round(day.min_temperature)}°C
            </p>

            <p class="rain">
                🌧️ ${day.rain_probability ?? 0}% rain
            </p>
        `;

        forecastContainer.appendChild(forecastCard);
    });
}


function formatDate(dateString) {

    const date = new Date(dateString + "T00:00:00");

    return date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short"
    });
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
