const http = require("http");

console.log("Sending POST request...\n");

const data = JSON.stringify({ name: "Zeynep" });

const options = {
  hostname: "localhost",
  port: 3000,
  path: "/users",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": data.length,
  },
};

const req = http.request(options, (res) => {
  let body = "";
  res.on("data", (chunk) => (body += chunk));
  res.on("end", () => {
    console.log("Response status:", res.statusCode);
    console.log("Response:", body);
  });
});

req.on("error", (err) => console.error("Error:", err.message));
req.write(data);
req.end();
