# =========================
# GAMEHUB - NITRO EDITION
# =========================
# This file is the ENGINE.
# Touch it carefully.
# Rev it aggressively.

from flask import Flask, request, redirect, url_for, session
import os
import time
import random

app = Flask(__name__)
app.secret_key = "dev-secret-change-later"  # ignition key (replace later)

# =========================
# AUTO BUILD FOLDERS
# =========================
# Like a car that assembles itself in the garage

FOLDERS = [
    "templates",
    "static",
    "static/css",
    "static/js",
    "static/images"
]

for folder in FOLDERS:
    os.makedirs(folder, exist_ok=True)
    print(f"🛠️ Built folder: {folder}")

print("🔑 Ignition on...")

# =========================
# FAKE DATABASE (LOCAL)
# =========================
# This is a test engine, not the final race engine

USERS = {}        # username -> data
LOBBIES = {}      # lobby_id -> players

# =========================
# COOLDOWN SYSTEM
# =========================
# Prevent button mashing like a broken throttle

def cooldown(key, seconds):
    now = time.time()
    last = session.get(key, 0)
    if now - last < seconds:
        return False
    session[key] = now
    return True

# =========================
# HOME
# =========================
@app.route("/")
def home():
    if "user" not in session:
        return redirect("/login")

    user = USERS.get(session["user"])
    return f"""
    <h1>🏎️ GAMEHUB</h1>
    <p>Driver: {user['username']}</p>
    <p>XP: {user['xp']}</p>

    <a href='/lobby'>🚦 Enter Lobby</a><br>
    <a href='/insane'>😈 INSANE‑GEN MODE</a><br>
    <a href='/logout'>🛑 Logout</a>
    """

# =========================
# LOGIN
# =========================
@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form.get("username")

        if not username:
            return "❌ No driver name? Car won’t start."

        if username not in USERS:
            USERS[username] = {
                "username": username,
                "xp": 0,
                "rank": 1000
            }
            print(f"👤 New driver registered: {username}")

        session["user"] = username
        return redirect("/")

    return """
    <h2>🔑 LOGIN</h2>
    <form method="post">
        <input name="username" placeholder="Driver name">
        <button>START ENGINE</button>
    </form>
    """

# =========================
# LOGOUT
# =========================
@app.route("/logout")
def logout():
    session.clear()
    return redirect("/login")

# =========================
# LOBBY SYSTEM
# =========================
@app.route("/lobby")
def lobby():
    if "user" not in session:
        return redirect("/login")

    user = session["user"]

    # Find or create lobby
    for lid, players in LOBBIES.items():
        if len(players) < 4:
            players.append(user)
            return f"🚦 Joined lobby {lid}<br>Players: {players}"

    lobby_id = str(random.randint(1000, 9999))
    LOBBIES[lobby_id] = [user]

    return f"🚦 Created lobby {lobby_id}<br>Players: {LOBBIES[lobby_id]}"

# =========================
# XP SYSTEM
# =========================
@app.route("/race_win")
def race_win():
    if "user" not in session:
        return redirect("/login")

    if not cooldown("race_win", 5):
        return "🛑 Cooldown active. Let the engine cool."

    USERS[session["user"]]["xp"] += 50
    return "🏁 WIN! +50 XP (nitro smells amazing)"

# =========================
# INSANE‑GEN MODE
# =========================
@app.route("/insane")
def insane():
    if "user" not in session:
        return redirect("/login")

    if not cooldown("insane", 10):
        return "😤 Too insane. Even nitro needs a break."

    bonus = random.randint(100, 300)
    USERS[session["user"]]["xp"] += bonus

    return f"""
    😈 INSANE‑GEN MODE ACTIVATED 😈<br>
    Gravity disabled ❌<br>
    Speedometer says: WHAT THE HELL ❓<br>
    Nitro x5 🔥🔥🔥🔥🔥<br>
    +{bonus} XP<br>
    """

# =========================
# RUN
# =========================
if __name__ == "__main__":
    print("🏎️ Engine running at http://127.0.0.1:5000")
    app.run(debug=True)
