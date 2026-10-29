// Mock of the plugin's REST API for development (replaces camouflage, which doesn't run on current Node).
// Started by scripts/startDevServer.js on port 9002; webpack devServer proxies /api here.

const http = require('http')

const port = 9002

// PUT /api/1020/image/create: pretend the image was generated and point at the session's image jpg
function imageCreate(request) {
  const { id, fullPath, sessionName } = request
  if (fullPath == null || fullPath.includes('notfound')) {
    return { status: 404, body: {} }
  }
  return {
    status: 200,
    body: {
      id: id,
      cached: '2022-01-24',
      urlPath: `/sessions/${sessionName}/images/${id}.jpg`,
    },
  }
}

const routes = {
  'PUT /api/1020/image/create': imageCreate,
}

const server = http.createServer((req, res) => {
  let data = ''
  req.on('data', (chunk) => (data += chunk))
  req.on('end', () => {
    const route = routes[`${req.method} ${req.url.split('?')[0]}`]
    let result
    if (!route) {
      result = { status: 404, body: {} }
    } else {
      try {
        result = route(data ? JSON.parse(data) : {})
      } catch (err) {
        result = { status: 400, body: { error: err.message } }
      }
    }
    console.log(`mock api: ${req.method} ${req.url} -> ${result.status}`)
    res.writeHead(result.status, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(result.body))
  })
})

server.listen(port, () => console.log(`mock api listening on port ${port}`))
