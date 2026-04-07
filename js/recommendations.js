const Recommendations = {
  generate(result) {
    const tips = [];
    const { diffs, dest } = result;

    // Temperature
    if (diffs.temperature) {
      const { diff } = diffs.temperature;

      if (diff > 8) {
        tips.push({
          icon: "🌡️",
          category: "Temperature",
          title: "Warmer destination",
          text: "Pack light, breathable clothing. Stay in shade during peak hours (11am–3pm) and drink extra water.",
        });
      } else if (diff < -8) {
        tips.push({
          icon: "🧥",
          category: "Temperature",
          title: "Colder destination",
          text: "Layer clothing properly. Protect extremities and consume warm fluids.",
        });
      } else if (Math.abs(diff) > 4) {
        tips.push({
          icon: "🌤️",
          category: "Temperature",
          title: "Mild temperature shift",
          text: "Carry a light jacket as conditions may feel different.",
        });
      }
    }

    // Humidity
    if (diffs.humidity) {
      const { dest: destH } = diffs.humidity;

      if (destH > 75) {
        tips.push({
          icon: "💧",
          category: "Humidity",
          title: "High humidity",
          text: "Wear breathable clothes and stay hydrated. Avoid heavy outdoor activity.",
        });
      } else if (destH < 30) {
        tips.push({
          icon: "🏜️",
          category: "Dry air",
          title: "Low humidity",
          text: "Use moisturizer and stay hydrated to prevent dryness.",
        });
      }
    }

    // AQI
    if (diffs.aqi && dest.aqi != null) {
      if (dest.aqi >= 4) {
        tips.push({
          icon: "😷",
          category: "Air Quality",
          title: "Poor air quality",
          text: "Wear a mask outdoors and avoid heavy activity.",
        });
      } else if (dest.aqi === 3) {
        tips.push({
          icon: "🌬️",
          category: "Air Quality",
          title: "Moderate air quality",
          text: "Sensitive individuals should limit outdoor exposure.",
        });
      }
    }

    // UV
    if (diffs.uvi && dest.uvi != null) {
      if (dest.uvi >= 8) {
        tips.push({
          icon: "☀️",
          category: "UV Protection",
          title: "Very high UV",
          text: "Use SPF 50+, sunglasses, and avoid midday sun.",
        });
      } else if (dest.uvi >= 6) {
        tips.push({
          icon: "🕶️",
          category: "UV Protection",
          title: "High UV",
          text: "Use sunscreen and protective eyewear.",
        });
      }
    }

    // General
    tips.push({
      icon: "🛌",
      category: "Adjustment",
      title: "Acclimatization",
      text: "Give your body time to adjust. Avoid heavy activity initially.",
    });

    tips.push({
      icon: "💊",
      category: "Essentials",
      title: "Travel kit",
      text: "Carry basic medicines, electrolytes, and personal prescriptions.",
    });

    // High risk
    if (result.level === "high") {
      tips.push({
        icon: "📋",
        category: "High Risk",
        title: "Significant change",
        text: "Monitor your condition closely and rest if needed.",
      });
    }

    return tips;
  },
};
