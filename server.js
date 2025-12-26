const express = require("express");
const cors = require("cors");
const { startScheduler } = require("./services/scheduler");
const { probeMarketData } = require("./services/engine/dataProbe");

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api", require("./routes/auth"));
app.use("/api", require("./routes/licenses"));
app.use("/api", require("./routes/signal"));
app.use("/api", require("./routes/history"));
app.use("/admin", require("./routes/admin"));
app.use("/admin", require("./routes/adminLicenses"));

// Start engine
startScheduler();

// 🔍 ONE-TIME DATA CHECK (safe)
probeMarketData().catch(console.error);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🚀 GOLD FX PRO API running on port", PORT);
});
