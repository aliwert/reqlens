try {
  console.log("Loading module...");
  const mod = require("../dist/index.js");
  console.log("✓ Module loaded:");
  console.log("  - reqlens exported:", typeof mod.reqlens);
  console.log("  - default exported:", typeof mod.default);

  // Middleware test
  console.log("\n✓ Creating middleware...");
  const middleware = mod.reqlens();
  console.log("✓ Middleware created:", typeof middleware);
} catch (e) {
  console.error("\n❌ ERROR:", e.message);
  console.error(e.stack);
}
