'use strict';

const HTTP_PORT = process.env.HTTP_PORT || 3000;

const express = require('express');
const app = express();
const path = require('path');
const colors = require('colors');

app.use(express.static(path.resolve(__dirname, 'public')));
app.use('/assets', express.static(path.resolve(__dirname, 'dist')));

app.listen(HTTP_PORT, function() {
  console.log('Server ready: ' + colors.green('http://localhost:%d'), HTTP_PORT);
});
