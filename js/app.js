// ===== TOAST NOTIFICATIONS =====
const Toast = {
  show(msg, type = "", duration = 3000) {
    let container = document.getElementById("toast-container");

    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = msg;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transition = "opacity 0.4s";
      setTimeout(() => toast.remove(), 400);
    }, duration);
  },

  success(msg) {
    this.show(msg, "success");
  },

  error(msg) {
    this.show(msg, "error");
  },

  warn(msg) {
    this.show(msg, "warn");
  },
};

// ===== NAVBAR SETUP =====
function setupNavbar() {
  const ham = document.querySelector(".hamburger");
  const links = document.querySelector(".nav-links");

  if (ham && links) {
    ham.addEventListener("click", () => links.classList.toggle("open"));
  }

  const current = window.location.pathname.split("/").pop() || "index.html";

  document.querySelectorAll(".nav-links a").forEach((a) => {
    const href = a.getAttribute("href");
    if (href === current) a.classList.add("active");
  });

  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn && typeof Auth !== "undefined") {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      Auth.logout();
    });
  }
}

// ===== USER LOCATION =====
async function detectLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject("Geolocation not supported");

    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        }),
      () => reject("Permission denied or unavailable"),
    );
  });
}

// ===== LOCATION AUTOCOMPLETE =====
function attachLocationSearch(inputEl, onSelect) {
  let dropdown = null;
  let debounceTimer = null;

  inputEl.addEventListener("input", () => {
    clearTimeout(debounceTimer);

    const q = inputEl.value.trim();

    if (q.length < 3) {
      removeDropdown();
      return;
    }

    debounceTimer = setTimeout(async () => {
      try {
        const results = await Weather.searchLocation(q);
        showDropdown(results);
      } catch (err) {
        console.error("Search error:", err);
        removeDropdown();
      }
    }, 400);
  });

  function showDropdown(results) {
    removeDropdown();
    if (!results.length) return;

    dropdown = document.createElement("ul");
    dropdown.className = "location-dropdown";

    dropdown.style.cssText = `
      position:absolute; top:100%; left:0; right:0;
      background:white; border:1px solid var(--border);
      border-radius:var(--radius-sm); box-shadow:var(--shadow);
      list-style:none; padding:4px; z-index:50; margin-top:4px;
    `;

    results.forEach((r) => {
      const li = document.createElement("li");
      li.textContent = r.display;

      li.style.cssText = `
        padding:8px 12px; border-radius:6px; cursor:pointer;
        font-size:0.875rem; transition:background 0.15s;
      `;

      li.addEventListener("mouseenter", () => {
        li.style.background = "var(--bg)";
      });

      li.addEventListener("mouseleave", () => {
        li.style.background = "";
      });

      li.addEventListener("click", () => {
        inputEl.value = r.display;
        removeDropdown();
        onSelect(r);
      });

      dropdown.appendChild(li);
    });

    const wrap = inputEl.parentElement;
    if (wrap.style.position !== "relative") {
      wrap.style.position = "relative";
    }

    wrap.appendChild(dropdown);
  }

  function removeDropdown() {
    if (dropdown) {
      dropdown.remove();
      dropdown = null;
    }
  }

  document.addEventListener("click", (e) => {
    if (
      !inputEl.contains(e.target) &&
      dropdown &&
      !dropdown.contains(e.target)
    ) {
      removeDropdown();
    }
  });
}

// ===== RISK BADGE =====
function riskBadge(level) {
  const map = {
    low: ["Low Risk", "badge-low"],
    medium: ["Moderate Risk", "badge-medium"],
    high: ["High Risk", "badge-high"],
  };

  const [text, cls] = map[level] || ["Unknown", "badge-info"];

  return `<span class="badge ${cls}">${text}</span>`;
}

// ===== WEATHER ICON =====
function weatherEmoji(condition) {
  const map = {
    Clear: "☀️",
    Clouds: "☁️",
    Rain: "🌧️",
    Drizzle: "🌦️",
    Thunderstorm: "⛈️",
    Snow: "🌨️",
    Mist: "🌫️",
    Fog: "🌁",
    Haze: "😶‍🌫️",
  };

  return map[condition] || "🌤️";
}

// ===== SAVE TRIP =====
function saveTripToHistory(homeData, destData, result) {
  if (typeof Auth === "undefined") return;

  const user = Auth.current();
  if (!user) return;

  const history = JSON.parse(
    localStorage.getItem(`climora_history_${user.id}`) || "[]",
  );

  history.unshift({
    id: "t_" + Date.now(),
    date: new Date().toISOString(),
    home: { name: homeData.name, country: homeData.country },
    dest: { name: destData.name, country: destData.country },
    risk: result.level,
    score: result.score,
  });

  localStorage.setItem(
    `climora_history_${user.id}`,
    JSON.stringify(history.slice(0, 20)),
  );
}

// ===== GET HISTORY =====
function getTripHistory() {
  if (typeof Auth === "undefined") return [];

  const user = Auth.current();
  if (!user) return [];

  return JSON.parse(localStorage.getItem(`climora_history_${user.id}`) || "[]");
}

// ===== FORMAT DATE =====
function fmtDate(iso) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ===== INIT =====
document.addEventListener("DOMContentLoaded", setupNavbar);
