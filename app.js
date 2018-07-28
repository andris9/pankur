'use strict';

const config = require('wild-config');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const flash = require('connect-flash');
const db = require('./lib/db');
const http = require('http');

db.connect(err => {
    if (err) {
        console.error(err);
        return process.exit(1);
    }

    const app = express();
    const port = config.www.port;

    require('./lib/hbs-helpers');

    app.set('port', port);

    // view engine setup
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'hbs');

    // Do not expose software used
    app.disable('x-powered-by');

    app.use(logger(config.www.log));

    app.use(cookieParser());

    app.use(express.static(path.join(__dirname, 'public')));

    app.use(
        session({
            name: 'pankur',
            store: new RedisStore({
                client: db.redis.duplicate()
            }),
            secret: config.www.secret,
            saveUninitialized: false,
            resave: false,
            cookie: {
                secure: false //!!config.www.secure
            }
        })
    );

    app.use(flash());

    app.use((req, res, next) => {
        // make sure flash messages are available
        res.locals.flash = req.flash.bind(req);
        next();
    });

    app.use(
        bodyParser.urlencoded({
            extended: true,
            limit: config.www.postsize
        })
    );

    app.use(
        bodyParser.json({
            limit: config.www.postsize
        })
    );

    app.use('/', require('./routes/index.js'));

    // catch 404 and forward to error handler
    app.use((req, res, next) => {
        let err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    // error handlers

    // development error handler
    // will print stacktrace
    if (app.get('env') === 'development') {
        app.use((err, req, res, next) => {
            if (!err) {
                return next();
            }
            res.status(err.status || 500);
            res.render('error', {
                status: err.status || 500,
                message: err.message,
                error: err,
                datetime: new Date().toISOString()
            });
        });
    }

    // production error handler
    // no stacktraces leaked to user
    app.use((err, req, res, next) => {
        if (!err) {
            return next();
        }
        res.status(err.status || 500);
        res.render('error', {
            status: err.status || 500,
            message: err.message
        });
    });

    const server = http.createServer(app);

    server.on('error', err => {
        if (err.syscall !== 'listen') {
            throw err;
        }

        let bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

        // handle specific listen errors with friendly messages
        switch (err.code) {
            case 'EACCES':
                console.error('Port %s requires elevated privileges', bind);
                return process.exit(1);
            case 'EADDRINUSE':
                console.error('Port %s is already in use', bind);
                return process.exit(1);
            default:
                throw err;
        }
    });

    server.on('listening', () => {
        let addr = server.address();
        let bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
        console.log('WWW server listening on %s', bind);
    });

    server.listen(port, false);
});
