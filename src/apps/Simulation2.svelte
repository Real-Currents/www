<script>
    import { createEventDispatcher, onMount } from 'svelte';
    import * as GL from '@sveltejs/gl';
    import NavigationControls from './components/NavigationControls.svelte';
    import generateFace from './modules/grid-generator';
    import QuadStore from './modules/quad-store';
    import markerVert from './shaders/sprite-vertex-shader.glsl';
    import quadVert from './shaders/normal-selected-txt-vertex-shader.glsl';
    import terrainVert from './shaders/planar-terrain-vertex-shader.glsl';
    import markerFrag from './shaders/sprite-fragment-shader.glsl';
    import quadFrag from './shaders/normal-selected-txt-fragment-shader.glsl';
    import terrainFrag from './shaders/planar-terrain-fragment-shader.glsl';

    let dispatcher = createEventDispatcher();

    let eventTotal = 0;

    const eventQuad = new QuadStore(
        6,
        [[ -16.0, -16.0 ],[ 16.0, 16.0 ]]
    );

    const eventsLoading = [false];

    const eventsLoaded = [false];

    const initQuadWidth = (eventQuad.extent[1][0] - eventQuad.extent[0][0]) / 2,
            initQuadDepth = (eventQuad.extent[1][1] - eventQuad.extent[0][1]) / 2;

    const timeExtent = [];

    const initialTerrainHeight = 0.0;

    const cursorDimensions = {
        x:-4.0, y:-4.0, z:initialTerrainHeight, w:8.0, h:8.0, d:1.0
    };

    let eventList = [];

    let eventState = {};

    let eventTime = 1577810698673;

    const foundGroups = { "1": null, "2": null, "3": null, "4": null, "5": null, "6": null };

    let quadList = [];

    const quadState = {
        1: {
            1: {
                x:-initQuadWidth,   y:0.0,      z:-initQuadDepth,
                w:initQuadWidth,    h:1.0,      d:initQuadDepth
            },
            2: {
                x:-initQuadWidth,   y:0.0,      z:0.0,
                w:initQuadWidth,    h:1.0,      d:initQuadDepth
            }
        },
        2: {
            1: {
                x:0.0,              y:0.0,      z:-initQuadDepth,
                w:initQuadWidth,    h:1.0,      d:initQuadDepth
            },
            2: {
                x:0.0,              y:0.0,      z:0.0,
                w:initQuadWidth,    h:1.0,      d:initQuadDepth
            }
        }
    };

    let showCursor = false;
    let showGroups = [ foundGroups[1], foundGroups[2], foundGroups[3], foundGroups[4], foundGroups[5], foundGroups[6] ];
    let showQuads = false;
    let showByTime = false;
    let playTimeLoop = false;
    let options = {
        'labels': ["Show Terrain Cursor", "Show Quad Extents", "Filter Events By Time", " Play Time Loop"],
        'values': [showCursor, showQuads, showByTime, playTimeLoop]
    };

    function checkEventVisibility(group, time) {
        return (
                group === 0 ||
                (showGroups[0] === true && 1 === Math.abs(group)) ||
                (showGroups[1] === true && 2 === Math.abs(group)) ||
                (showGroups[2] === true && 3 === Math.abs(group)) ||
                (showGroups[3] === true && 4 === Math.abs(group)) ||
                (showGroups[4] === true && 5 === Math.abs(group)) ||
                (showGroups[5] === true && 6 === Math.abs(group)) ||
                (!!showByTime & time - 100000 < eventTime && eventTime < time - 100000)
        )
    }

    function checkCursorIntersection(cursorExtent, quadExtent) {
        return !(
                cursorExtent[1][0] < quadExtent[0][0] ||
                cursorExtent[1][1] < quadExtent[0][1] ||
                cursorExtent[0][0] > quadExtent[1][0] ||
                cursorExtent[0][1] > quadExtent[1][1]
        )
    }

    function mapEventState (es, quads, level, cursorExtent, depth, x=1, y=1) {
        --depth;
        const firstLevelReset = {
            1: false,
            2: false
        };

        if (!Array.isArray(quads)) {
            // the store is a QuadStore, not an Array
            // so map the store to qs
            ++level;

            for (let s = 1; s <= 2; ++s) {
                if (typeof es[s] !== 'object') es[s] = {};

                for (let t = 1; t <= 2; ++t) {

                    if (Array.isArray(quads[s][t].store) || depth < 1) {

                        // Map this quad directly to qs
                        const quadWidth = quads[s][t].extent[1][0] - quads[s][t].extent[0][0];
                        const quadDepth = quads[s][t].extent[1][1] - quads[s][t].extent[0][1];
                        const quadMarker = {
                            x:quads[s][t].extent[0][0] + quadWidth / 2, y:quads[s][t].extent[0][1] + quadDepth / 2, group: 0,
                            t: (new Date).getTime()
                        };
                        const size = (Array.isArray(quads[s][t].store)) ?
                                quads[s][t].store.length :
                                quads[s][t].peek()[1][1] +
                                quads[s][t].peek()[1][2] +
                                quads[s][t].peek()[2][1] +
                                quads[s][t].peek()[2][2];

                        if (Array.isArray(quads[s][t].store)) {

                            if (quads[s][t].store.length > 0) {

                                es[s][t] = quads[s][t].store
                                // .filter(d => checkCursorIntersection(
                                //     cursorExtent,
                                //     [[d['x'] - 0.05, d['y'] - 0.05], [d['x'] + 0.05, d['y'] + 0.05]])
                                // )
                                .map(d => {
                                    var event = Object.assign({}, d);
                                    let p;
                                    for (p in event) {
                                        if (p === 'group') {
                                            // map groups
                                            const group = ("" + event['group']);
                                            if (group in foundGroups && foundGroups[group] === null) {
                                                foundGroups[group] = true;
                                            }
                                        } else if (p === 't') {
                                            // map times
                                            const minTime = timeExtent[0];
                                            const maxTime = timeExtent[1];
                                            if (!!minTime !== true || event['t'] < minTime) {
                                                timeExtent[0] = event['t']
                                            }
                                            if (!!maxTime !== true || event['t'] > maxTime) {
                                                timeExtent[1] = event['t']
                                            }
                                        }
                                    }

                                    if (!checkCursorIntersection(cursorExtent,
                                            [[event['x'] - 0.05, event['y'] - 0.05], [event['x'] + 0.05, event['y'] + 0.05]])
                                    ) {
                                        // flip sign to dim cursors that are outside the group
                                        event['group'] = -event['group'] ;
                                    }

                                    return event;
                                })
                                .slice();
                            }

                        } else if (level > 3 && size > 0) {
                            // if (level > 4) console.log("Level " + level +
                            //     " EventState " + (2 * (x - 1) + s) + "," + (2 * (y - 1) + t) +
                            //     " check cursor extents intersect: ", cursorExtent, quads[s][t].extent);

                            if (checkCursorIntersection(cursorExtent, quads[s][t].extent)) {
                                if (typeof es[s][t] !== 'object') es[s][t] = {};
                                // console.log("Depth "+ depth +", Level " + level +
                                //         " EventState " + (2 * (x - 1) + s) + "," + (2 * (y - 1) + t) +
                                //         " cursor extents intersect: ", cursorExtent, quads[s][t].extent);
                                // if marker extent intersects this quad, go deeper
                                mapEventState(es[s][t], quads[s][t].store, level, cursorExtent, 1, s, t);

                            } else {
                                es[s][t] = quadMarker;
                            }
                        }

                    } else if (depth > 0) {
                        // Map next level quads to qs
                        if (level === 1 && !firstLevelReset[s]) {
                            es[s] = {};
                            firstLevelReset[s] = true;
                        }
                        if (typeof es[s][t] !== 'object') es[s][t] = {};
                        const size = quads[s][t].peek()[1][1] +
                                quads[s][t].peek()[1][2] +
                                quads[s][t].peek()[2][1] +
                                quads[s][t].peek()[2][2];
                        // console.log("From level "+ level +" recurse into quad " + (2 * (x - 1) + s) + "," + (2 * (y - 1) + t) +
                        //         " (size " + size + ")");
                        mapEventState(es[s][t], quads[s][t].store, level, cursorExtent, depth, s, t);
                    }
                }
            }

            --level;
        }
    }

    function mapQuadState (qs, quads, level, depth, x=1, y=1) {
        --depth;
        const firstLevelReset = {
            1: false,
            2: false
        };

        if (!Array.isArray(quads)) {
            // the store is a QuadStore, not an Array
            // so map the store to qs
            ++level;

            for (let s = 1; s <= 2; ++s) {
                if (typeof qs[s] !== 'object') qs[s] = {};

                for (let t = 1; t <= 2; ++t) {
                    if (Array.isArray(quads[s][t].store) || depth === 1) {
                        // Map this quad directly to qs
                        const quadWidth = quads[s][t].extent[1][0] - quads[s][t].extent[0][0];
                        const quadDepth = quads[s][t].extent[1][1] - quads[s][t].extent[0][1];
                        const quadBox = {
                            x:quads[s][t].extent[0][0],    y:0.0,      z:quads[s][t].extent[0][1],
                            w:quadWidth,                   h:1.0,      d:quadDepth
                        };
                        const size = (Array.isArray(quads[s][t].store)) ?
                            quads[s][t].store.length :
                            quads[s][t].peek()[1][1] +
                                quads[s][t].peek()[1][2] +
                                quads[s][t].peek()[2][1] +
                                quads[s][t].peek()[2][2];

                        qs[s][t] = quadBox;
                        // console.log("Level " + level +
                        //         " QuadState " + (2 * (x - 1) + s) + "," + (2 * (y - 1) + t) +
                        //         ": ", qs[s][t]);

                    } else if (depth > 1) {
                        // Map next level quads to qs
                        if (level === 1 && !firstLevelReset[s]) {
                            qs[s] = {};
                            firstLevelReset[s] = true;
                        }
                        if (typeof qs[s][t] !== 'object') qs[s][t] = {};
                        const size = quads[s][t].peek()[1][1] +
                                quads[s][t].peek()[1][2] +
                                quads[s][t].peek()[2][1] +
                                quads[s][t].peek()[2][2];
                        // console.log("From level "+ level +" recurse into quad " + (2 * (x - 1) + s) + "," + (2 * (y - 1) + t) +
                        //         " (size " + size + ")");
                        mapQuadState(qs[s][t], quads[s][t].store, level, depth, s, t);
                    }
                }
            }

            --level;
        }
    }

    function mapStateToList (state, depth) {
        const list = [];
        --depth;

        if (Array.isArray(state)) {
            state.forEach(d => {
                if (typeof d === 'object' && 'x' in d && 'y' in d) {
                    list.push(Object.assign({}, d))
                }
            });

        } for (const x in state) {
            if (parseInt(x) === 1 || parseInt(x) === 2) {
                for (const y in state[x]) {
                    if (parseInt(y) === 1 || parseInt(y) === 2) {
                        if ('1' in state[x][y] || '2' in state[x][y]) {
                            if (depth > 0) {
                                mapStateToList(state[x][y], depth)
                                    .forEach(d => {
                                        if (typeof d === 'object' && 'x' in d && 'y' in d) {
                                            list.push(Object.assign({}, d))
                                        }
                                    });
                            }
                        } else {
                            list.push(Object.assign({}, state[x][y]));
                        }
                    }
                }
            }
        }

        // console.log(ql);

        return list.slice();
    }

    function refreshState() {

        if (!!eventsLoaded[0] !== true) return;

        const cursorExtent = [
            [
                worldPosition.x + (cursorDimensions.x / worldPosition.r),
                worldPosition.z + (cursorDimensions.y / worldPosition.r)
            ],
            [
                worldPosition.x + ((cursorDimensions.x + cursorDimensions.w) / worldPosition.r),
                worldPosition.z + ((cursorDimensions.y + cursorDimensions.h) / worldPosition.r)
            ]
        ];

        // console.log(worldPosition.r, cursorExtent);

        const depth = 5;

        // console.log(quadState);

        mapEventState(eventState,  eventQuad.get(), 0, cursorExtent, depth);

        // console.log(eventState);

        showGroups = showGroups.map((g, i) => {
            if (g === null) return foundGroups[i + 1];
            else return g;
        });

        // console.log(foundGroups);

        // now map eventState to a flat list for rendering
        eventList = mapStateToList(eventState, depth * depth);
    }

    // Use a Web Worker to load position events...
    // as if they are coming in from async remote service
    if (window.Worker) {

        window.eventQuad = eventQuad; // debug

        const eventProcessor = new Worker('data/worker.js');

        eventProcessor.postMessage({
            "action": "Load event data",
            "payload": {
                "extent": eventQuad.extent
            }
        });

        console.log("Quads initialized: ", quadList);

        eventProcessor.onmessage = function(event) {
            eventsLoading[0] = true;

            if (typeof event.data === 'object' && "x" in event.data && "y" in event.data) {
                eventQuad.push(Object.assign({}, event.data));
                eventTotal++;

            } else {
                // last message inidicates event loading is done... for now
                console.log(event.data);

                console.log("Total event loaded: ", eventTotal);

                eventsLoaded[0] = true;

                const depth = 6;

                mapQuadState(quadState, eventQuad.get(), 0, depth);

                // now map quadState to a flat list for rendering
                quadList = mapStateToList(quadState, depth);

                console.log("QuadList has ", quadList.length);

                refreshState();
            }
        };

    } else {
        console.log('Your browser doesn\'t support web workers.');
        window.alert('Your browser doesn\'t support web workers, so no event data can be loaded.');
    }

    let navInit;

    export let title;
    export let color = '#ff3e00';

    const light = {};

    let sw = 1; // scale quad width
    let sh = 1; // scale quad height
    let sd = 1; // scale quad depth

    let webgl;
    let quad_textures = [];
    let displacementTexture = null;
    let terrainTexture = null;
    let markerTexture = null;
    let texture = null;

    // initial view
    let location = new Float32Array([ 0.25, 2.5, 5 ]);
    let target = new Float32Array([0, 1, 0]);

    const captureViewDirection = (loc, tgt) => "";

    const from_hex = hex => parseInt(hex.slice(1), 16);

    const heightMap = new Image();
    const terrainMap = new Image();
    terrainMap.alt = 'Terrain Texture';
    heightMap.crossOrigin = terrainMap.crossOrigin = '';
    heightMap.width = terrainMap.width = 1024;
    heightMap.width = terrainMap.height = 1024;

    let terrain; // will help to bind builtin uv coordinates

    const markerImage = new Image();
    markerImage.crossOrigin = '';

    const markerHeight = 0.05;

    let worldPosition = {
        x: 0.0,
        y: 0.0,
        z: 0.0,
        r: 1.0
    };

    let updateWorld = event => {
        // console.log(worldPosition)

        refreshState()
    };

    /* This is a helper callback to bind custom uniforms/attributes
     * and to pass custom buffers, like the ad-hoc texture coords
     * used in normal-selected texture shader below. I inserted a
     * hook directly in the @sveltejs/gl source for this purpose
     */
    let process_extra_shader_components = (gl, material, model) => {
        // console.log("Process Extra Shader Components");
        const program = material.program;

        if ((material.vertName == "texture-vertex-shader" && material.fragName == "texture-fragment-shader") ||
            // (material.vertName == "planar-terrain-vertex-shader" && material.fragName == "planar-terrain-fragment-shader") ||
            (material.vertName == "normal-selected-txt-vertex-shader" && material.fragName == "normal-selected-txt-fragment-shader")
        ) {
            // console.log(material.vertName, material.fragName);

            const vertexTextureCoords = gl.getAttribLocation(program, "uv");

            // gl.disable(gl.CULL_FACE); // for double-sided poly

            gl.enableVertexAttribArray(vertexTextureCoords);
            const textureBuffer = gl.createBuffer();
            const textureCoords = [

                // front: 0 1 2 3
                1.0, 1.0,
                0.0, 1.0,
                1.0, 0.0,
                0.0, 0.0,

                // left: 1 4 3 6
                1.0, 1.0,
                0.0, 1.0,
                1.0, 0.0,
                0.0, 0.0,

                // back: 4 5 6 7
                1.0, 1.0,
                0.0, 1.0,
                1.0, 0.0,
                0.0, 0.0,

                // right: 5 0 7 2
                1.0, 1.0,
                0.0, 1.0,
                1.0, 0.0,
                0.0, 0.0,

                // top: 4 1 5 0
                0.0, 1.0,
                0.0, 0.0,
                1.0, 1.0,
                1.0, 0.0,

                // bottom: 3 6 2 7
                0.0, 1.0,
                0.0, 0.0,
                1.0, 1.0,
                1.0, 0.0,
            ];

            gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
            gl.vertexAttribPointer(vertexTextureCoords, 2, gl.FLOAT, false, 0, 0);

            // Un-bind buffers
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

            if ((material.vertName == "normal-selected-txt-vertex-shader" && material.fragName == "normal-selected-txt-fragment-shader")) {
                for (let t = 0; t < 6; ++t) {
                    if (!!quad_textures[t]) {
                        const fragmentTextureLocation = gl.getUniformLocation(program, "uTexture" + t);
                        switch(t) {
                            case 1: gl.activeTexture(gl.TEXTURE1); break;
                            case 2: gl.activeTexture(gl.TEXTURE2); break;
                            case 3: gl.activeTexture(gl.TEXTURE3); break;
                            case 4: gl.activeTexture(gl.TEXTURE4); break;
                            case 5: gl.activeTexture(gl.TEXTURE5); break;
                            default:
                                gl.activeTexture(gl.TEXTURE0);
                        }
                        gl.bindTexture(gl.TEXTURE_2D, quad_textures[t]);
                        gl.uniform1i(fragmentTextureLocation, t);
                    }
                }
            } else {
                if (!!terrainTexture) {
                    const fragmentTextureLocation = gl.getUniformLocation(program, "uTexture");
                    gl.activeTexture(gl.TEXTURE0);
                    gl.bindTexture(gl.TEXTURE_2D, terrainTexture);
                    gl.uniform1i(fragmentTextureLocation, 0);
                }
            }

        } else if (material.vertName == "planar-terrain-vertex-shader" && material.fragName == "planar-terrain-fragment-shader") {
            // console.log(material.vertName, material.fragName);

            if (!!terrainTexture && !!displacementTexture) {
                const displacementTextureLocation = gl.getUniformLocation(program, "terrainMap");
                const fragmentTextureLocation = gl.getUniformLocation(program, "uTexture");

                gl.activeTexture(gl.TEXTURE1);
                gl.bindTexture(gl.TEXTURE_2D, displacementTexture);
                gl.uniform1i(displacementTextureLocation, 1);

                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, terrainTexture);
                gl.uniform1i(fragmentTextureLocation, 0);


            }

        } else if (material.vertName == "sprite-vertex-shader" && material.fragName == "sprite-fragment-shader") {

            if (!!markerTexture && !!displacementTexture) {
                const fragmentTextureLocation = gl.getUniformLocation(program, "uTexture");

                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, markerTexture);
                gl.uniform1i(fragmentTextureLocation, 0);
            }

        } else if (material.vertName == "texture-vertex-shader" && material.fragName == "cubemap-fragment-shader") {
            // console.log(material.vertName, material.fragName);

            const fragmentTextureLocation = gl.getUniformLocation(program, "uTexture");

            if (!!texture) {
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
                gl.uniform1i(fragmentTextureLocation, 0);
            }
        }

    };


    // Get A 2D context for dynamic textures
    /** @type {Canvas2DRenderingContext} */
    const ctx = document.createElement("canvas").getContext("2d");
    ctx.canvas.width = 256;
    ctx.canvas.height = 256;

    function adjustColor (clr, selector) {
        const r = (selector !== selector) ? parseInt('0x' + clr.substr(1, 2), 16) : // default to clr
                    (selector < 1) ? 127 : (selector % 5 < 1) ? 64 : (selector === 4) ? 127 : 255,
            g = (selector !== selector) ? parseInt('0x' + clr.substr(3, 2), 16) : // default to clr
                    (selector < 1) ? 127 : (selector % 3 < 1) ? 64 : (selector === 1) ? 127 : 255,
            b = (selector !== selector) ? parseInt('0x' + clr.substr(5, 2), 16) : // default to clr
                    (selector < 1) ? 127 : (selector % 2 < 1) ? 64 : 255;

        // return Math.abs((((hr < 255) ? hr : r) << 16) + (g << 8) + ((hb < 255) ? hb : b));
        return Math.abs((r << 16) + (g << 8) + b);
    }

    function heightMapper (x, y) {
        // Do something with initTerrainHeight and lookup h in heightmap
        const offsetH = (eventTotal > 0) ? (quadList[x][y] / eventTotal) : 0;
        console.log(quadList, eventTotal , offsetH);
        return offsetH;
    };

    onMount(() => {
        let frame;

        // console.log(webgl);

        if (typeof navInit === "function") {
            // Initialize navigation controls
            navInit();
        }

        for (let t = 0; t < 6; ++t) {
            if (!!quad_textures[t] == false) {
                // Create a texture and create initial bind
                quad_textures[t] = webgl.createTexture();
                webgl.bindTexture(webgl.TEXTURE_2D, quad_textures[t]);
                webgl.bindTexture(webgl.TEXTURE_2D, null);
            }
        }

        if (!!displacementTexture == false) {
            // Create a texture and create initial bind
            displacementTexture = webgl.createTexture();
            webgl.bindTexture(webgl.TEXTURE_2D, displacementTexture);
            webgl.bindTexture(webgl.TEXTURE_2D, null);
        }

        if (!!terrainTexture == false) {
            // Create a texture and create initial bind
            terrainTexture = webgl.createTexture();
            webgl.bindTexture(webgl.TEXTURE_2D, terrainTexture);
            webgl.bindTexture(webgl.TEXTURE_2D, null);
        }

        if (!!markerTexture == false) {
            // Create a texture and create initial bind
            markerTexture = webgl.createTexture();
            webgl.bindTexture(webgl.TEXTURE_2D, markerTexture);
            webgl.bindTexture(webgl.TEXTURE_2D, null);
        }

        // Texture constants
        const level = 0;
        const internalFormat = webgl.RGBA;
        const format = webgl.RGBA;
        const type = webgl.UNSIGNED_BYTE;

        heightMap.addEventListener('load', function () {
            // Now that the image has loaded make copy it to the texture.
            console.log("Bind to texture");

            webgl.bindTexture(webgl.TEXTURE_2D, displacementTexture);
            webgl.texImage2D(webgl.TEXTURE_2D, level, internalFormat, format, type, heightMap);
            webgl.generateMipmap(webgl.TEXTURE_2D);
            webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_MAG_FILTER, webgl.NEAREST_MIPMAP_LINEAR);
            webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_MIN_FILTER, webgl.NEAREST_MIPMAP_LINEAR);
        });

        heightMap.src = "images/heightmap.png";

        terrainMap.addEventListener('load', function () {
            // Now that the image has loaded make copy it to the texture.
            console.log("Bind to texture");

            webgl.bindTexture(webgl.TEXTURE_2D, terrainTexture);
            webgl.texImage2D(webgl.TEXTURE_2D, level, internalFormat, format, type, terrainMap);
            webgl.generateMipmap(webgl.TEXTURE_2D);
            webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_MAG_FILTER, webgl.NEAREST_MIPMAP_LINEAR);
            webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_MIN_FILTER, webgl.NEAREST_MIPMAP_LINEAR);
        });

        terrainMap.src = "images/colormap.jpg";

        // Pass this colormap texture to the terrain object, just
        // to get @svelte/gl to bind the texture coordinates in the
        // mesh to the 'uv' uniform in the vertext/fragment shaders.
        // The actual map that is applied to fragColor comes from
        // the terrain map image above
        terrain = new GL.Texture("images/map.png", { width: 512, height: 512 });

        markerImage.addEventListener('load', function () {
            // Now that the image has loaded make copy it to the texture.
            console.log("Bind to texture");

            webgl.bindTexture(webgl.TEXTURE_2D, markerTexture);
            webgl.pixelStorei(webgl.UNPACK_FLIP_Y_WEBGL, false); // sometimes the marker appears upside down
            webgl.texImage2D(webgl.TEXTURE_2D, level, internalFormat, format, type, markerImage);
            webgl.generateMipmap(webgl.TEXTURE_2D);
            webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_MAG_FILTER, webgl.NEAREST_MIPMAP_LINEAR);
            webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_MIN_FILTER, webgl.NEAREST_MIPMAP_LINEAR);
            // webgl.pixelStorei(webgl.UNPACK_FLIP_Y_WEBGL, true);
        });

        markerImage.src = "images/pin.png";

        const faceInfos = [
            { target: webgl.TEXTURE_2D, faceColor: '#F00', textColor: '#0FF', text: '+X' },
            { target: webgl.TEXTURE_2D, faceColor: '#FF0', textColor: '#00F', text: '-X' },
            { target: webgl.TEXTURE_2D, faceColor: '#0F0', textColor: '#F0F', text: '+Y' },
            { target: webgl.TEXTURE_2D, faceColor: '#0FF', textColor: '#F00', text: '-Y' },
            { target: webgl.TEXTURE_2D, faceColor: '#00F', textColor: '#FF0', text: '+Z' },
            { target: webgl.TEXTURE_2D, faceColor: '#F0F', textColor: '#0F0', text: '-Z' }
        ];

        faceInfos.forEach((faceInfo, i, a) => {
            const { target, faceColor, textColor, text } = faceInfo;
            // Asynchronously load an image
            const img = new Image();
            img.crossOrigin = '';

            img.id = '' + (i + 1);

            // Use 2d face generator to generate 6 images
            // generateFace(ctx, faceColor, textColor, text);
            generateFace(ctx, faceColor, 16);

            // Upload the canvas to the cubemap face.
            const width = ctx.canvas.width;
            const height = ctx.canvas.height;
            const previewWidth = ctx.canvas.width / 4;

            img.style.margin = 'auto';
            img.style.position = 'fixed';
            img.style.top = '0px';
            img.style.left = i * previewWidth + 'px';
            img.style.width = previewWidth + 'px';
            img.addEventListener('load', function () {
                // Now that the image has loaded make copy it to the texture.
                console.log("Bind to texture");

                webgl.bindTexture(webgl.TEXTURE_2D, quad_textures[i]);
                webgl.texImage2D(target, level, internalFormat, format, type, img);
                webgl.generateMipmap(webgl.TEXTURE_2D);
                webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_MAG_FILTER, webgl.NEAREST_MIPMAP_LINEAR); // webgl.LINEAR_MIPMAP_LINEAR);
                webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_MIN_FILTER, webgl.NEAREST_MIPMAP_LINEAR); // webgl.LINEAR_MIPMAP_LINEAR);
            });

            ctx.canvas.toBlob((blob) => {
                img.src = URL.createObjectURL(blob);
            });

            // Setup each face so it's immediately renderable
            if (!!quad_textures[i]) webgl.texImage2D(target, level, internalFormat, width, height, 0, format, type, null);
        });

        const loop = () => {
            frame = requestAnimationFrame(loop);

            if (!!options['values'][3]) {
                eventTime += 66;

                if (eventTime > timeExtent[1]) {
                    eventTime = timeExtent[0]
                }
            }

            light.x = 3 + (0.0001 * Math.sin(Date.now() * 0.001));
            light.y = 25 + (0.0002 * Math.sin(Date.now() * 0.0004));
            light.z = 3 + (0.0001 * Math.cos(Date.now() * 0.002));
        };

        loop();

        return () => cancelAnimationFrame(frame);
    });
