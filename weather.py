import requests


def get_weather(city):
    # Step 1: Find the latitude and longitude of the city
    geocoding_url = "https://geocoding-api.open-meteo.com/v1/search"

    geocoding_params = {
        "name": city,
        "count": 1,
        "language": "en",
        "format": "json"
    }

    location_response = requests.get(
        geocoding_url,
        params=geocoding_params
    )

    location_data = location_response.json()

    # Check whether the city was found
    if "results" not in location_data:
        return None

    location = location_data["results"][0]

    latitude = location["latitude"]
    longitude = location["longitude"]

    city_name = location["name"]
    country = location.get("country", "")

    # Step 2: Get current weather + 7-day forecast
    weather_url = "https://api.open-meteo.com/v1/forecast"

    weather_params = {
        "latitude": latitude,
        "longitude": longitude,

        "current": "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m",

        "daily": "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",

        "forecast_days": 7,

        "timezone": "auto"
    }

    weather_response = requests.get(
        weather_url,
        params=weather_params
    )

    weather_data = weather_response.json()

    current = weather_data["current"]
    daily = weather_data["daily"]

    # Step 3: Create the 7-day forecast
    forecast = []

    for i in range(7):
        forecast.append({
            "date": daily["time"][i],
            "weather_code": daily["weather_code"][i],
            "max_temperature": daily["temperature_2m_max"][i],
            "min_temperature": daily["temperature_2m_min"][i],
            "rain_probability": daily["precipitation_probability_max"][i]
        })

    # Step 4: Return all weather information
    return {
        "city": city_name,
        "country": country,

        "temperature": current["temperature_2m"],
        "humidity": current["relative_humidity_2m"],
        "feels_like": current["apparent_temperature"],
        "wind_speed": current["wind_speed_10m"],
        "weather_code": current["weather_code"],

        "forecast": forecast
    }
