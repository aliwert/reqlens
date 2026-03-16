const http = require("http");

console.log("Sending GET request...\n");

http
  .get("http://localhost:3000/users", (res) => {
    let data = "";
    res.on("data", (chunk) => (data += chunk));
    res.on("end", () => {
      console.log("Response status:", res.statusCode);
      console.log("Response:", data);
    });
  })
  .on("error", (err) => {
    console.error("Connection error:", err.message);
  });
