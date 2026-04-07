const Auth = {
  //  Signup
  signup(name, email, password) {
    const users = this._getUsers();

    if (users.find((u) => u.email === email)) {
      return { ok: false, msg: "Email already registered." };
    }

    const user = {
      id: "u_" + Date.now(),
      name,
      email,
      password: btoa(password), // simple encoding
      homeLocation: null,
      emergencyContacts: [],
      createdAt: new Date().toISOString(),
    };

    users.push(user);
    localStorage.setItem("climora_users", JSON.stringify(users));

    this._setSession(user);

    return { ok: true, user };
  },

  //  Login
  login(email, password) {
    const users = this._getUsers();

    const user = users.find(
      (u) => u.email === email && u.password === btoa(password),
    );

    if (!user) {
      return { ok: false, msg: "Invalid email or password." };
    }

    this._setSession(user);

    return { ok: true, user };
  },

  //  Logout
  logout() {
    localStorage.removeItem("climora_session");
    window.location.href = "login.html";
  },

  //  Current user
  current() {
    const s = localStorage.getItem("climora_session");
    return s ? JSON.parse(s) : null;
  },

  // Protect pages
  require() {
    const user = this.current();

    if (!user) {
      window.location.href = "login.html";
      return null;
    }

    return user;
  },

  //  Update user
  update(updates) {
    const session = this.current();
    if (!session) return;

    const users = this._getUsers();
    const idx = users.findIndex((u) => u.id === session.id);
    if (idx === -1) return;

    const updated = { ...users[idx], ...updates };
    users[idx] = updated;

    localStorage.setItem("climora_users", JSON.stringify(users));
    this._setSession(updated);

    return updated;
  },

  // Redirect if already logged in
  redirectIfLoggedIn() {
    if (this.current()) {
      window.location.href = "dashboard.html";
    }
  },

  // ===== PRIVATE =====

  _getUsers() {
    return JSON.parse(localStorage.getItem("climora_users") || "[]");
  },

  _setSession(user) {
    const { password, ...safe } = user;
    localStorage.setItem("climora_session", JSON.stringify(safe));
  },
};

//  Global access
window.Auth = Auth;
