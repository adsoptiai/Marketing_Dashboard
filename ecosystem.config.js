module.exports = {
  apps: [
    {
      name: "yt-dashboard",
      script: "C:\\Users\\MIYABI\\AppData\\Local\\Programs\\Python\\Launcher\\py.exe",
      args: ["-m", "streamlit", "run", "app.py", "--server.port", "8501", "--server.headless", "true"],
      cwd: "C:\\Users\\MIYABI\\Desktop\\08_AI_Agent\\YT_Shorst_Dashboard",
      interpreter: "none",
      autorestart: true,
      watch: false,
    }
  ]
};
