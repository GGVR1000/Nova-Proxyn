const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
// Railway provides the PORT automatically
const PORT = process.env.PORT || 3000;

// Serve your Glass UI from the /public folder
app.use(express.static(path.join(__dirname, 'public')));

// THE PROXY ROUTE
app.use('/service', (req, res, next) => {
    const targetUrl = req.query.url;
    
    if (!targetUrl) {
        return res.status(400).send("Error: No target URL provided.");
    }

    return createProxyMiddleware({
        target: targetUrl,
        changeOrigin: true,
        // Rewrites /service?url=... to the actual target path
        pathRewrite: { '^/service': '' },
        followRedirects: true,
        onProxyRes: (proxyRes) => {
            // Strips security headers that block sites from loading in frames/proxies
            delete proxyRes.headers['content-security-policy'];
            delete proxyRes.headers['x-frame-options'];
            proxyRes.headers['Access-Control-Allow-Origin'] = '*';
        },
        onError: (err, req, res) => {
            res.status(500).send("Proxy Error: Could not reach the destination.");
        }
    })(req, res, next);
});

app.listen(PORT, () => {
    console.log(`Nova-Proxyn Engine is active on port ${PORT}`);
});