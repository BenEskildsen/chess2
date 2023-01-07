
const express = require('express');
const path = require('path');
const {initSocketServer} = require('./socket');

const port = process.env.PORT || 8000;

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '../')));

console.log("server listening on port", port);

const server = initSocketServer(app);
server.listen(port);
