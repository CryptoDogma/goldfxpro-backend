const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api", require("./routes/auth"));
app.use("/api", require("./routes/licenses"));
app.use("/admin", require("./routes/admin"));
app.use("/api", require("./routes/signal"));
app.use("/api", require("./routes/history"));
app.use("/api", require("./routes/license"));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("GOLD FX PRO API running on port", PORT);
});




