import "dotenv/config";
import { createServer } from "node:http";
import { dbMiddleware } from "./db-middleware";
import { vikeHandler } from "./vike-handler";
import { trpcHandler } from "./trpc-handler";
import { setupWebSocketHandler } from "./websocket-handler";
import { createHandler, createMiddleware } from "@universal-middleware/hono";
import { Hono } from "hono";

const app = new Hono();

app.use(createMiddleware(dbMiddleware)());
app.use("/api/trpc/*", createHandler(trpcHandler)("/api/trpc"));

/**
 * Vike route
 *
 * @link {@see https://vike.dev}
 **/
app.all("*", createHandler(vikeHandler)());

// Create HTTP server
const server = createServer();

// Setup WebSocket handlers
setupWebSocketHandler(server);

// Handle HTTP requests through the server
server.on("request", (req, res) => {
	app.fetch(req, { duplex: "half" })
		.then((response) => {
			res.statusCode = response.status;
			response.headers.forEach((value, key) => {
				res.setHeader(key, value);
			});
			if (response.body) {
				const reader = response.body.getReader();
				function pump(): any {
					return reader.read().then(({ done, value }) => {
						if (done) {
							res.end();
							return;
						}
						res.write(value);
						return pump();
					});
				}
				pump();
			} else {
				res.end();
			}
		})
		.catch((error) => {
			console.error("Request error:", error);
			res.statusCode = 500;
			res.end("Internal Server Error");
		});
});

export { app, server };
