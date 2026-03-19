import NodeCache from "node-cache";

// 🔹 Initialize cache (default TTL: 10 minutes, periodic check every hour)
const cache = new NodeCache({ stdTTL: 600, checkperiod: 3600 });

export default cache;
