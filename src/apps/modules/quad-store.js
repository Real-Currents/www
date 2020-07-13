
export default class QuadStore {
    constructor (capacity = 4,
                 extent = [[ -1.0, -1.0 ], [ 1, 1 ]],
                 routeMethod = (extent) => {
                     const parentWidth = extent[1][0] - extent[0][0],
                         parentHeight = extent[1][1] - extent[0][1];

                     const quadWidth = parentWidth / 2,
                         quadHeight = parentHeight / 2,
                         quad_extents = {
                             1: {
                                 1: [
                                     [ extent[0][0], extent[0][1] ],
                                     [ extent[0][0] + quadWidth, extent[0][1] + quadHeight ]
                                 ],
                                 2: [
                                     [ extent[0][0], extent[1][1] - quadHeight ],
                                     [ extent[1][0] - quadWidth, extent[1][1] ]
                                 ]
                             },
                             2: {
                                 1: [
                                     [ extent[0][0] + quadWidth, extent[0][1] ],
                                     [ extent[1][0], extent[0][1] + quadHeight ]
                                 ],
                                 2: [
                                     [ extent[1][0] - quadWidth, extent[1][1] - quadHeight ],
                                     [ extent[1][0], extent[1][1] ]
                                 ]
                             }
                         };

                     // console.log({
                     //     1: [
                     //         [ extent[0][0], extent[0][1] ],
                     //         [ extent[0][0] + quadWidth, extent[0][1] + quadHeight ]
                     //     ],
                     //     2: [
                     //         [ extent[0][0], extent[1][1] - quadHeight ],
                     //         [ extent[1][0] - quadWidth, extent[1][1] ]
                     //     ]
                     // },{
                     //     1: [
                     //         [ extent[0][0] + quadWidth, extent[0][1] ],
                     //         [ extent[1][0], extent[0][1] + quadHeight ]
                     //     ],
                     //     2: [
                     //         [ extent[1][0] - quadWidth, extent[1][1] - quadHeight ],
                     //         [ extent[1][0], extent[1][1] ]
                     //     ]
                     // });

                     return (obj) => {
                         const x = obj["x"], y = obj["y"];
                         // console.log(x, y);

                         if (x < quad_extents[1][1][1][0])  {
                             if (y < quad_extents[1][1][1][1]) {
                                 // console.log("... maps into extent :", quad_extents[1][1]);
                                 return [ 1, 1 ];
                             } else {
                                 // console.log("... maps into extent:", quad_extents[1][2]);
                                 return [ 1, 2 ]
                             }
                         } else {
                             if (y < quad_extents[2][2][0][1]) {
                                 // console.log("... maps into extent :", quad_extents[2][1]);
                                 return [ 2, 1 ];
                             } else {
                                 // console.log("... maps into extent :", quad_extents[2][2]);
                                 return [ 2, 2 ]
                             }
                         }
                     }
                 },
                 store = null
    ) {
        this.capacity = (capacity < 4) ? 4 : capacity; // min capacity is 4 objects
        this.extent = extent;
        this.last = (Array.isArray(store)) ? store[store.length - 1] : store;
        this.routeMethod = routeMethod;
        this.store = store || [];
    }

    get (level, x, y) {

        if (level > 0) {

            if (level === 1 && x in this.store && y in this.store[x]) {
                return this.store[x][y].get()

            } else if (level > 1) {
                const [ nx, ny ] = this.relativeCoords(level, x, y);

                if (Array.isArray(this.store[nx][ny].store)) {
                    return this.store[nx][ny].store;
                } else {
                    return this.store[nx][ny].get(level - 1, x, y);
                }

            } else if (Array.isArray(this.store)) {
                return this.store;

            } else return this.store;

        } else if (Array.isArray(this.store)) {
            return this.store;

        } else {
            return this.store;
        }
    }

