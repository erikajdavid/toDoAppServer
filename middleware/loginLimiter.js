const rateLimit = require('express-rate-limit')
const { logEvents } = require('./logger')

const loginLimiter = rateLimit({
    windows: 60 * 1000, // 1 minute
    max: 5, //limit each IP tp 5 login request per window per minute,
    message: {
        message: `Too many login attempts in one minute. Please wait and then try again.`
    },
    handler: (req, res, next, options) => {
        logEvents(`Too many requests: ${options.message.message}\t${req.method}\t${req.url}\t${request.headers.origin}`, 'errLog.log')
        res.status(options.statusCode).send(options.message)
    },
    standardHeaders: true, //return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, //disable the `X-RateLimit-*` headers
})

module.exports = loginLimiter