const Comparison = {
  //  Compare two climate profiles
  compare(home, dest) {
    const diffs = {};

    //  Temperature
    const tempDiff = dest.temp - home.temp;
    diffs.temperature = {
      home: home.temp,
      dest: dest.temp,
      diff: tempDiff,
      label: "Temperature (°C)",
      risk: this._tempRisk(Math.abs(tempDiff)),
    };

    //  Humidity
    const humDiff = dest.humidity - home.humidity;
    diffs.humidity = {
      home: home.humidity,
      dest: dest.humidity,
      diff: humDiff,
      label: "Humidity (%)",
      risk: this._humidityRisk(Math.abs(humDiff)),
    };

    //  AQI (safe check)
    if (home.aqi != null && dest.aqi != null) {
      const aqiDiff = dest.aqi - home.aqi;
      diffs.aqi = {
        home: home.aqi,
        dest: dest.aqi,
        diff: aqiDiff,
        label: "Air Quality Index",
        risk: this._aqiRisk(dest.aqi),
      };
    }

    //  UV Index (safe check)
    if (home.uvi != null && dest.uvi != null) {
      const uviDiff = dest.uvi - home.uvi;
      diffs.uvi = {
        home: home.uvi,
        dest: dest.uvi,
        diff: uviDiff,
        label: "UV Index",
        risk: this._uviRisk(dest.uvi),
      };
    }

    //  Final Score
    const score = this._computeScore(diffs);
    const { level, label, color } = this._scoreLevel(score);

    return {
      diffs,
      score,
      level,
      label,
      color,
      home,
      dest,
    };
  },

  // ===== RISK CALCULATIONS =====

  _tempRisk(diff) {
    if (diff <= 5) return "low";
    if (diff <= 12) return "medium";
    return "high";
  },

  _humidityRisk(diff) {
    if (diff <= 15) return "low";
    if (diff <= 30) return "medium";
    return "high";
  },

  _aqiRisk(aqi) {
    if (aqi <= 2) return "low"; // OpenWeather scale (1–5)
    if (aqi <= 3) return "medium";
    return "high";
  },

  _uviRisk(uvi) {
    if (uvi <= 3) return "low";
    if (uvi <= 7) return "medium";
    return "high";
  },

  _riskNum(r) {
    return { low: 1, medium: 2, high: 3 }[r] || 1;
  },

  // ===== SCORE ENGINE =====

  _computeScore(diffs) {
    const weights = {
      temperature: 30,
      humidity: 20,
      aqi: 30,
      uvi: 20,
    };

    let total = 0;
    let weightSum = 0;

    for (const [key, val] of Object.entries(diffs)) {
      const w = weights[key] || 20;
      total += this._riskNum(val.risk) * w;
      weightSum += w;
    }

    if (weightSum === 0) return 0;

    const raw = total / weightSum;

    // Convert 1–3 → 0–100
    return Math.round(((raw - 1) / 2) * 100);
  },

  _scoreLevel(score) {
    if (score < 35) {
      return { level: "low", label: "Low Risk", color: "#2d6a4f" };
    }

    if (score < 65) {
      return { level: "medium", label: "Moderate Risk", color: "#e07b39" };
    }

    return { level: "high", label: "High Risk", color: "#c0392b" };
  },
};