</script>

<GL.Scene bind:gl={webgl} backgroundOpacity=1.0 process_extra_shader_components={process_extra_shader_components}>
    <GL.Target id="center" location={[0, 0, 0]}/>

    <GL.OrbitControls maxPolarAngle={Math.PI / 2} {location} { target}>
        {captureViewDirection(location, target)}
        <GL.PerspectiveCamera {location} lookAt="center" near={0.01} far={1000}/>
    </GL.OrbitControls>

    <GL.AmbientLight intensity={0.3}/>
    <GL.DirectionalLight direction={[-1,-1,-1]} intensity={0.5}/>

    {#if options['values'][0]}
        <!-- cursor -->
        <GL.Mesh
                geometry={GL.box(cursorDimensions)}
                location={[0, -worldPosition.y + markerHeight, 0]}
                rotation={[-90, 0, 0]}
                scale={[0.99/worldPosition.r, 0.99/worldPosition.r, 0.5]}
                vert={quadVert}
                frag={quadFrag}
                uniforms={{ color: adjustColor(color), alpha: 1.0 }}
                transparent
        />
    {/if}

    <!-- world -->
    <GL.Group location={[-worldPosition.x, -worldPosition.y, -worldPosition.z]}>

        {#if options['values'][1]}
            {#each quadList as quad}
            <!-- quadBox -->
            <GL.Mesh
                    geometry={GL.box(quad)}
                    location={[0, 0, 0]}
                    rotation={[0, 0, 0]}
                    scale={[sw, sh, sd]}
                    vert={quadVert}
                    frag={quadFrag}
                    uniforms={{ color: adjustColor(color), alpha: 1.0 }}
                    transparent
            />
            {/each}
        {/if}

        {#each eventList as event}
            {#if event['group'] === 0 || (
                (showGroups[0] === true && 1 === Math.abs(event['group'])) ||
                (showGroups[1] === true && 2 === Math.abs(event['group'])) ||
                (showGroups[2] === true && 3 === Math.abs(event['group'])) ||
                (showGroups[3] === true && 4 === Math.abs(event['group'])) ||
                (showGroups[4] === true && 5 === Math.abs(event['group'])) ||
                (showGroups[5] === true && 6 === Math.abs(event['group']))
            ) && (
                (!options['values'][2]) ||
                (!!options['values'][2] && (event['t'] - 333 < eventTime && eventTime < event['t'] + 333))
            )}
            <!-- markers -->
            <GL.Mesh
                    geometry={GL.sprite()}
                    location={[event['x'], initialTerrainHeight + markerHeight + event['height'], event['y']]}
                    vert={markerVert}
                    frag={markerFrag}
                    uniforms={{ color: adjustColor(color, event['group']), alpha: ((event['group'] > 0 && ((!options['values'][2]) || (!!options['values'][2] && (event['t'] - 33 < eventTime && eventTime < event['t'] + 33)))) ? 1.0 : 0.5) }}
                    transparent
            />
            {/if}
        {/each}

        <!-- ground -->
        <GL.Mesh
                geometry={GL.terrain()}
                location={[0, (initialTerrainHeight - 0.01), 0]}
                rotation={[-90, 0, 0]}
                scale={initQuadWidth}
                vert={terrainVert}
                frag={terrainFrag}
                uniforms={{ color: 0xffffff, bumpmap: terrain, colormap: terrain }}
        />

        <!-- moving light -->
        <GL.Group location={[light.x,light.y,light.z]}>
            <GL.Mesh
                    geometry={GL.sphere({ turns: 36, bands: 36 })}
                    location={[0,0.2,0]}
                    scale={0.1}
                    uniforms={{ color: 0xffffff, emissive: 0xff0000 }}
            />

            <GL.PointLight
                    location={[0,0,0]}
                    color={0xffccee}
                    intensity={0.75}
            />
        </GL.Group>

    </GL.Group>

</GL.Scene>

<NavigationControls
        bind:init={navInit}
        bind:optionFlags={options}
        bind:worldPosition={worldPosition}
        bind:viewLocation={location}
        bind:viewTarget={ target}
        bind:groups={showGroups}
        bind:playTime={eventTime}
        extent={eventQuad.extent}
        timeExtent={timeExtent}
        title={title}
        on:move={(event) => updateWorld(event)} >
</NavigationControls>

{#if !(eventsLoaded && eventsLoaded[0] === true)}
<div class="spinner"></div>
{/if}
