require('dotenv').config()

const express = require('express')
const cors = require('cors')
const rateLimit = require('express-rate-limit')
const MongoStore = require('rate-limit-mongo')
const routes = require('./routes')

const port = process.env.PORT || 3000
const server = express()

server.set('trust proxy', 1)

server.use(cors())

/**
 * Only on my production server
 * you can probably remove this code
 * if your server won't to have rate limitter API usage
 * in my case, I'll limit it with 50req/15min
 * @see https://www.npmjs.com/package/rate-limit-mongo
 */
server.use(rateLimit({
    store: new MongoStore({
        uri: process.env.MONGODB_URI,
        expireTimeMs: 1000 * 60 * 15,
        errorHandler: console.error.bind(null, 'rate-limit-mongo'),
        collectionName: 'request-records'
    }),
    max: 50,
    windowMs: 1000 * 60 * 15,
    message: {
        code: 429,
        status: 'Too Many Requests',
        message: 'You have exceeded the rate limit. Try again in a few minutes.',
        data: {}
    }
}))

server.use((req, res, next) => {
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=86400, stale-while-revalidate')
    next()
})

server.use(express.json())

server.use(routes)

server.listen(port, () => {
    console.log('Server running at port:', port)
})
