import {createServer} from 'vite'

createServer({
  configFile: false,
  root: './',
  server: {
    port: 3001,
  },
})
.then(server => {
  return server.listen()
})
.then((server) => {
  server.printUrls();
});
