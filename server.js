'use strict';

const HTTP_PORT = process.env.HTTP_PORT || 3000;

const express = require('express');
const http = require('http');
const path = require('path');
const colors = require('colors');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);

app.use(express.static(path.resolve(__dirname, 'public')));
app.use('/assets', express.static(path.resolve(__dirname, 'dist')));

const wss = new WebSocket.Server({
  server: server
});
wss.on('connection', function(connection) {
  connection.on('message', function(message) {
    try {
      console.log(message);
      connection.send(message);
    } catch (error) {
      console.error(error);
    }
  });
});

server.listen(HTTP_PORT, function() {
  console.log('Server ready: ' + colors.green('http://localhost:%d'), HTTP_PORT);
});
