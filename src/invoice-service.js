import { fromPromise } from 'rxjs/internal-compatibility';
import { map, mergeMap, switchMap } from 'rxjs/operators';

const aws = require('aws-sdk');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const Request = require('node-fetch').Request;

const invoiceIt = require('@rimiti/invoice-it').default;

const Redis = require('ioredis');

async function get (url) {
    return fromPromise(fetch(new Request(url)))
        .pipe(map(res =>{
            if ((`${res.status}`).match(/^(?:[4|5])/) !== null) {
                throw res; // abort
            }
            return res;
        }))
        .pipe(switchMap(response => {
            if (typeof response['json'] === 'function') {
                return fromPromise(response.json());
            } else {
                return response;
            }
        }));
}

async function openDir (dirHandle, path, callback) {
    const dir = fs.promises.opendir('./' + path);
    dir.then(async d => {
        for await (const f of d) {
            // console.debug(f.name);
            dirHandle.push(f);
        }

        if (typeof callback === 'function') {
            // console.debug(dirHandle);
            if(!!callback(dirHandle)) {
                // if callback returns true, clear
                // dir array to reduce side-effects
                dirHandle.splice(0, dirHandle.length);
            }
        }
    });

    await dir;
}

// Main
export default async function main (options) {
    console.log(options);

    const redis = new Redis(options[1], options[0], { db: (parseInt(options[3]) === parseInt(options[3])) ? options[3] : 0 });

    return (new Promise(async resolve => {

        const allKeys = [];

        if (options[2] === "save") {
            const savePipeline = redis.pipeline();

            const savePath = 'data'

            savePipeline.bgsave();
            savePipeline.exec((err, result) => {
                let resultIsArray = false;
                if (result.length > 0) {
                    for (const r in result) {
                        if (typeof result[r] === 'object') {
                            console.log(r);
                            resultIsArray = true;
                        }
                    }

                    if (resultIsArray && result[0].length > 1)  try {
                        console.debug(result[0][1] + '...');

                        const dir = [];
                        let dumpFile = null;

                        const openDirRecursive = async (d) => {
                            // check one more time
                            let tempFiles = ((d.length > 0) ? d : dir).filter(f => {
                                // console.log(f.name, f.name.match(/temp/));
                                dumpFile = (f.name.match(/dump/) !== null) ? f : dumpFile;
                                return f.name.match(/temp/) !== null
                            });

                            if (tempFiles.length > 0) {

                                await openDir(dir, '/' + savePath, openDirRecursive);

                            } else {
                                console.log(d);

                                if (d.length > 0) {
                                    if (dumpFile !== null && dumpFile.isFile() && tempFiles.length < 1) {

                                        console.debug('Background saving terminated with success.');

                                        console.debug('Dump file: ', dumpFile);

                                        const dumpPath = path.resolve(savePath + '/' + dumpFile.name);

                                        const dumpStats = fs.statSync(dumpPath);

                                        const s3UploadParams = {
                                            Bucket: options[3].bucket || 'sdp-activity-dev',
                                            Key: 'sdp-cache-' + (new Date).getTime() + '.rdb',
                                            Body: fs.createReadStream(dumpPath)
                                        };

                                        aws.config.update(options[3].credentials);

                                        const s3 = new aws.S3({ apiVersion: '2006-03-01' });

                                        console.debug('S3 upload params: ', {
                                            Bucket: s3UploadParams.Bucket,
                                            Key: s3UploadParams.Key,
                                            Body: dumpPath
                                        });

                                        await s3.putObject(s3UploadParams, function (err, data) {
                                            if (err) console.error(err, err.stack); // an error occurred
                                            else     console.log(data);             // successful response
                                        })
                                            .promise()
                                            .then(data => {

                                                fs.open(path.resolve(savePath + '/' + 'log.json'), 'w', (err, fd) => {
                                                    if (err) {
                                                        throw 'Could not open ' + path.resolve(savePath + '/' + 'log.json') + ':\n' + err;
                                                    } else {
                                                        const record = {
                                                            Date: new Date(),
                                                            Bucket: s3UploadParams.Bucket,
                                                            Key: s3UploadParams.Key,
                                                            Body: dumpPath,
                                                            Stats: dumpStats
                                                        };

                                                        const backupLog = require(path.resolve(savePath + '/' + 'log'));
                                                        backupLog.push(record);

                                                        const newLog = JSON.stringify(backupLog);

                                                        console.log(JSON.parse(newLog));
                                                        fs.write(fd, newLog, err => {
                                                            if (!!err) console.error(err);
                                                            fs.closeSync(fd);
                                                        });
                                                    }
                                                });

                                                console.debug('S3 upload complete.');
                                            })
                                            .catch(err => {
                                                console.error(err, err.stack);
                                            });
                                    }

                                } else {
                                    tempFiles.push('dummy');

                                    await openDir(dir, '/' + savePath, openDirRecursive);
                                }
                            }
                        };

                        openDir(dir, '/' + savePath, async (d) => {
                            if (d.length > 0) {
                                await openDir(d, '/' + savePath, openDirRecursive);
                            }
                        });

                        resolve(result);

                    } catch (e) {
                        result.push([ e, (!!e.message) ? e.message : '' ]);

                        resolve(result);

                    } else {
                        resolve([]);
                    }
                } else {
                    resolve([]);
                }
            });

        } else if (options[2] === "scan") {
            const stream = await redis.scanStream({
                // only returns keys following the pattern of `user:*`
                match: "*",
                // returns approximately 100 elements per call
                count: 100,
            });

            stream.on("data", async (resultKeys) => {
                await stream.pause();
                for (let i = 0; i < resultKeys.length; i++) {
                    try {
                        let KEY = resultKeys[i];
                        // console.debug(KEY); // debug

                        allKeys.push(KEY);

                    } catch (err) {
                        console.error(err, resultKeys);
                        next(err);
                    }
                }
                await stream.resume();
            });

            stream.on("end", () => {
                console.log(`all keys have been visited (${allKeys.length} total)`);

                resolve(allKeys);
            });

        } else if (options[2] === "test-invoice") {
            const htmlPathfile = './data/invoice.html';
            const pdfPathfile = './data/invoice.pdf';
            const pdfPathfileAdd = './data/invoiceAdd.pdf';

            invoiceIt.configure({
                global: {
                    logo: 'https://avatars1.githubusercontent.com/u/12345531?s=200&v=4',
                    date_format: 'YYYY-MM-DD',
                    footer: {
                        en: "Integrative Web Apps <br /> by <a href=\"http://www.real-currents.com\">Real~Currents</a>"
                    },
                    invoice_header_payment_reference: "invoice_header_payment_reference",
                    invoice_note: 'It\'s my custom node!'
                    // invoice_reference_pattern: '$prefix{INVOICE}$date{YYMM}$separator{_}$id{00000}'
                },
            });

            const emitter = {
                name: 'Real~Currents',
                first_name: 'John',
                last_name: 'Hall',
                street_number: '15',
                street_name: 'Rue Jean Jaures',
                zip_code: '75012',
                city: 'Paris',
                country: 'France',
                phone: '01 00 00 00 00',
                mail: 'contact@dimsolution.com',
                website: 'www.dimsolution.com',
            };

            const recipient = {
                company_name: 'ELE',
                first_name: 'Jeremy',
                last_name: '...',
                street_number: '20',
                street_name: 'Rue Victor Hugo',
                zip_code: '77340',
                city: 'Pontault-Combault',
                country: 'France',
                phone: '06 00 00 00 00',
                mail: 'will.jameson@test.com',
            };

            const article1 = {
                description: 'Apple - Macbook Pro',
                tax: 19.60,
                price: 952.09,
                qt: 3,
            };

            const article2 = {
                description: 'Github licence',
                tax: 10,
                price: 45,
                qt: 10,
            };

            const invoice = invoiceIt.create(recipient, emitter);
            invoice.article = [article1, article2];

            invoice.getInvoice().toHTML().toFile(htmlPathfile).then(() => invoice.getInvoice().toPDF().toFile(pdfPathfile)
                .then(() => resolve(pdfPathfile)));

        } else if (options[2] === "move" && parseInt(options[4]) === parseInt(options[4])) {
            const stream = await redis.scanStream({
                match: "*",
                count: 100 // returns approximately 100 elements per call
            });

            stream.on("data", async (resultKeys) => {
                await stream.pause();
                for (let i = 0; i < resultKeys.length; i++) {
                    try {
                        let KEY = resultKeys[i];

                        let moveResult = await redis.move(KEY, options[4]);
                        console.debug("MOVED", KEY, " TO ", options[4]); // debug

                        allKeys.push(KEY);

                    } catch (err) {
                        console.error(err, resultKeys);
                        resolve(err);
                        // next(err);
                    }
                }
                await stream.resume();
            });

            stream.on("end", () => {
                console.log(`all keys have been moved (${allKeys.length} total)`);

                resolve(allKeys);
            });

        } else {
            resolve(redis.getBuiltinCommands());

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
