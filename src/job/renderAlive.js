import cron from "node-cron";
import axios from "axios";

const RENDER_EXTERNAL_URL = "https://salontap-backend.onrender.com/health";

console.log(`[Cron Job] Render keep-alive job initialized for: ${RENDER_EXTERNAL_URL}`);

cron.schedule("*/10 * * * *", async () => {
  try {
    const response = await axios.get(RENDER_EXTERNAL_URL);
    console.log(`[Cron Job] Ping successful: ${response.data.status || 'OK'}`);
  } catch (err) {
    console.error(`[Cron Job] Ping failed: ${err.message}`);
  }
});