    absoluteCoords (source_level, xs, ys, target_level, xr, yr) {
        const x0 = (Math.pow(2, target_level) / Math.pow(2, source_level)) * (xs), // * Math.pow(2, target_level - 3)), //  * xs
              y0 = (Math.pow(2, target_level) / Math.pow(2, source_level)) * (ys); // * Math.pow(2, target_level - 3)); // Math.pow(2, target_level) / Math.pow(2, source_level) * ys

        const x1 = (xr === 2) ? x0 : x0 - 1,
              y1 = (yr === 2) ? y0 : y0 - 1;
        return [ target_level, x1, y1 ];
    }

    relativeCoords (level, x1, y1) {
        const n = level;
        const x0 = Math.round(x1 / 2);
        const y0 = Math.round(y1 / 2);
        const xr = x1 % 2;
        const yr = y1 % 2;
        if (level - 1 > 0) {
            const [ x2, y2 ] = this.relativeCoords(level - 1, x0, y0);
            return [x2, y2];
        } else {
            const x2 = (xr == 0) ? 2 : 1;
            const y2 = (yr == 0) ? 2 : 1;
            return [x2, y2];
        }

    }

    peek () {
        if (Array.isArray(this.store)) {
            return this.store.length;
        } else {
            const children = {
                1: {
                    1: this.store[1][1].peek(),
                    2: this.store[1][2].peek()
                },
                2: {
                    1: this.store[2][1].peek(),
                    2: this.store[2][2].peek()
                }
            };

            for (let i=1; i<=2; ++i) {
                for (let j=1; j<=2; ++j) {
                    if (children[i][j] >= 0) {
                        children[i][j] = children[i][j];
                    } else {
                        let desc_total = 0;
                        for (let s=1; s<=2; ++s) {
                            for (let t = 1; t<=2; ++t) {
                                desc_total += parseInt(children[i][j][s][t])
                            }
                        }
                        children[i][j] = desc_total;
                    }
                }
            }

            return children;
        }
    }

    push (obj) {
        if (typeof obj !== 'object') return;

        if (Array.isArray(this.store) && this.store.length < this.capacity - 1) {
            this.store.push(obj);

        } else if (Array.isArray(this.store)) {
            // Which subdivision do we this obj to?
            // selector parses the obj and returns coords
            const new_store = [].concat(this.store);
            new_store.push(obj);
            const store_map = new_store.map(stored_obj => this.route(stored_obj));

            this.store = this.subdivide(this.extent);

            store_map.forEach((v, i, a) => {
                const [x1, y1] = v;
                // console.log("Push to quad subdivision ", x1, y1);
                this.store[x1][y1].push(new_store[i]);
            })

        } else {
            const [ x1, y1 ] = this.route(obj);
            // console.log("Push to quad subdivision ", x1, y1);

            if (x1 < 1 || x1 > 2 || y1 < 1 || y1 > 2) {
                throw new Error("Bad subdivision coords from route ", x1, y1, x2, y2);

            } else {
                if (x1 in this.store && y1 in this.store[x1]) {
                    if (typeof this.store[x1][y1].push === 'function') {
                        this.store[x1][y1].push(obj);
                    } else {
                        console.error(x1, y1, this.store[x1][y1])
                    }

                } else {
                    // 4 new quad stores
                    this.store = this.subdivide(this.extent);
                    this.store[x1][y1].push(obj);
                }
            }
        }

        // keep ref to last obj in
        this.last = obj;
    }

    pop () {
        return Object.assign({}, this.last);
    }

    route(obj) {
        return this.routeMethod(this.extent)(obj);
    }

