const Weather = {
  // 🔍 Search city/location
  async searchLocation(query) {
    const url = `${CONFIG.OPENWEATHER_GEO}/direct?q=${encodeURIComponent(query)}&limit=5&appid=${CONFIG.OPENWEATHER_KEY}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Location search failed");

    const data = await res.json();
    return data.map((r) => ({
      name: r.name,
      country: r.country,
      state: r.state || "",
      lat: r.lat,
      lon: r.lon,
      display: `${r.name}${r.state ? ", " + r.state : ""}, ${r.country}`,
    }));
  },

  // 🌤️ Current Weather
  async getCurrent(lat, lon) {
    const url = `${CONFIG.OPENWEATHER_BASE}/weather?lat=${lat}&lon=${lon}&units=${CONFIG.DEFAULT_UNITS}&appid=${CONFIG.OPENWEATHER_KEY}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Weather fetch failed");

    const d = await res.json();
    return {
      temp: Math.round(d.main.temp),
      feels_like: Math.round(d.main.feels_like),
      humidity: d.main.humidity,
      pressure: d.main.pressure,
      weather: d.weather[0].main,
      description: d.weather[0].description,
      icon: d.weather[0].icon,
      wind_speed: d.wind.speed,
      visibility: d.visibility ? Math.round(d.visibility / 1000) : null,
      name: d.name,
      country: d.sys.country,
    };
  },

  // 📊 5-day forecast (for averages)
  async getForecast(lat, lon) {
    const url = `${CONFIG.OPENWEATHER_BASE}/forecast?lat=${lat}&lon=${lon}&units=${CONFIG.DEFAULT_UNITS}&appid=${CONFIG.OPENWEATHER_KEY}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Forecast fetch failed");

    const d = await res.json();
    return d.list.map((item) => ({
      dt: item.dt_txt,
      temp: Math.round(item.main.temp),
      humidity: item.main.humidity,
      weather: item.weather[0].main,
    }));
  },

  // 🌫️ Air Quality (OpenWeather)
  async getAirQuality(lat, lon) {
    const url = `${CONFIG.OPENWEATHER_BASE}/air_pollution?lat=${lat}&lon=${lon}&appid=${CONFIG.OPENWEATHER_KEY}`;

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("AQI fetch failed");

      const data = await res.json();
      const aqi = data.list[0].main.aqi;

      return {
        aqi,
        level: CONFIG.AQI_LEVELS[aqi] || "Unknown",
      };
    } catch {
      return { aqi: null, level: "Unavailable" };
    }
  },

  // ☀️ UV Index (Optional)
  async getUVIndex(lat, lon) {
    const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,daily,alerts&appid=${CONFIG.OPENWEATHER_KEY}`;

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error();

      const d = await res.json();
      const uvi = d.current?.uvi ?? null;

      return { uvi, level: this._uviLevel(uvi) };
    } catch {
      return { uvi: null, level: "Unavailable" };
    }
  },

  // 🔥 Full Profile (ALL DATA)
  async getFullProfile(lat, lon) {
    const [current, aq, uv, forecast] = await Promise.all([
      this.getCurrent(lat, lon),
      this.getAirQuality(lat, lon),
      this.getUVIndex(lat, lon),
      this.getForecast(lat, lon),
    ]);

    const avgTemp = Math.round(
      forecast.reduce((s, f) => s + f.temp, 0) / forecast.length,
    );

    const avgHumidity = Math.round(
      forecast.reduce((s, f) => s + f.humidity, 0) / forecast.length,
    );

    return {
      ...current,
      aqi: aq.aqi,
      aqi_level: aq.level,
      uvi: uv.uvi,
      uvi_level: uv.level,
      avg_temp: avgTemp,
      avg_humidity: avgHumidity,
      lat,
      lon,
    };
  },

  // 📍 Reverse Geocode
  async reverseGeocode(lat, lon) {
    const url = `${CONFIG.OPENWEATHER_GEO}/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${CONFIG.OPENWEATHER_KEY}`;

    const res = await fetch(url);
    const data = await res.json();

    if (!data.length) return "Your Location";
    return `${data[0].name}, ${data[0].country}`;
  },

  // 🌫️ AQI helper (for fallback)
  _aqiLevel(aqi) {
    if (aqi === null) return "Unavailable";
    return CONFIG.AQI_LEVELS[aqi] || "Unknown";
  },

  // ☀️ UV helper
  _uviLevel(uvi) {
    if (uvi === null) return "Unavailable";
    if (uvi <= 2) return "Low";
    if (uvi <= 5) return "Moderate";
    if (uvi <= 7) return "High";
    if (uvi <= 10) return "Very High";
    return "Extreme";
  },
};
