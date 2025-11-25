module.exports = (app, server, WebSocket, os, PORT) => {
    app.get('/test', (req, res) => {
        res.send('Ruta desde extensión');
    });

    function getLocalIP() {
        const interfaces = os.networkInterfaces();
        for (const name in interfaces) {
            for (const net of interfaces[name]) {
                if (net.family === "IPv4" && !net.internal) {
                    return net.address;
                }
            }
        }
    }
    
    const players = { 1: null, 2: null };
    
    const localIP = getLocalIP();
    console.log("IP LAN detectada:", localIP);

    server.listen(PORT, () => {
        console.log(`Servidor http corriendo: http://${localIP}:${PORT}`);
    });

    app.get("/ip", (req, res) => {
        res.json({ ip: localIP });
    });

    const wss = new WebSocket.Server({ server});

    wss.on("connection", ws => {
        let playerId = null;
        if (!players[1]) {
            playerId = 1;
            players[1] = ws;
        } else if (!players[2]) {
            playerId = 2;
            players[2] = ws;
        } else {
            ws.send(JSON.stringify({ type: "server_full" }));
            ws.close();
            return;
        }
        ws.send(JSON.stringify({ type: "player_id", id: playerId }));
        ws.on("message", msg => {
            for (const client of wss.clients) {
                if (client !== ws && client.readyState === WebSocket.OPEN)
                    client.send(msg);
            }
        });
        ws.on("close", () => {
            if (players[1] === ws) players[1] = null;
            if (players[2] === ws) players[2] = null;
        });
    });
};
