import { app } from './app'

app
  .listen({
    host: 'localhost',
    port: 3333,
  })
  .then(() => {
    console.log('🚀 server running on port 3333')
  })
