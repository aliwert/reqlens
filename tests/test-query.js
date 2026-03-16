const http = require("http");

console.log("Sending request with LONG query string...\n");

const longQuery =
  "search=very_long_search_term_that_is_extremely_descriptive_and_should_test_responsive_layout&filter=status_active_and_verified&sort=date_descending&limit=100&offset=50&fields=id,name,email,phone,address,city,state,zip";

http
  .get(`http://localhost:3000/users?${longQuery}`, (res) => {
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
