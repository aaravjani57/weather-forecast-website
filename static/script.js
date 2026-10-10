
async function getWeather() {
    const city = document.getElementById("city").value.trim();
    const message = document.getElementById("message");

    if (!city) {
        message.textContent = "Please enter a city name.";
        return;
    }

    message.textContent = "Getting weather...";

    try {
        // Find the city using Open-Meteo geocoding
        const geoUrl = new URL(
            "https://geocoding-api.open-meteo.com/v1/search"
        );

        geoUrl.search = new URLSearchParams({
            name: city,
            count: "1",
            language: "en",
            format: "json"
        });

        const geoResponse = await fetch(geoUrl);
        if (!geoResponse.ok) {
            throw new Error("City search service error");
        }

        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            message.textContent = "City not found. Please try another city.";
            return;
        }

        const place = geoData.results[0];

        // Get current weather and the 7-day forecast directly
        const weatherUrl = new URL(
            "https://api.open-meteo.com/v1/forecast"
        );

        weatherUrl.search = new URLSearchParams({
            latitude: place.latitude,
            longitude: place.longitude,
            current: [
                "temperature_2m",
                "relative_humidity_2m",
                "apparent_temperature",
                "weather_code",
                "wind_speed_10m"
            ].join(","),
            daily: [
                "weather_code",
                "temperature_2m_max",
                "temperature_2m_min",
                "precipitation_probability_max"
            ].join(","),
            forecast_days: "7",
            timezone: "auto"
        });

        const weatherResponse = await fetch(weatherUrl);

        if (weatherResponse.status === 429) {
            message.textContent =
                "Weather service is busy. Please try again later.";
            return;
        }

        if (!weatherResponse.ok) {
            throw new Error("Weather service error");
        }

        const data = await weatherResponse.json();
        const current = data.current;
        const daily = data.daily;

        if (!current || !daily || !daily.time) {
            throw new Error("Incomplete weather data");
        }

        // Display current weather
        document.getElementById("cityName").textContent =
            `${place.name}, ${place.country || ""}`;

        document.getElementById("temperature").textContent =
            `${Math.round(current.temperature_2m)}°C`;

        document.getElementById("humidity").textContent =
            `${current.relative_humidity_2m}%`;

        document.getElementById("wind").textContent =
            `${current.wind_speed_10m} km/h`;

        document.getElementById("feelsLike").textContent =
            `${Math.round(current.apparent_temperature)}°C`;

        document.getElementById("condition").textContent =
            getWeatherCondition(current.weather_code);

        document.getElementById("weatherIcon").textContent =
            getWeatherIcon(current.weather_code);

        // Prepare and display the 7-day forecast
        const forecast = daily.time.map((date, i) => ({
            date: date,
            weather_code: daily.weather_code[i],
            max_temperature: daily.temperature_2m_max[i],
            min_temperature: daily.temperature_2m_min[i],
            rain_probability:
                daily.precipitation_probability_max?.[i] ?? 0
        }));

        displayForecast(forecast);
        message.textContent = "";

    } catch (error) {
        console.error("Weather error:", error);
        message.textContent =
            "Could not get weather data. Please try again later.";
    }
}

function displayForecast(forecast) {
    const container = document.getElementById("forecast");
    container.innerHTML = "";

    forecast.forEach((day, index) => {
        const card = document.createElement("div");
        card.className = "forecast-card";

        const dayName = index === 0
            ? "Today"
            : new Date(day.date + "T00:00:00").toLocaleDateString(
                "en-US",
                { weekday: "short" }
            );

        card.innerHTML = `
            <h3>${dayName}</h3>
            <p class="forecast-date">${formatDate(day.date)}</p>
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
            <p class="rain">🌧️ ${day.rain_probability}% rain</p>
        `;

        container.appendChild(card);
    });
}

function formatDate(dateString) {
    return new Date(dateString + "T00:00:00").toLocaleDateString(
        "en-US",
        { day: "numeric", month: "short" }
    );
}

function getWeatherCondition(code) {
    if (code === 0) return "Clear sky";
    if (code >= 1 && code <= 3) return "Cloudy";
    if (code === 45 || code === 48) return "Foggy";
    if (code >= 51 && code <= 57) return "Drizzle";
    if (code >= 61 && code <= 67) return "Rain";
    if (code >= 71 && code <= 77) return "Snow";
    if (code >= 80 && code <= 82) return "Rain showers";
    if (code === 85 || code === 86) return "Snow showers";
    if (code >= 95) return "Thunderstorm";
    return "Unknown";
}

function getWeatherIcon(code) {
    if (code === 0) return "☀️";
    if (code === 1 || code === 2) return "⛅";
    if (code === 3) return "☁️";
    if (code === 45 || code === 48) return "🌫️";
    if (code >= 51 && code <= 57) return "🌦️";
    if (code >= 61 && code <= 67) return "🌧️";
    if (code >= 71 && code <= 77) return "❄️";
    if (code >= 80 && code <= 82) return "🌦️";
    if (code === 85 || code === 86) return "🌨️";
    if (code >= 95) return "⛈️";
    return "🌤️";
}
