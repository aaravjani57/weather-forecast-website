
import requests
import time

weather_cache = {}
CACHE_DURATION = 600


def get_weather(city):
    cache_key = city.strip().lower()

    # Return cached weather if it is still fresh
    cached = weather_cache.get(cache_key)
    if cached and time.time() - cached["time"] < CACHE_DURATION:
        return cached["data"]

    try:
        # Step 1: Find the city coordinates
        geocoding_url = "https://geocoding-api.open-meteo.com/v1/search"

        geocoding_params = {
            "name": city.strip(),
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
            print("City not found:", city)
            return None

        location = location_data["results"][0]
        latitude = location["latitude"]
        longitude = location["longitude"]
        city_name = location["name"]
        country = location.get("country", "")

        # Step 2: Get current weather and 7-day forecast
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

        if "current" not in weather_data or "daily" not in weather_data:
            print("Unexpected weather API response:", weather_data)
            return None

        current = weather_data["current"]
        daily = weather_data["daily"]

        # Step 3: Prepare the 7-day forecast
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

        # Step 4: Prepare the final result
        result = {
            "city": city_name,
            "country": country,
            "temperature": current["temperature_2m"],
            "humidity": current["relative_humidity_2m"],
            "feels_like": current["apparent_temperature"],
            "wind_speed": current["wind_speed_10m"],
            "weather_code": current["weather_code"],
            "forecast": forecast
        }

        # Step 5: Cache successful results for 10 minutes
        weather_cache[cache_key] = {
            "time": time.time(),
            "data": result
        }

        return result

    except requests.HTTPError as error:
        if error.response is not None and error.response.status_code == 429:
            print("Open-Meteo rate limit reached. Try again later.")
            return None

        print("Weather HTTP error:", error)
        return None

    except (requests.RequestException, ValueError, KeyError, TypeError) as error:
        print("Weather error:", error)
        return None
