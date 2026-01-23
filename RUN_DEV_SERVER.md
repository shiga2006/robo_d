# Instructions for Running the Dev Server

Since PowerShell script execution is restricted on your system, use one of these methods:

## Option 1: PowerShell Bypass (Recommended)

Open PowerShell as Administrator and run:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
cd C:\Users\livin\bot-beacon-central
npm run dev
```

## Option 2: Use npx directly

```powershell
cd C:\Users\livin\bot-beacon-central
npx vite
```

## Option 3: Use Command Prompt (cmd)

```cmd
cd C:\Users\livin\bot-beacon-central
npm run dev
```

The dev server should start at http://localhost:5173
