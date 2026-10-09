from flask import Flask, render_template, request, jsonify
from weather import get_weather

app = Flask(__name__)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/weather")
def weather():
    city = request.args.get("city", "").strip()

    if not city:
        return jsonify({"error": "Please enter a city name."})

    try:
        data = get_weather(city)

        if data is None:
            return jsonify({"error": "City not found."})

        return jsonify(data)

    except Exception as error:
        print("Error:", error)
        return jsonify({"error": "Unable to get weather data."})


if __name__ == "__main__":
    app.run(debug=True)
    
