
import requests


def get_weather(city):
    try:
        # Step 1: Find the city
        geocoding_url = "https://geocoding-api.open-meteo.com/v1/search"

        geocoding_params = {
            "name": city,
            "count": 1,
            "language": "en",
            "format": "json"
        }

        location_response = requests.get(
            geocoding_url,
            params=geocoding_params,
            timeout=20
        )
        location_response.raise_for_status()
        location_data = location_response.json()

        if not location_data.get("results"):
            return None

        location = location_data["results"][0]

        latitude = location["latitude"]
        longitude = location["longitude"]

        city_name = location["name"]
        country = location.get("country", "")

        # Step 2: Request current weather and 7-day forecast
        weather_url = "https://api.open-meteo.com/v1/forecast"

        weather_params = {
            "latitude": latitude,
            "longitude": longitude,
            "current": (
                "temperature_2m,relative_humidity_2m,"
                "apparent_temperature,weather_code,wind_speed_10m"
            ),
            "daily": (
                "weather_code,temperature_2m_max,"
                "temperature_2m_min,precipitation_probability_max"
            ),
            "forecast_days": 7,
            "timezone": "auto"
        }

        weather_response = requests.get(
            weather_url,
            params=weather_params,
            timeout=20
        )
        weather_response.raise_for_status()
        weather_data = weather_response.json()

        # Check the API response before using its data
        if "current" not in weather_data or "daily" not in weather_data:
            print("Open-Meteo response:", weather_data)
            raise ValueError(
                "Weather API response is missing current or daily data."
            )

        current = weather_data["current"]
        daily = weather_data["daily"]

        # Step 3: Create the 7-day forecast
        forecast = []

        for i in range(len(daily["time"])):
            forecast.append({
                "date": daily["time"][i],
                "weather_code": daily["weather_code"][i],
                "max_temperature": daily["temperature_2m_max"][i],
                "min_temperature": daily["temperature_2m_min"][i],
                "rain_probability": (
                    daily["precipitation_probability_max"][i]
                )
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

    except (requests.RequestException, ValueError, KeyError) as error:
        print("Weather error:", error)
        return None
