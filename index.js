const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.use('/service', (req, res, next) => {
    const targetUrl = req.query.url;
    if (!targetUrl) return res.status(400).send("No URL provided.");
    createProxyMiddleware({
        target: targetUrl,
        changeOrigin: true,
        pathRewrite: { '^/service': '' },
        onProxyRes: (proxyRes) => {
            proxyRes.headers['Access-Control-Allow-Origin'] = '*';
        }
    })(req, res, next);
});

app.listen(PORT, () => console.log(`Nova-Proxyn live on ${PORT}`));