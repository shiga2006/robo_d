# How to Run the App (No Database Required)

Good news! You don't need to install anything extra. The app now saves data to a local file (`server/data.json`) automatically.

### Step 1: Start the Backend Server
This handles saving your maps and images.

1. Open a terminal.
2. Go to the project folder:
   ```cmd
   cd C:\Users\livin\bot-beacon-central
   ```
3. Start the server:
   ```cmd
   node server/index.js
   ```
   > You should see: `📦 Using Local JSON Storage` and `🚀 Server running...`

### Step 2: Start the Frontend
This is the dashboard you see in the browser.

1. Open **another** terminal (keep the first one running!).
2. Go to project folder:
   ```cmd
   cd C:\Users\livin\bot-beacon-central
   ```
3. Start the UI:
   ```cmd
   npm run dev
   ```
   > Open `http://localhost:8080` (or `5173`) in your browser.

---

### FAQ
- **Where are my maps saved?**
  - Data: `server/data.json`
  - Images: `server/uploads/` folder.
- **"Upload Failed"?**
  - Make sure the **Backend Server** (Step 1) is running.
