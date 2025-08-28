import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { type Context, Hono } from "hono";
import { env } from "hono/adapter";
import { compress } from "hono/compress";
import { createServer } from 'http';
import app from "./hono-entry.js";
import { setupWebSocket } from "./server/websocket-handler.js";

const envs = env<{ NODE_ENV?: string; PORT?: string }>({ env: {} } as unknown as Context<{
  Bindings: { NODE_ENV?: string; PORT?: string };
}>);

const nodeApp = new Hono();

nodeApp.use(compress());

nodeApp.use(
  "/*",
  serveStatic({
    root: `./dist/client/`,
  }),
);

nodeApp.route("/", app as Hono);

const port = envs.PORT ? parseInt(envs.PORT, 10) : 3000;

// Create HTTP server
const server = createServer();

// Setup WebSocket
setupWebSocket(server);

// Handle HTTP requests with Hono
server.on('request', (req, res) => {
  nodeApp.fetch(new Request(`http://${req.headers.host}${req.url}`, {
    method: req.method,
    headers: req.headers as HeadersInit,
    body: req.method !== 'GET' && req.method !== 'HEAD' ? req : null,
  })).then((response) => {
    res.statusCode = response.status;
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });
    if (response.body) {
      response.body.pipeTo(new WritableStream({
        write(chunk) {
          res.write(chunk);
        },
        close() {
          res.end();
        }
      }));
    } else {
      res.end();
    }
  });
});

console.log(`Server with WebSocket support listening on http://localhost:${port}`);
server.listen(port);
