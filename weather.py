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

    # Step 2: Get the current weather
    weather_url = "https://api.open-meteo.com/v1/forecast"

    weather_params = {
        "latitude": latitude,
        "longitude": longitude,
        "current": "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m",
        "timezone": "auto"
    }

    weather_response = requests.get(
        weather_url,
        params=weather_params
    )

    weather_data = weather_response.json()

    current = weather_data["current"]

    # Step 3: Return the information we need
    return {
        "city": city_name,
        "country": country,
        "temperature": current["temperature_2m"],
        "humidity": current["relative_humidity_2m"],
        "feels_like": current["apparent_temperature"],
        "wind_speed": current["wind_speed_10m"],
        "weather_code": current["weather_code"]
    }