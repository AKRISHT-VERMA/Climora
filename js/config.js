// 🌍 Climora Configuration File

const CONFIG = {
  OPENWEATHER_KEY: "fb2bb044df21c744328a878b2bc34e97",

  OPENWEATHER_BASE: "https://api.openweathermap.org/data/2.5",
  OPENWEATHER_GEO: "https://api.openweathermap.org/geo/1.0",

  DEFAULT_UNITS: "metric",
  DEFAULT_LANG: "en",

  AQI_LEVELS: {
    1: "Good",
    2: "Fair",
    3: "Moderate",
    4: "Poor",
    5: "Very Poor",
  },
};

// Make it globally accessible
window.CONFIG = CONFIG;
