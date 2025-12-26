const express = require("express");
const cors = require("cors");

// 🚀 Scheduler
const { startScheduler } = require("./services/scheduler");

const app = express();

app.use(cors());
app.use(express.json());

// ─────────────────────────────────────
// ROUTES
// ─────────────────────────────────────
app.use("/api", require("./routes/auth"));
app.use("/api", require("./routes/licenses"));
app.use("/api", require("./routes/signal"));
app.use("/api", require("./routes/history"));

app.use("/admin", require("./routes/admin"));
app.use("/admin", require("./routes/adminLicenses"));

// ─────────────────────────────────────
// START STRATEGY SCHEDULER (ONCE)
// ─────────────────────────────────────
startScheduler();

// ─────────────────────────────────────
// SERVER
// ─────────────────────────────────────
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 GOLD FX PRO API running on port", PORT);
});
