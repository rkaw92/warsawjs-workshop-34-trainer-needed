'use strict';

const HTTP_PORT = process.env.HTTP_PORT || 3000;

const express = require('express');
const http = require('http');
const path = require('path');
const colors = require('colors');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const TrainerNeededModel = require('./server/TrainerNeededModel');

app.use(express.static(path.resolve(__dirname, 'public')));
app.use('/assets', express.static(path.resolve(__dirname, 'dist')));

const wss = new WebSocket.Server({
  server: server
});
const model = new TrainerNeededModel();
wss.on('connection', function(socket) {
  const socketContext = {};
  socket.on('message', function(message) {
    let command;
    try {
      command = JSON.parse(message);
    } catch (error) {
      console.warn('failed to parse message: %s', error);
      return;
    }
    let errorReply = null;
    try {
      model.handleCommand(command, socket, socketContext);
    } catch (error) {
      console.error('failed to process command: %s', error.stack || error);
      errorReply = error;
    }
    try {
      if (errorReply) {
        socket.send(JSON.stringify({ error: { name: errorReply.name, message: errorReply.message } }));
      }
    } catch (error) {
      console.warn('failed to send error reply: %s', error);
    }
  });
  socket.on('close', function() {
    model.handleDisconnect(socket, socketContext);
  });
});

server.listen(HTTP_PORT, function() {
  console.log('Server ready: ' + colors.green('http://localhost:%d'), HTTP_PORT);
});
