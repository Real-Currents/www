(function (global, factory) {
            typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('rxjs/internal-compatibility'), require('rxjs/operators')) :
            typeof define === 'function' && define.amd ? define(['exports', 'rxjs/internal-compatibility', 'rxjs/operators'], factory) :
            (global = global || self, factory(global.self = global.self || {}, global.internalCompatibility, global.operators));
}(this, (function (exports, internalCompatibility, operators) { 'use strict';

            var global$1 = (typeof global !== "undefined" ? global :
                        typeof self !== "undefined" ? self :
                        typeof window !== "undefined" ? window : {});

            // shim for using process in browser
            // based off https://github.com/defunctzombie/node-process/blob/master/browser.js

            function defaultSetTimout() {
                throw new Error('setTimeout has not been defined');
            }
            function defaultClearTimeout () {
                throw new Error('clearTimeout has not been defined');
            }
            var cachedSetTimeout = defaultSetTimout;
            var cachedClearTimeout = defaultClearTimeout;
            if (typeof global$1.setTimeout === 'function') {
                cachedSetTimeout = setTimeout;
            }
            if (typeof global$1.clearTimeout === 'function') {
                cachedClearTimeout = clearTimeout;
            }

            function runTimeout(fun) {
                if (cachedSetTimeout === setTimeout) {
                    //normal enviroments in sane situations
                    return setTimeout(fun, 0);
                }
                // if setTimeout wasn't available but was latter defined
                if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
                    cachedSetTimeout = setTimeout;
                    return setTimeout(fun, 0);
                }
                try {
                    // when when somebody has screwed with setTimeout but no I.E. maddness
                    return cachedSetTimeout(fun, 0);
                } catch(e){
                    try {
                        // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
                        return cachedSetTimeout.call(null, fun, 0);
                    } catch(e){
                        // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
                        return cachedSetTimeout.call(this, fun, 0);
                    }
                }


            }
            function runClearTimeout(marker) {
                if (cachedClearTimeout === clearTimeout) {
                    //normal enviroments in sane situations
                    return clearTimeout(marker);
                }
                // if clearTimeout wasn't available but was latter defined
                if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
                    cachedClearTimeout = clearTimeout;
                    return clearTimeout(marker);
                }
                try {
                    // when when somebody has screwed with setTimeout but no I.E. maddness
                    return cachedClearTimeout(marker);
                } catch (e){
                    try {
                        // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
                        return cachedClearTimeout.call(null, marker);
                    } catch (e){
                        // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
                        // Some versions of I.E. have different rules for clearTimeout vs setTimeout
                        return cachedClearTimeout.call(this, marker);
                    }
                }



            }
            var queue = [];
            var draining = false;
            var currentQueue;
            var queueIndex = -1;

            function cleanUpNextTick() {
                if (!draining || !currentQueue) {
                    return;
                }
                draining = false;
                if (currentQueue.length) {
                    queue = currentQueue.concat(queue);
                } else {
                    queueIndex = -1;
                }
                if (queue.length) {
                    drainQueue();
                }
            }

            function drainQueue() {
                if (draining) {
                    return;
                }
                var timeout = runTimeout(cleanUpNextTick);
                draining = true;

                var len = queue.length;
                while(len) {
                    currentQueue = queue;
                    queue = [];
                    while (++queueIndex < len) {
                        if (currentQueue) {
                            currentQueue[queueIndex].run();
                        }
                    }
                    queueIndex = -1;
                    len = queue.length;
                }
                currentQueue = null;
                draining = false;
                runClearTimeout(timeout);
            }
            function nextTick(fun) {
                var args = new Array(arguments.length - 1);
                if (arguments.length > 1) {
                    for (var i = 1; i < arguments.length; i++) {
                        args[i - 1] = arguments[i];
                    }
                }
                queue.push(new Item(fun, args));
                if (queue.length === 1 && !draining) {
                    runTimeout(drainQueue);
                }
            }
            // v8 likes predictible objects
            function Item(fun, array) {
                this.fun = fun;
                this.array = array;
            }
            Item.prototype.run = function () {
                this.fun.apply(null, this.array);
            };
            var title = 'browser';
            var platform = 'browser';
            var browser = true;
            var env = {};
            var argv = [];
            var version = ''; // empty string to avoid regexp issues
            var versions = {};
            var release = {};
            var config = {};

            function noop() {}

            var on = noop;
            var addListener = noop;
            var once = noop;
            var off = noop;
            var removeListener = noop;
            var removeAllListeners = noop;
            var emit = noop;

            function binding(name) {
                throw new Error('process.binding is not supported');
            }

            function cwd () { return '/' }
            function chdir (dir) {
                throw new Error('process.chdir is not supported');
            }function umask() { return 0; }

            // from https://github.com/kumavis/browser-process-hrtime/blob/master/index.js
            var performance = global$1.performance || {};
            var performanceNow =
              performance.now        ||
              performance.mozNow     ||
              performance.msNow      ||
              performance.oNow       ||
              performance.webkitNow  ||
              function(){ return (new Date()).getTime() };

            // generate timestamp or delta
            // see http://nodejs.org/api/process.html#process_process_hrtime
            function hrtime(previousTimestamp){
              var clocktime = performanceNow.call(performance)*1e-3;
              var seconds = Math.floor(clocktime);
              var nanoseconds = Math.floor((clocktime%1)*1e9);
              if (previousTimestamp) {
                seconds = seconds - previousTimestamp[0];
                nanoseconds = nanoseconds - previousTimestamp[1];
                if (nanoseconds<0) {
                  seconds--;
                  nanoseconds += 1e9;
                }
              }
              return [seconds,nanoseconds]
            }

            var startTime = new Date();
            function uptime() {
              var currentTime = new Date();
              var dif = currentTime - startTime;
              return dif / 1000;
            }

            var process = {
              nextTick: nextTick,
              title: title,
              browser: browser,
              env: env,
              argv: argv,
              version: version,
              versions: versions,
              on: on,
              addListener: addListener,
              once: once,
              off: off,
              removeListener: removeListener,
              removeAllListeners: removeAllListeners,
              emit: emit,
              binding: binding,
              cwd: cwd,
              chdir: chdir,
              umask: umask,
              hrtime: hrtime,
              platform: platform,
              release: release,
              config: config,
              uptime: uptime
            };

            const aws = require('aws-sdk');
            const fetch = require('node-fetch');
            const fs = require('fs');
            const path = require('path');
            const Request = require('node-fetch').Request;

            const invoiceIt = require('invoice-it').default;

            // Main
            async function main (options) {
                console.log(options);

                return (new Promise(async resolve => {

                    if (options[0] === "create-invoice") {
                        const invoiceData = JSON.parse(options[1]);

                        console.log('Invoice data: ', invoiceData);

                        fs.open(path.resolve('./static/invoice/' + 'invoice.json'), 'r', (err, fd) => {

                            if (err) {
                                throw 'Could not open ' + path.resolve('./static/invoice/' + 'invoice.json') + ':\n' + err;

                            } else {
                                const invoiceLog = require(path.resolve('./static/invoice/' + 'invoice'));
                                const invoiceRecord = {};
                                const invoiceTotal = invoiceLog.length;
                                invoiceRecord['id'] = invoiceTotal.toString().padStart(6, '0');
                                invoiceRecord['date'] = new Date();
                                invoiceRecord['path'] = './static/invoice/invoice-' + invoiceRecord['id'];
                                invoiceRecord['note'] = invoiceData['note'];

                                console.log('Total invoices written: ', invoiceTotal);

                                invoiceRecord['global'] = {
                                    logo: 'http://localhost:3000/images/real-currents-bw-invoice.png',
                                    date_format: 'YYYY-MM-DD',
                                    footer: {
                                        en: 'Integrative Web Apps <br /> by <a href="http://www.real-currents.com">Real~Currents</a>'
                                    },
                                    invoice_id: invoiceRecord['id'],
                                    invoice_header_payment_reference: "invoice_header_payment_reference",
                                    invoice_note: (!!invoiceRecord['note']) ? invoiceRecord['note'] : "",
                                    invoice_reference_pattern: '$prefix{INVOICE}$date{YYYY_MM}$separator{_}$id{'+ invoiceRecord['id'] +'}'
                                };

                                invoiceLog.push(invoiceRecord);

                                fs.closeSync(fd);

                                fs.unlinkSync('./static/invoice/' + 'invoice.json');

                                const updatedLog = JSON.stringify(invoiceLog, null, 2);

                                // console.log(JSON.parse(updatedLog));

                                fs.open(path.resolve('./static/invoice/' + 'invoice.json'), 'w', async (err, fw) => {
                                    if (!!err) {
                                        resolve('{ "error": ' + JSON.stringify(err) +' }');

                                    } else try {

                                        await fs.write(fw, updatedLog, err => {
                                            if (!!err) console.error(err);
                                            fs.closeSync(fw);
                                        });

                                        console.log('Configure new invoice using record: ', invoiceRecord);

                                        invoiceIt.configure(invoiceRecord);

                                        const invoice = invoiceIt.create(invoiceData['client'], invoiceData['emitter']);

                                        invoice.article = invoiceData['workEntries'];

                                        invoice.getInvoice().toHTML().toFile(invoiceRecord['path']+ '.html').then(() => invoice.getInvoice().toPDF().toFile(invoiceRecord['path'] + '.pdf')
                                            .then(() => resolve('{ "result": "' + invoiceRecord['path'] + '.pdf" }')));

                                    } catch (e) {
                                        console.error(e);
                                        resolve('{ "error": ' + JSON.stringify(e) +'}');
                                    }
                                });
                            }
                        });

                    } else if (options[0] === "test-invoice") {

                        fs.open(path.resolve('./static/invoice/' + 'invoice.json'), 'r', (err, fd) => {

                            if (err) {
                                throw 'Could not open ' + path.resolve('./static/invoice/' + 'invoice.json') + ':\n' + err;

                            } else {
                                const invoiceLog = require(path.resolve('./static/invoice/' + 'invoice'));
                                const invoiceRecord = {};
                                const invoiceTotal = invoiceLog.length;
                                invoiceRecord['id'] = invoiceTotal.toString().padStart(6, '0');
                                invoiceRecord['date'] = new Date();
                                invoiceRecord['path'] = './static/invoice/invoice-' + invoiceRecord['id'];

                                console.log('Total invoices written: ', invoiceTotal);

                                invoiceRecord['global'] = {
                                    logo: 'http://localhost:3000/images/real-currents-bw-invoice.png',
                                    date_format: 'YYYY-MM-DD',
                                    footer: {
                                        en: "Integrative Web Apps <br /> by <a href=\"http://www.real-currents.com\">Real~Currents</a>"
                                    },
                                    invoice_header_payment_reference: "invoice_header_payment_reference",
                                    invoice_note: 'August 31st - September 18th',
                                    invoice_reference_pattern: '$prefix{INVOICE}$date{YYYY_MM}$separator{_}$id{' + invoiceTotal.toString().padStart(6, '0') + '}'
                                };

                                invoiceLog.push(invoiceRecord);

                                fs.closeSync(fd);

                                fs.unlinkSync('./static/invoice/' + 'invoice.json');

                                const updatedLog = JSON.stringify(invoiceLog, null, 2);

                                // console.log(JSON.parse(updatedLog));

                                fs.open(path.resolve('./static/invoice/' + 'invoice.json'), 'w', async (err, fw) => {
                                    if (!!err) {
                                        resolve('{ "error": ' + JSON.stringify(err) + ' }');

                                    } else try {

                                        await fs.write(fw, updatedLog, err => {
                                            if (!!err) console.error(err);
                                            fs.closeSync(fw);
                                        });

                                        console.log('Configure new invoice using record: ', invoiceRecord);

                                        invoiceIt.configure(invoiceRecord);

                                        const emitter = {
                                            name: 'Real~Currents',
                                            first_name: 'John',
                                            last_name: 'Hall',
                                            street_number: '17',
                                            street_name: 'Victory Circle',
                                            city: 'White River Junction',
                                            country: 'VT', // state
                                            zip_code: '05001',
                                            phone: '510.306.1376',
                                            mail: 'john@real-currents.com',
                                            website: 'www.real-currents.com'
                                        };

                                        const client = {
                                            company_name: 'ELE Optics Inc.',
                                            first_name: 'Jeremy',
                                            last_name: 'Shockley',
                                            street_number: '44',
                                            street_name: 'North Stone Avenue',
                                            city: 'Tucson',
                                            country: 'AZ', // state
                                            zip_code: '85701',
                                            phone: '323.841.5288',
                                            mail: 'jshockley@eleoptics.com'
                                        };

                                        const workEntries = [
                                            {
                                                code: 'MTG',
                                                description: 'Meeting',
                                                // tax: 0.0,
                                                date: '2020-09-03',
                                                price: 22.5,
                                                qt: 1,
                                            },
                                            {
                                                code: 'DEV',
                                                description: 'Web Development',
                                                // tax: 0.0,
                                                date: '2020-09-04',
                                                price: 45,
                                                qt: 2,
                                            },
                                            {
                                                code: 'MTG',
                                                description: 'Meeting',
                                                // tax: 0.0,
                                                date: '2020-09-10',
                                                price: 22.5,
                                                qt: 1,
                                            },
                                            {
                                                code: 'DEV',
                                                description: 'Web Development',
                                                // tax: 0.0,
                                                date: '2020-09-11',
                                                price: 45,
                                                qt: 2,
                                            },
                                            {
                                                code: 'DEV',
                                                description: 'Web Development',
                                                // tax: 0.0,
                                                date: '2020-09-14',
                                                price: 45,
                                                qt: 3,
                                            },
                                            {
                                                code: 'MTG',
                                                description: 'Meeting',
                                                // tax: 0.0,
                                                date: '2020-09-17',
                                                price: 22.5,
                                                qt: 1,
                                            },
                                            {
                                                code: 'DEV',
                                                description: 'Web Development',
                                                // tax: 0.0,
                                                date: '2020-09-17',
                                                price: 45,
                                                qt: 2,
                                            }
                                        ];

                                        const invoice = invoiceIt.create(client, emitter);
                                        invoice.article = workEntries;

                                        invoice.getInvoice().toHTML().toFile(invoiceRecord['path'] + '.html').then(() => invoice.getInvoice().toPDF().toFile(invoiceRecord['path'] + '.pdf')
                                            .then(() => resolve('{ "result": "' + invoiceRecord['path'] + '.pdf" }')));

                                    } catch (e) {
                                        resolve('{ "error": ' + JSON.stringify(e) + '}');
                                    }
                                });
                            }
                        });

                    // } else if (options[0] === "save") {
                    //     const redis = new Redis(options[2], options[1], { db: (parseInt(options[3]) === parseInt(options[3])) ? options[3] : 0 });
                    //     const allKeys = [];
                    //     const savePipeline = redis.pipeline();
                    //
                    //     const savePath = 'data'
                    //
                    //     savePipeline.bgsave();
                    //     savePipeline.exec((err, result) => {
                    //         let resultIsArray = false;
                    //         if (result.length > 0) {
                    //             for (const r in result) {
                    //                 if (typeof result[r] === 'object') {
                    //                     console.log(r);
                    //                     resultIsArray = true;
                    //                 }
                    //             }
                    //
                    //             if (resultIsArray && result[0].length > 1)  try {
                    //                 console.debug(result[0][1] + '...');
                    //
                    //                 const dir = [];
                    //                 let dumpFile = null;
                    //
                    //                 const openDirRecursive = async (d) => {
                    //                     // check one more time
                    //                     let tempFiles = ((d.length > 0) ? d : dir).filter(f => {
                    //                         // console.log(f.name, f.name.match(/temp/));
                    //                         dumpFile = (f.name.match(/dump/) !== null) ? f : dumpFile;
                    //                         return f.name.match(/temp/) !== null
                    //                     });
                    //
                    //                     if (tempFiles.length > 0) {
                    //
                    //                         await openDir(dir, '/' + savePath, openDirRecursive);
                    //
                    //                     } else {
                    //                         console.log(d);
                    //
                    //                         if (d.length > 0) {
                    //                             if (dumpFile !== null && dumpFile.isFile() && tempFiles.length < 1) {
                    //
                    //                                 console.debug('Background saving terminated with success.');
                    //
                    //                                 console.debug('Dump file: ', dumpFile);
                    //
                    //                                 const dumpPath = path.resolve(savePath + '/' + dumpFile.name);
                    //
                    //                                 const dumpStats = fs.statSync(dumpPath);
                    //
                    //                                 const s3UploadParams = {
                    //                                     Bucket: options[3].bucket || 'sdp-activity-dev',
                    //                                     Key: 'sdp-cache-' + (new Date).getTime() + '.rdb',
                    //                                     Body: fs.createReadStream(dumpPath)
                    //                                 };
                    //
                    //                                 aws.config.update(options[3].credentials);
                    //
                    //                                 const s3 = new aws.S3({ apiVersion: '2006-03-01' });
                    //
                    //                                 console.debug('S3 upload params: ', {
                    //                                     Bucket: s3UploadParams.Bucket,
                    //                                     Key: s3UploadParams.Key,
                    //                                     Body: dumpPath
                    //                                 });
                    //
                    //                                 await s3.putObject(s3UploadParams, function (err, data) {
                    //                                     if (err) console.error(err, err.stack); // an error occurred
                    //                                     else     console.log(data);             // successful response
                    //                                 })
                    //                                     .promise()
                    //                                     .then(data => {
                    //
                    //                                         fs.open(path.resolve(savePath + '/' + 'log.json'), 'w', (err, fd) => {
                    //                                             if (err) {
                    //                                                 throw 'Could not open ' + path.resolve(savePath + '/' + 'log.json') + ':\n' + err;
                    //                                             } else {
                    //                                                 const record = {
                    //                                                     Date: new Date(),
                    //                                                     Bucket: s3UploadParams.Bucket,
                    //                                                     Key: s3UploadParams.Key,
                    //                                                     Body: dumpPath,
                    //                                                     Stats: dumpStats
                    //                                                 };
                    //
                    //                                                 const backupLog = require(path.resolve(savePath + '/' + 'log'));
                    //                                                 backupLog.push(record);
                    //
                    //                                                 const newLog = JSON.stringify(backupLog);
                    //
                    //                                                 console.log(JSON.parse(newLog));
                    //                                                 fs.write(fd, newLog, err => {
                    //                                                     if (!!err) console.error(err);
                    //                                                     fs.closeSync(fd);
                    //                                                 });
                    //                                             }
                    //                                         });
                    //
                    //                                         console.debug('S3 upload complete.');
                    //                                     })
                    //                                     .catch(err => {
                    //                                         console.error(err, err.stack);
                    //                                     });
                    //                             }
                    //
                    //                         } else {
                    //                             tempFiles.push('dummy');
                    //
                    //                             await openDir(dir, '/' + savePath, openDirRecursive);
                    //                         }
                    //                     }
                    //                 };
                    //
                    //                 openDir(dir, '/' + savePath, async (d) => {
                    //                     if (d.length > 0) {
                    //                         await openDir(d, '/' + savePath, openDirRecursive);
                    //                     }
                    //                 });
                    //
                    //                 resolve(result);
                    //
                    //             } catch (e) {
                    //                 result.push([ e, (!!e.message) ? e.message : '' ]);
                    //
                    //                 resolve(result);
                    //
                    //             } else {
                    //                 resolve([]);
                    //             }
                    //         } else {
                    //             resolve([]);
                    //         }
                    //     });
                    //
                    // } else if (options[0] === "scan") {
                    //     const redis = new Redis(options[2], options[1], { db: (parseInt(options[3]) === parseInt(options[3])) ? options[3] : 0 });
                    //     const allKeys = [];
                    //     const stream = await redis.scanStream({
                    //         // only returns keys following the pattern of `user:*`
                    //         match: "*",
                    //         // returns approximately 100 elements per call
                    //         count: 100,
                    //     });
                    //
                    //     stream.on("data", async (resultKeys) => {
                    //         await stream.pause();
                    //         for (let i = 0; i < resultKeys.length; i++) {
                    //             try {
                    //                 let KEY = resultKeys[i];
                    //                 // console.debug(KEY); // debug
                    //
                    //                 allKeys.push(KEY);
                    //
                    //             } catch (err) {
                    //                 console.error(err, resultKeys);
                    //                 next(err);
                    //             }
                    //         }
                    //         await stream.resume();
                    //     });
                    //
                    //     stream.on("end", () => {
                    //         console.log(`all keys have been visited (${allKeys.length} total)`);
                    //
                    //         resolve(allKeys);
                    //     });
                    //
                    //
                    // } else if (options[0] === "move" && parseInt(options[4]) === parseInt(options[4])) {
                    //     const redis = new Redis(options[2], options[1], { db: (parseInt(options[3]) === parseInt(options[3])) ? options[3] : 0 });
                    //     const allKeys = [];
                    //     const stream = await redis.scanStream({
                    //         match: "*",
                    //         count: 100 // returns approximately 100 elements per call
                    //     });
                    //
                    //     stream.on("data", async (resultKeys) => {
                    //         await stream.pause();
                    //         for (let i = 0; i < resultKeys.length; i++) {
                    //             try {
                    //                 let KEY = resultKeys[i];
                    //
                    //                 let moveResult = await redis.move(KEY, options[4]);
                    //                 console.debug("MOVED", KEY, " TO ", options[4]); // debug
                    //
                    //                 allKeys.push(KEY);
                    //
                    //             } catch (err) {
                    //                 console.error(err, resultKeys);
                    //                 resolve(err);
                    //                 // next(err);
                    //             }
                    //         }
                    //         await stream.resume();
                    //     });
                    //
                    //     stream.on("end", () => {
                    //         console.log(`all keys have been moved (${allKeys.length} total)`);
                    //
                    //         resolve(allKeys);
                    //     });
                    //
                    // } else {
                    //     resolve(redis.getBuiltinCommands());

                    }

                }));
            }

            (function () {
                console.log(process.argv);

                if (!!process.argv[1] && process.argv[1].match(/(?:main|rt)/) !== null) {

                        console.log("COMMAND-LINE CONTEXT");

                    main((process.argv.length > 2) ? process.argv.slice(2) : [] )
                        .then(r => {
                            console.debug(JSON.stringify(r)); // debug
                            process.exit();
                        }, err => {
                            process.exit();
                        });

                } else {
                    console.log("SERVER CONTEXT");
                }
            }());

            exports.default = main;

            Object.defineProperty(exports, '__esModule', { value: true });

})));