    subdivide (extent) {
        const parentWidth = extent[1][0] - extent[0][0],
            parentHeight = extent[1][1] - extent[0][1];

        const quadWidth = parentWidth / 2,
            quadHeight = parentHeight / 2,
            quadExtents = {
                1: {
                    1: [
                        [ extent[0][0], extent[0][1] ],
                        [ extent[0][0] + quadWidth, extent[0][1] + quadHeight ]
                    ],
                    2: [
                        [ extent[0][0], extent[1][1] - quadHeight ],
                        [ extent[1][0] - quadWidth, extent[1][1] ]
                    ]
                },
                2: {
                    1: [
                        [ extent[0][0] + quadWidth, extent[0][1] ],
                        [ extent[1][0], extent[0][1] + quadHeight ]
                    ],
                    2: [
                        [ extent[1][0] - quadWidth, extent[1][1] - quadHeight ],
                        [ extent[1][0], extent[1][1] ]
                    ]
                }
            };

        return {
            1: {
                1: new QuadStore(this.capacity, quadExtents[1][1], this.routeMethod),
                2: new QuadStore(this.capacity, quadExtents[1][2], this.routeMethod) },
            2: {
                1: new QuadStore(this.capacity, quadExtents[2][1], this.routeMethod),
                2: new QuadStore(this.capacity, quadExtents[2][2], this.routeMethod)
            }
        }
    }
}

