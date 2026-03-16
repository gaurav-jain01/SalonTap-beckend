import cron from "node-cron";
import axios from "axios";

cron.schedule("*/10 * * * *", async () => {
  try {
    await axios.get("https://salontap-backend.onrender.com/health");
    console.log("Ping sent to keep server awake");
  } catch (err) {
    console.log("Ping failed:", err.message);
  }
});