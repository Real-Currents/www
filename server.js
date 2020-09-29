#!/usr/bin/env node
const Koa = require('koa');
const app = new Koa();
const port = process.env['PORT'] || 3000;
const send = require('koa-send');
const serve = require('koa-static');
const main = require('./dist/invoice-service').default;

// logger
app.use(async (ctx, next) => {
    await next();
    const rt = ctx.response.get('X-Response-Time');
    console.log(`${ctx.method} ${ctx.url} - ${rt}`);
});

// x-response-time
app.use(async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    ctx.set('X-Response-Time', `${ms}ms`);
});

// static response
app.use(serve('public', { extensions: true }));

// reactive response
app.use(async (ctx) => {
    switch (ctx.path) {

        case ('/log.json'):
            await send(ctx, '/data/log.json');
            break;

        case ('/position_events.json'):
            await send(ctx, '/data/position_events.json');
            break;

        case ('/test-invoice'):
            await main([ '192.168.1.3', 6379, 'test-invoice', 0 ])
                .then(r => {
                    console.debug(JSON.stringify(r)); // debug
                    ctx.header['Content-Type'] = 'application/json';
                    ctx.body = r;
                }, err => {
                    console.error(err);
                });
            break;

        default:
            return ctx.body = 'Not Found';
    }
});

app.listen(port);

console.log('Listening on port ' + port);
