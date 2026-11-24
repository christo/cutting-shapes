import express from 'express';
import OBSWebSocket from 'obs-websocket-js';
import type { ServerWebSocket } from "bun";
import path from 'node:path';
import { ENDPOINTS, SERVER_HTTP_PORT } from '../src/Api.ts';
import { recordingsRouter } from './recordings.ts';

const FFMPEG = 'ffmpeg';
if (!Bun.which(FFMPEG)) {
    throw new Error(`${FFMPEG} not found on PATH`);
}
const RECORDINGS_DIR = process.env.RECORDINGS_DIR;
if (!RECORDINGS_DIR) {
    throw new Error('RECORDINGS_DIR not set, see server/.env.example');
}

const app = express();
const obs = new OBSWebSocket();
const WS_PORT = 3002;

// Define the data type for our WebSocket
type WSData = {
    type: string;
    sceneName?: string;
    sceneItemId?: number;
};

const wsClients = new Set<ServerWebSocket<WSData>>();

app.use(express.json());
// relative to server dir, regardless of cwd
app.use(ENDPOINTS.RECORDINGS, recordingsRouter(path.resolve(import.meta.dir, RECORDINGS_DIR)));

// Basic HTTP endpoints
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.post('/api/obs/connect', async (req, res) => {
    try {
        await obs.connect('ws://localhost:4455');
        res.json({ status: 'connected' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to connect to OBS' });
    }
});

app.get('/api/obs/scenes', async (req, res) => {
    try {
        const { scenes } = await obs.call('GetSceneList');
        res.json(scenes);
    } catch (error) {
        //res.status(500).json({ error: `Failed to get scenes ${error}` });
    }
});

// Start HTTP server
app.listen(SERVER_HTTP_PORT, () => {
    console.log(`HTTP server running at http://localhost:${SERVER_HTTP_PORT}`);
});

// Subscribe to OBS events
obs.on('CurrentProgramSceneChanged', data => {
    wsClients.forEach(client => {
        client.send(JSON.stringify({
            type: 'sceneChanged',
            sceneName: data.sceneName
        }));
    });
});

obs.on('SceneItemEnableStateChanged', data => {
    wsClients.forEach(client => {
        client.send(JSON.stringify({
            type: 'sourceChanged',
            sceneName: data.sceneName,
            sceneItemId: data.sceneItemId,
            enabled: data.sceneItemEnabled
        }));
    });
});

// Start WebSocket server
Bun.serve({
    port: WS_PORT,
    fetch(req, server) {
        if (server.upgrade(req)) {
            return;
        }
        return new Response('Upgrade failed', { status: 500 });
    },
    websocket: {
        open(ws: ServerWebSocket<WSData>) {
            wsClients.add(ws);
            console.log('Client connected');
        },
        message(ws: ServerWebSocket<WSData>, message: string) {
            try {
                const data = JSON.parse(message) as WSData;
                handleWSMessage(ws, data);
            } catch (e) {
                console.error('Failed to parse message:', e);
            }
        },
        close(ws: ServerWebSocket<WSData>) {
            wsClients.delete(ws);
            console.log('Client disconnected');
        },
    },
});

console.log(`WebSocket server running at ws://localhost:${WS_PORT}`);

// Handle incoming WebSocket messages
async function handleWSMessage(ws: ServerWebSocket<WSData>, message: WSData) {
    switch (message.type) {
        case 'switchScene':
            try {
                if (message.sceneName) {
                    await obs.call('SetCurrentProgramScene', {
                        sceneName: message.sceneName
                    });
                }
            } catch (error) {
                ws.send(JSON.stringify({
                    type: 'error',
                    error: 'Failed to switch scene'
                }));
            }
            break;

        case 'toggleSource':
            try {
                if (message.sceneItemId && message.sceneName) {
                    const { sceneItemEnabled } = await obs.call('GetSceneItemEnabled', {
                        sceneName: message.sceneName,
                        sceneItemId: message.sceneItemId
                    });

                    await obs.call('SetSceneItemEnabled', {
                        sceneName: message.sceneName,
                        sceneItemId: message.sceneItemId,
                        sceneItemEnabled: !sceneItemEnabled
                    });
                }
            } catch (error) {
                ws.send(JSON.stringify({
                    type: 'error',
                    error: 'Failed to toggle source'
                }));
            }
            break;
    }
}