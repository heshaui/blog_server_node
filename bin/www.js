const http = require('http');
const post = '8000';
const serverCallback = require('../app');

const server = http.createServer(serverCallback);
server.listen(post);
console.log('ok')