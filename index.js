const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.use('/service', (req, res, next) => {
    const targetUrl = req.query.url;
    if (!targetUrl) return res.status(400).send("No URL provided.");

    return createProxyMiddleware({
        target: targetUrl,
        changeOrigin: true,
        followRedirects: true,
        autoRewrite: true,
        pathRewrite: { '^/service': '' },
        onProxyReq: (proxyReq) => {
            // Pretend to be a real Chrome browser to avoid bot detection
            proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');
            proxyReq.setHeader('Referer', targetUrl);
        },
        onProxyRes: (proxyRes) => {
            // Nuke the security headers that break YouTube searches and video playback
            delete proxyRes.headers['content-security-policy'];
            delete proxyRes.headers['x-frame-options'];
            delete proxyRes.headers['cross-origin-opener-policy'];
            delete proxyRes.headers['cross-origin-embedder-policy'];
            
            // Allow all origins to talk to our proxy
            proxyRes.headers['Access-Control-Allow-Origin'] = '*';
            proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS';
        },
        logLevel: 'debug'
    })(req, res, next);
});

app.listen(PORT, () => console.log(`Nova-Proxyn Ultra Engine live on ${PORT}`));