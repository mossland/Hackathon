const path = require('path');
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');


const proxyServerPort = 8090;
const app = express();

console.log(path.join(__dirname, '../RockPaperScissors/'));
app.use('/', express.static(
    /* game client path */
    path.join(__dirname, '../RockPaperScissors/'),
    {
        index: 'index.html'
    }
));
app.use('/api', createProxyMiddleware(
    {
        target: 'http://localhost:3000',
        pathRewrite: { '^/api/': '/' }
    }
));

app.listen(proxyServerPort, () => {
    console.log(`Proxy server listening on port ${proxyServerPort}`);
});