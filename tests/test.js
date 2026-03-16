const express = require("express");

try {
  const { reqlens } = require("../dist/index.js");
  const app = express();

  // Responsive test - show query string in logs
  app.use(reqlens({ showQuery: true }));

  app.get("/users", (req, res) => {
    res.json({ users: ["Ali", "Mert", "Erdogan"] });
  });

  const PORT = 3000;
  app.listen(PORT, () => {
    console.log(`✓ Test server started on port ${PORT}\n`);
    console.log("Test commands:");
    console.log("  Long query: node test-query.js");
    console.log("\n");
  });
} catch (err) {
  console.error("❌ Error:", err.message);
  console.error(err.stack);
}
