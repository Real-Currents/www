import { Request } from 'node-fetch';
import {Observable, of} from "rxjs";
import { fromPromise } from "rxjs/internal-compatibility";
import { mergeMap, map, switchMap } from "rxjs/operators";

var fetched = false;

function get(url) {
    return fromPromise(fetch(new Request(url)))
        .pipe(map(res =>{
            if ((`${res.status}`).match(/^(?:[4|5])/) !== null) {
                throw res; // abort
            }
            return res;
        }))
        .pipe(switchMap(response => {
            if (typeof response['json'] === 'function') {
                const res = response;
                return fromPromise(res.json());
            } else {
                return response;
            }
        }));
}

function unpack (data, depth, extra = {}) {
    const unpacked = [];
    let group = 0;

    if (Array.isArray(data)) {
        data.forEach(d => {
            if (Array.isArray(d) && --depth > 0) {
                unpack(d, depth, { "group": ++group }).forEach(dd => unpacked.push(dd));
            } else {
                const event = Object.assign(Object.assign({}, extra), d);
                unpacked.push(event);
            }
        });
        return unpacked;

    } else {
        const event = Object.assign(Object.assign({}, extra), d);
        unpacked.push(event);
    }

    console.log(unpacked.length + " elements unpacked");

    return unpacked;
}


// Main
export let onmessage = function(evt) {
    const position_events = [];
    const problem_events = [];

    console.log(evt.data);

    if (!fetched && "action" in evt.data && evt.data["action"].match(/event data/) !== null) {
        console.log("Fetching events...");

        const eventSource = evt.data["payload"]["event-source"];
        // const heightmapSource = evt.data["payload"]["heightmap-source"];
        const planarExtent = evt.data["payload"]["planar-extent"];

        const planarWidth = (planarExtent[1][0] - planarExtent[0][0]) / 2,
            planarDepth = (planarExtent[1][1] - planarExtent[0][1]) / 2;

        // first get all of the position events,
        // then get terrain heights to map to
        // events by proximity of x, y
        get(eventSource)//.pipe(
        //     map(response => {
        //         const data = response;
        //
        //         return unpack(data, 10);
        //
        //     }),
        //     mergeMap(events => {
        //
        //         events.forEach(d => position_events.push(Object.assign({}, d)));
        //
        //         return get(heightmapSource);
        //     })
        // )
            .subscribe({
                // next(heights) {
                //     console.log(heights);
                //
                //     console.log('Processing event and height data...');
                //
                //     const delay = {
                //         time: 1
                //     };
                //
                //     fetched = true;
                //
                //     const heightAdjustment = 0.75;
                //
                //     const heightOffset = 0.5;
                //
                //     const terrainDepth = (Array.isArray(heights) && heights.length > 0) ?
                //         heights.length : 0;
                //     const terrainWidth = (terrainDepth > 0 && heights[0].length > 0) ?
                //         heights[0].length : 0;
                //
                //     position_events.forEach((d, i, a) => {
                //         // delay.time += 6; // simulate slow load
                //         setTimeout(() => {
                //             if ("x" in d && "y" in d) try {
                //                 // Explore sign reversal
                //                 const x = d["x"], y = d["y"];
                //                 d["y"] = -x;
                //                 d["x"] = y;
                //                 const px= d["x"] + planarWidth / 2;     // shift all planar numbers to positive domain
                //                 const py = d["y"] + planarDepth / 2;    // shift all planar numbers to positive domain
                //                 const tx = Math.floor(terrainWidth * px / planarWidth);
                //                 const ty = Math.floor(terrainDepth * py / planarDepth);
                //                 const height = heightOffset + heightAdjustment * heights[tx][ty]; // assign height at this index
                //
                //                 postMessage(Object.assign({ height }, d));
                //             } catch (load_error) {
                //                 problem_events.push(Object.assign({ load_error }, d));
                //             }
                //         }, delay.time);
                //
                //         if (i === (a.length - 1)) {
                //             setTimeout(() => {
                //                 postMessage("Event data processing is complete.");
                //                 console.log("Problem events (height?): ", problem_events);
                //             }, delay.time);
                //         }
                //     });
                // },
                next(events) {
                    console.log(events);

                    unpack(events, 10).forEach((d, i, a) => {
                        postMessage(Object.assign({}, d));

                        if (i === (a.length - 1)) {
                            postMessage("Event data processing is complete.");
                            console.log("Problem events (height?): ", problem_events);
                        }
                    });
                },
                error(err) { console.error(err); },
                complete() { console.log("Event fetch is complete"); }
            });
    }
};

export let onmessageerror = null;

export let onerror = null;
