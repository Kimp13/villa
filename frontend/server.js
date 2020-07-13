const { createServer } = require('http');
const next = require('next');

const port = parseInt(process.env.PORT, 10) || 80;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });

createServer()
  .listen(port, err => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${port}`);
  })
  .get('/favicon.ico', (req, res) => (
    res.status(200).sendFile('favicon.ico', {root: __dirname + '/public/'})
  ));