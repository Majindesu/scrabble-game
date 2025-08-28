import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { setupWebSocketHandler } from './websocket-handler';

const WS_PORT = 3002;

// Create HTTP server for WebSocket only
const server = createServer();

// Setup WebSocket handlers
setupWebSocketHandler(server);

server.listen(WS_PORT, () => {
  console.log(`WebSocket server listening on http://localhost:${WS_PORT}`);
});