// // test
// const quad = new QuadStore(4, [[ -1.0, -1.0 ], [ 1, 1 ]],
//     (extent) => { return (obj) => [ Math.round(1 + Math.random()), Math.round(1 + Math.random())]; });
// console.log(1, quad);
//
// quad.push({ "name": "a new thing" });
// console.log(2, quad.get());
//
// console.log('store size: ', quad.peek());
//
// quad.push({ "name": "another thing" });
// console.log(3, quad.get());
//
// console.log('store size: ', quad.peek());
//
// quad.push({ "name": "yet another thing" });
// console.log(4, quad.get());
//
// console.log('store size: ', quad.peek());
//
// quad.push({ "name": "one more thing" });
// console.log(5, quad.get(1, 1, 1));
//
// console.log('store size: ', quad.peek());
//
// quad.push({ "name": "a new thing for a subquad" });
// console.log(6, quad.get(1, 1, 1));
//
// console.log('store size: ', quad.peek());
//
// const eventQuad = new QuadStore(
//     4,
//     [[ -16.0, -16.0 ],[ 16.0, 16.0 ]]
// );
//
// console.log(1, eventQuad);
//
// eventQuad.push({"x":-2.0886366751023138,"y":-1.3593318602961386,"t":1577810734936});
// console.log(2, eventQuad.get());
//
// console.log('store size: ', eventQuad.peek());
//
// eventQuad.push({"x":-2.098437556972397,"y":-1.2783452238632382,"t":1577810735016});
// console.log(3, eventQuad.get());
//
// console.log('store size: ', eventQuad.peek());
//
// eventQuad.push({"x":-2.144963348406517,"y":-1.1422073646014228,"t":1577810735096});
// console.log(4, eventQuad.get());
//
// console.log('store size: ', eventQuad.peek());
//
// eventQuad.push({"x":-2.1690246630501147,"y":-1.0228172059850336,"t":1577810735176});
// console.log(5, eventQuad.get(1, 1, 1));
//
// console.log('store size: ', eventQuad.peek());
//
// eventQuad.push({"x":-2.1697751784260326,"y":-0.9055892785828303,"t":1577810735256});
// console.log(6, eventQuad.get(1, 1, 1));
//
// console.log('store size: ', eventQuad.peek());
//
// [
//     {"x":-2.0886366751023138,"y":-1.3593318602961386,"t":1577810734936},
//     {"x":-2.098437556972397,"y":-1.2783452238632382,"t":1577810735016},
//     {"x":-2.144963348406517,"y":-1.1422073646014228,"t":1577810735096},
//     {"x":-2.1690246630501147,"y":-1.0228172059850336,"t":1577810735176},
//     {"x":-2.1697751784260326,"y":-0.9055892785828303,"t":1577810735256},
//     {"x":-2.1948808233648953,"y":-0.7791119494075677,"t":1577810735346},
//     {"x":-2.1956188999851847,"y":-0.6183983466654468,"t":1577810735416},
//     {"x":-2.226720160663804,"y":-0.5171401862111875,"t":1577810735476},
//     {"x":-2.239920895389541,"y":-0.47894422656018465,"t":1577810735566},
//     {"x":-2.253898996867784,"y":-0.43755873375432364,"t":1577810735636},
//     {"x":-2.2940800250188147,"y":-0.3816692161762003,"t":1577810735726},
//     {"x":-2.2760398879932193,"y":-0.3397532592379948,"t":1577810735796},
//     {"x":-2.2846375742799414,"y":-0.28563483096172115,"t":1577810735956}
// ].forEach(obj => eventQuad.push(obj));
//
//
// // Now use recursive method to retrieve results
// console.log(1, eventQuad.get()); // level 0 store of quads
// console.log(2, eventQuad.peek()); // in level (0) => data @ 1, 1
// console.log(3, eventQuad.get(1, 1, 1)); // level (1) store of quads
// console.log(4, eventQuad.get(1, 1, 1)[2][2].peek()); // in level (1) 2, 2 => data @ 2, 2
// console.log(5, eventQuad.get(2, 2, 2)); // level (2) store of quads
// console.log(6, eventQuad.get(2, 2, 2)[2][2].peek()); // in level (2) 2, 2 => data @ 1, 2
// console.log(7, eventQuad.get(3, 3, 4)); // level (3) store of quads
// console.log(8, eventQuad.get(3, 4, 4)[2][2].peek()); // in level (3) 2, 2 => data @ 1, 2
// console.log(9, eventQuad.get(4, 7, 8));
// console.log(10, eventQuad.get(4, 7, 8)[1][2].peek()); // in level (4) 2, 2 => data @ 2, 1 & 2, 2
// console.log(11, eventQuad.get(5, 13, 15));
// console.log(12, eventQuad.get(5, 13, 16));
//
// // Need helper method for translating to absolute coordinates between levels
// console.log(13, eventQuad.get(...eventQuad.absoluteCoords(2, 2, 2, 3, 2, 2)));
// console.log(14, eventQuad.get(...eventQuad.absoluteCoords(2, 2, 2, 3, 2, 2))[2][2].peek()); // data @ 1, 2
// console.log(...eventQuad.absoluteCoords(2, 2, 2, 3, 2, 2)); // 3 4 4
// console.log(15, eventQuad.get(...eventQuad.absoluteCoords(3, 4, 4, 4, 1, 2)));
// console.log(16, eventQuad.get(...eventQuad.absoluteCoords(3, 4, 4, 4, 1, 2))[1][2].peek()); // data @ 2, 1 & 2, 2
// console.log(...eventQuad.absoluteCoords(3, 4, 4, 4, 1, 2)); // 4 7 8
// console.log(17, eventQuad.get(...eventQuad.absoluteCoords(4, 7, 8, 5, 2, 1)));
// console.log(18, eventQuad.get(...eventQuad.absoluteCoords(4, 7, 8, 5, 2, 1))[2][1].peek()); // data @ 2, 2
// console.log(19, eventQuad.get(...eventQuad.absoluteCoords(4, 7, 8, 5, 2, 2)));
// console.log(...eventQuad.absoluteCoords(4, 7, 8, 5, 2, 2)); // 5 14 16
// console.log(20, eventQuad.get(...eventQuad.absoluteCoords(4, 7, 8, 5, 2, 2))[2][1].peek()); // data @ 2, 2
// console.log(21, eventQuad.get(...eventQuad.absoluteCoords(4, 7, 8, 5, 2, 2))[2][2]);
// console.log(22, eventQuad.get(...eventQuad.absoluteCoords(5, 14, 16, 6, 2, 2))[2][2].peek()); // data @ 1, 1 & 2, 1
// console.log(...eventQuad.absoluteCoords(5, 14, 16, 6, 2, 2));
// console.log(23, Array.isArray(eventQuad.get(...eventQuad.absoluteCoords(6, 28, 32, 7, 2, 1))[2][1].get()));
