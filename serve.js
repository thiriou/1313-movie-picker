const http = require("http");
const fs = require("fs");
const path = require("path");
const root = __dirname;
const PORT = 3131;
const MIME = {
  ".html": "text/html",
  ".css":  "text/css",
  ".js":   "application/javascript",
  ".png":  "image/png",
  ".jpg":  "image/jpeg",
  ".ico":  "image/x-icon",
};
http.createServer((req, res) => {
  const file = path.join(root, req.url === "/" ? "index.html" : req.url);
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); res.end("not found"); return; }
    res.writeHead(200, { "Content-Type": MIME[path.extname(file)] || "text/plain" });
    res.end(data);
  });
}).listen(PORT, () => console.log("serving on http://localhost:" + PORT));
