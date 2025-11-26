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
    const teams = { 1: null, 2: null };
    
    const localIP = getLocalIP();
    console.log("IP LAN detectada:", localIP);

    server.listen(PORT, () => {
        console.log(`Servidor http corriendo: http://${localIP}:${PORT}`);
    });

    app.get("/ip", (req, res) => {
        res.json({ ip: localIP });
    });

    const wss = new WebSocket.Server({ server});

    wss.on("connection", async (ws) => { 
        let playerId = null;
        let playerTeam = null;
    
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

        ws.on("message", msg => {
            const messageStr = msg.toString();
            const data = JSON.parse(messageStr);
            if (data.type === "set_team") {
                playerTeam = data.team;
                teams[playerId] = playerTeam; 
                
                ws.send(JSON.stringify({ 
                    type: "player_id", 
                    id: playerId,
                    team: playerTeam
                }));

                if (players[1] && players[2] && teams[1] && teams[2]) {
                    players[1].send(JSON.stringify({
                        type: "opponent_joined",
                        opponent: 2,
                        opponentTeam: teams[2]
                    }));
                    players[2].send(JSON.stringify({
                        type: "opponent_joined",
                        opponent: 1,
                        opponentTeam: teams[1]
                    }));
                }
                return;
            }
            if (data.type === "endResults") {
                if(data.empate){
                    players[1].send(JSON.stringify({
                        type: "you_tie"
                    }));
                    players[2].send(JSON.stringify({
                        type: "you_tie"
                    }));
                    return;
                }
                players[data.winner].send(JSON.stringify({
                    type: "you_win"
                }));
                players[data.loser].send(JSON.stringify({
                    type: "you_lose"
                }));
                return;
            }
            for (const client of wss.clients) {
                if (client !== ws && client.readyState === WebSocket.OPEN)
                    client.send(messageStr);
            }
        });
        ws.on("close", () => {
            const opponentId = playerId === 1 ? 2 : 1;
            const opponent = players[opponentId];
            
            // Notificar al oponente si está conectado
            if (opponent && opponent.readyState === WebSocket.OPEN) {
                opponent.send(JSON.stringify({
                    type: "opponent_disconnected",
                    playerId: playerId,
                    message: `El jugador ${playerId} se ha desconectado`
                }));
            }
            if (players[1] === ws) players[1] = null;
            if (players[2] === ws) players[2] = null;
            teams[playerId] = null;
        });
    });
};
