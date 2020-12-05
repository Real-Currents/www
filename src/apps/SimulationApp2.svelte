<script>
    import { onMount } from 'svelte';
    import * as GL from '@sveltejs/gl';
    import NavigationControls from './components/NavigationControls.svelte';
    import generateFace from './modules/grid-generator';
    import QuadStore from "./modules/quad-store";
    import terrain from './modules/terrain-small';
    import markerFrag from './shaders/custom/sprite-fragment-shader.glsl';
    import markerVert from './shaders/custom/sprite-vertex-shader.glsl';
    import quadFrag from './shaders/custom/normal-selected-txt-fragment-shader.glsl';
    import quadVert from './shaders/custom/normal-selected-txt-vertex-shader.glsl';
    import terrainFrag from './shaders/custom/terrain-frag.glsl';
    import terrainVert from './shaders/custom/terrain-and-light-vert.glsl';

    export let title;

    export let color = '#F7C77B';

    let eventTotal = 0;

    const eventQuad = new QuadStore(
        6,
        [[ -16.0, -16.0 ],[ 16.0, 16.0 ]]
    );

    const eventsLoading = [ false ];

    const eventsLoaded = [ false ];

    const initQuadWidth = (eventQuad.extent[1][0] - eventQuad.extent[0][0]) / 2,
        initQuadDepth = (eventQuad.extent[1][1] - eventQuad.extent[0][1]) / 2;

    const heightmap = [];
    const gridSizeX = initQuadWidth * 2;
    const gridSizeZ = initQuadDepth * 2;

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
        'labels': [ "Show Terrain Cursor", "Show Quad Extents", "Filter Events By Time", " Play Time Loop" ],
        'values': [ showCursor, showQuads, showByTime, playTimeLoop ]
    };
    let ranges = {
        labels: [ "alpha-blocks", "terrain-height", "terrain-rotation", "light-distance" ],
        min: [ 0.0, 1.0, 0.0, 1.0 ],
        max: [ 1.0, 2.0, 180.0, 100.0 ],
        step: [ 0.05, 0.25, 15.0, 10.0 ],
        values: []
    };
    let timeExtent = [];

    let a = 0.0;
    let w = 1;
    let h = 1;
    let d = 1;
    let rot = 90;

    const light = {
        color: "#FFFFFF"
    };

    const markerImage = new Image();
    markerImage.crossOrigin = '';

    const markerHeight = 0.05;

    let colormap;
    let normalmap;
    let use_heightmap = false;

    const terrainMap = new Image();
    terrainMap.alt = 'Terrain Texture';
    terrainMap.crossOrigin = '';
    terrainMap.width = 1024;
    terrainMap.height = 1024;

    let quad_textures = [];
    let terrainTexture = null;
    let markerTexture = null;
    let texture = null;

    let worldPosition = {
        x: 0.0,
        y: 0.0,
        z: 0.0,
        r: 1.0
    };

    let webgl;

    function adjustColor (clr, height = 1) {
        const r = parseInt('0x' + clr.substr(1, 2), 16),
                g = parseInt('0x' + clr.substr(3, 2), 16),
                b = parseInt('0x' + clr.substr(5, 2), 16);

        const hr = Math.floor(r * (height / 0.25)),
                hb = Math.floor(b * (height / 0.25));
        return Math.abs((((hr < 255) ? hr : r) << 16) + (g << 8) + ((hb < 255) ? hb : b));
    }

    function normalizeColor(clr) {
        const r = parseInt('0x' + clr.substr(1, 2), 16),
                g = parseInt('0x' + clr.substr(3, 2), 16),
                b = parseInt('0x' + clr.substr(5, 2), 16);

        return [ r/255, g/255, b/255 ];
    }

    let controlInit;

    // initial view
    let location = new Float32Array([ 0, 5, 10 ]);
    let target = new Float32Array([0, 1, 0]);

    const captureViewDirection = (loc, tgt) => {
        // console.log("location: ", loc, "\n", "target: ", tgt);
        return "";
    };

    const checkCursorIntersection = (cursorExtent, quadExtent) => {
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

    let process_extra_shader_components = (gl, material, model) => {
        // console.log("Process Extra Shader Components");
        const program = material.program;

        if ((material.vertName == "texture-vertex-shader" && material.fragName == "texture-fragment-shader") ||
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

            if (material.fragName === "normal-selected-txt-fragment-shader" && material.vertName === "normal-selected-txt-vertex-shader") {
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
            }

        } else if (material.fragName === "terrain-frag" && material.vertName === "terrain-vert") {
            // console.log(material.vertName);

            const heigthAdjMultLocation = gl.getUniformLocation(program, "height_adjustment");
            gl.uniform1f(heigthAdjMultLocation, (use_heightmap) ? 0.5 : 0.000125); // if using GL.terrain() (which is flat) use larger adjustment => 0.125

            // uniform vec3 light_direction; // normalized direction in eye
            const lightDirectionLocation = gl.getUniformLocation(program, "light_direction");
            gl.uniform3fv(lightDirectionLocation, new Float32Array([light.x,light.y,light.z]));
            // uniform vec3 light_ambient_color;
            const ambientLightLocation = gl.getUniformLocation(program, "light_ambient_color");
            gl.uniform3fv(ambientLightLocation, new Float32Array([...normalizeColor(light.color)]));
            // uniform vec3 light_diffuse_color;
            const diffuseLightLocation = gl.getUniformLocation(program, "light_diffuse_color");
            gl.uniform3fv(diffuseLightLocation, new Float32Array([...normalizeColor(light.color)]));
            // uniform vec3 light_specular_color;
            const specularLightLocation = gl.getUniformLocation(program, "light_specular_color");
            gl.uniform3fv(specularLightLocation, new Float32Array([...normalizeColor(light.color)]));

            // uniform float material_specular_exponent;
            const specularExpLocation = gl.getUniformLocation(program, "material_specular_exponent");
            gl.uniform1f(specularExpLocation, 0.99);

            if (!!terrainTexture) {
                const fragmentTextureLocation = gl.getUniformLocation(program, "colormap");

                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, terrainTexture);
                gl.uniform1i(fragmentTextureLocation, 0);
            }

        }
    };

    let refreshState = () => {

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

        ranges.labels.unshift("time-event");
        ranges.min.unshift(timeExtent[0]);
        ranges.max.unshift(timeExtent[1]);
        ranges.step.unshift(60000);

        // console.log(foundGroups);

        // now map eventState to a flat list for rendering
        eventList = mapStateToList(eventState, depth * depth);

        if (!!eventsLoaded[0] !== true) return;
    }

    let updateWorld = (event) => {
        // console.log(event);

        refreshState()
    };

    onMount(() => {
        if (typeof controlInit === 'function') {
            controlInit();
        }

        // Get A 2D context for dynamic textures
        /** @type {Canvas2DRenderingContext} */
        const ctx = document.createElement("canvas").getContext("2d");
        ctx.canvas.width = 256;
        ctx.canvas.height = 256;

        const data = JSON.parse(document.getElementById('data_in_html').children[0].innerHTML);

        let frame;

        for (let z=0; z < data.length; z++) {
            const xx = [];
            for (let x=0; x < data[z].length; x++) {
                xx.push(data[z][x])
            }
            heightmap[z] = xx;
        }

        if (!!markerTexture === false) {
            // Create a texture and create initial bind
            markerTexture = webgl.createTexture();
            webgl.bindTexture(webgl.TEXTURE_2D, markerTexture);
            webgl.bindTexture(webgl.TEXTURE_2D, null);
        }

        for (let t = 0; t < 6; ++t) {
            if (!!quad_textures[t] === false) {
                // Create a texture and create initial bind
                quad_textures[t] = webgl.createTexture();
                webgl.bindTexture(webgl.TEXTURE_2D, quad_textures[t]);
                webgl.bindTexture(webgl.TEXTURE_2D, null);
            }
        }

        if (!!terrainTexture === false) {
            // Create a texture and create initial bind
            terrainTexture = webgl.createTexture();
            webgl.bindTexture(webgl.TEXTURE_2D, terrainTexture);
            webgl.bindTexture(webgl.TEXTURE_2D, null);
        }

        // Texture constants
        const level = 0;
        const internalFormat = webgl.RGBA;
        const format = webgl.RGBA;
        const type = webgl.UNSIGNED_BYTE;

        const heightmap_src = document.getElementById("heightmap").src

        if (heightmap_src.match(/height/) !== null) use_heightmap = true;

        normalmap = new GL.Texture(document.getElementById("heightmap").src, { width: 512, height: 512 });

        terrainMap.addEventListener('load', function () {
            // Now that the image has loaded make copy it to the texture.
            console.log("Bind to texture");

            webgl.bindTexture(webgl.TEXTURE_2D, terrainTexture);
            webgl.texImage2D(webgl.TEXTURE_2D, level, internalFormat, format, type, terrainMap);
            webgl.generateMipmap(webgl.TEXTURE_2D);
            webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_MAG_FILTER, webgl.NEAREST_MIPMAP_LINEAR);
            webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_MIN_FILTER, webgl.NEAREST_MIPMAP_LINEAR);

            // Pass this colormap texture to the terrain object, just
            // to get @svelte/gl to bind the texture coordinates in the
            // mesh to the 'uv' uniform in the vertex/fragment shaders.
            // The actual map (and texture filter) that is applied to
            // fragColor comes from the terrainMap initialized above
            colormap = new GL.Texture(terrainMap.src, { width: 512, height: 512 });
        });

        terrainMap.src = document.getElementById("shademap").src; //"images/colormap.jpg";

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
            // {target: webgl.TEXTURE_CUBE_MAP_POSITIVE_X, faceColor: '#F00', textColor: '#0FF', text: '+X'},
            // {target: webgl.TEXTURE_CUBE_MAP_NEGATIVE_X, faceColor: '#FF0', textColor: '#00F', text: '-X'},
            // {target: webgl.TEXTURE_CUBE_MAP_POSITIVE_Y, faceColor: '#0F0', textColor: '#F0F', text: '+Y'},
            // {target: webgl.TEXTURE_CUBE_MAP_NEGATIVE_Y, faceColor: '#0FF', textColor: '#F00', text: '-Y'},
            // {target: webgl.TEXTURE_CUBE_MAP_POSITIVE_Z, faceColor: '#00F', textColor: '#FF0', text: '+Z'},
            // {target: webgl.TEXTURE_CUBE_MAP_NEGATIVE_Z, faceColor: '#F0F', textColor: '#0F0', text: '-Z'}
            {target: webgl.TEXTURE_2D, faceColor: '#F00', textColor: '#0FF', text: '+X'},
            {target: webgl.TEXTURE_2D, faceColor: '#FF0', textColor: '#00F', text: '-X'},
            {target: webgl.TEXTURE_2D, faceColor: '#0F0', textColor: '#F0F', text: '+Y'},
            {target: webgl.TEXTURE_2D, faceColor: '#0FF', textColor: '#F00', text: '-Y'},
            {target: webgl.TEXTURE_2D, faceColor: '#00F', textColor: '#FF0', text: '+Z'},
            {target: webgl.TEXTURE_2D, faceColor: '#F0F', textColor: '#0F0', text: '-Z'}
        ];

        faceInfos.forEach((faceInfo, i, a) => {
            const {target, faceColor, textColor, text} = faceInfo;
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
                // webgl.bindTexture(webgl.TEXTURE_CUBE_MAP, texture);
                // webgl.pixelStorei(webgl.UNPACK_FLIP_Y_WEBGL, true);
                webgl.texImage2D(target, level, internalFormat, format, type, img);
                webgl.generateMipmap(webgl.TEXTURE_2D);
                // if (i >= 5) webgl.generateMipmap(webgl.TEXTURE_CUBE_MAP);
                webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_MAG_FILTER, webgl.NEAREST_MIPMAP_LINEAR); // webgl.LINEAR_MIPMAP_LINEAR);
                webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_MIN_FILTER, webgl.NEAREST_MIPMAP_LINEAR); // webgl.LINEAR_MIPMAP_LINEAR);
                // webgl.texParameteri(webgl.TEXTURE_CUBE_MAP, webgl.TEXTURE_MIN_FILTER, webgl.NEAREST_MIPMAP_LINEAR); // webgl.LINEAR_MIPMAP_LINEAR);
                // document.body.appendChild(img);
            });

            ctx.canvas.toBlob((blob) => {
                img.src = URL.createObjectURL(blob);
            });

            // Setup each face so it's immediately renderable
            if (!!quad_textures[i]) webgl.texImage2D(target, level, internalFormat, width, height, 0, format, type, null);
        });

        light.z = 0.1 * Math.cos(Date.now() * 0.0002);

        const loop = () => {
            frame = requestAnimationFrame(loop);
            light.x = 1.5 * Math.sin(Date.now() * 0.0001);
            light.y = 25 * h * Math.sin(Math.pow((h - light.x)/2, 2));

            if (ranges['values'].length > 0) {
                a = ranges['values'][0];
                h = ranges['values'][1];
                rot = ranges['values'][2];
                light.y = light.y + ranges['values'][3];
            } else {
                ranges['values'] = [ a, h, rot, 100 ];
            }
        };

        loop();

        // Use a Web Worker to load position events...
        // as if they are coming in from async remote service
        if (window.Worker) {

            window.eventQuad = eventQuad; // debug

            const eventProcessor = new Worker('worker.js');

            eventProcessor.postMessage({
                "action": "Load event data",
                "payload": {
                    "event-source": "post/data/position_events.json",
                    "heightmap-source": "post/data/planar-terrain-heights.json",
                    "planar-extent": eventQuad.extent
                }
            });

            console.log('Processing event and height data...');

            console.log("Quads initialized: ", quadList);

            const delay = {
                time: 1
            };

            const depth = 6;

            const heightAdjustment = 0.75;

            const heightOffset = 0.5;

            const planarExtent = eventQuad.extent;

            const planarWidth = (planarExtent[1][0] - planarExtent[0][0]) / 2,
                planarDepth = (planarExtent[1][1] - planarExtent[0][1]) / 2;

            const terrainDepth = (Array.isArray(heightmap) && heightmap.length > 0) ?
                heightmap.length : 0;
            const terrainWidth = (terrainDepth > 0 && heightmap[0].length > 0) ?
                heightmap[0].length : 0;

            console.log(heightmap);
            console.log("terrainDepth: ", terrainDepth);
            console.log("terrainWidth: ", terrainWidth);

            eventProcessor.onmessage = function(event) {
                eventsLoading[0] = true;

                delay.time += 66;

                // if (typeof event.data === 'object' && "x" in event.data && "y" in event.data) {
                //     eventQuad.push(Object.assign({}, event.data));
                //     eventTotal++;
                //
                // } else {
                //     // last message indicates event loading is done... for now
                if (typeof event.data === 'object') {
                    // console.log(event.data);

                    if ("x" in d && "y" in d) { // try {
                        // Explore sign reversal
                        // const x = d["x"], y = d["y"];
                        // d["y"] = -x;
                        // d["x"] = y;
                        // const px= d["x"] + planarWidth / 2;     // shift all planar numbers to positive domain
                        // const py = d["y"] + planarDepth / 2;    // shift all planar numbers to positive domain
                        // const tx = Math.floor(terrainWidth * px / planarWidth);
                        // const ty = Math.floor(terrainDepth * py / planarDepth);
                        // const height = heightOffset + heightAdjustment * heightmap[tx][ty]; // assign height at this index

                    // } catch (load_error) {
                    //     problem_events.push(Object.assign({ load_error }, d));
                    }

                    eventQuad.push(Object.assign({ height: 1.0 }, event.data));
                    eventTotal++;

                    setTimeout(() => {
                        if (!!eventsLoading[0] && !eventsLoaded[0]) {
                            eventsLoading[0] = false;

                            console.log(new Date(), "REFRESH EVENT STATE");

                            console.log("Total events loaded: ", eventTotal);

                            mapQuadState(quadState, eventQuad.get(), 0, depth);

                            // now map quadState to a flat list for rendering
                            quadList = mapStateToList(quadState, depth);

                            console.log("QuadList has ", quadList.length);

                            refreshState();

                            eventsLoaded[0] = true;

                        } else {
                            eventsLoaded[0] = false;
                        }
                    }, delay.time);

                }
            };

        } else {
            console.log('Your browser doesn\'t support web workers.');
            window.alert('Your browser doesn\'t support web workers, so no event data can be loaded.');
        }

        return () => cancelAnimationFrame(frame);
    });
</script>

<GL.Scene bind:gl={webgl} backgroundOpacity=1.0 process_extra_shader_components={process_extra_shader_components}>
    <GL.Target id="center" location={[0, 0.5, 0]}/>

    <GL.OrbitControls maxPolarAngle={Math.PI / 2} {location} {target}>
        {captureViewDirection(location, target)}
        <GL.PerspectiveCamera {location} lookAt="center" near={0.01} far={1000}/>
    </GL.OrbitControls>

    <GL.AmbientLight intensity={0.5}/>
    <GL.DirectionalLight direction={[ -1,-1,-1 ]} intensity={0.5}/>

    {#if options['values'][0]}
        <!-- cursor -->
        <GL.Mesh
                geometry={GL.box(cursorDimensions)}
                location={[0, -worldPosition.y + markerHeight, 0]}
                rotation={[-90, 0, 0]}
                scale={[0.99/worldPosition.r, 0.99/worldPosition.r, 0.05]}
                vert={quadVert}
                frag={quadFrag}
                uniforms={{ color: adjustColor(color), alpha: 1.0 }}
                transparent
        />
    {/if}

    <!-- world -->
    <GL.Group location={[-worldPosition.x, -worldPosition.y, -worldPosition.z]}>

        <!-- ground -->
        <GL.Mesh
                geometry={((use_heightmap) ? GL.terrain() : terrain())}
                location={[ 0, -h/8, 0 ]}
                rotation={[ -rot, 0, 0 ]}
                scale={[ initQuadWidth, initQuadWidth, 31 * h / 8 ]}
                frag={terrainFrag}
                vert={terrainVert}
                uniforms={{ alpha: 1.0, color: adjustColor(color, h), colormap: colormap, normalmap: normalmap }}
        />

        <!-- water -->
        <GL.Mesh
                geometry={GL.plane()}
                location={[0, -h * 96/1024, 0]}
                rotation={[ -90, 0, 0 ]}
                scale={initQuadWidth}
                uniforms={{ color: 0x0066ff, alpha: 0.45 }}
                transparent
        />

        <!-- check heightmap -->
        {#if (a > 0.01)}
            {#each Array(heightmap.length) as _, k}
                {#each Array(heightmap[k].length) as _, i}
                    <!-- box -->
                    <GL.Mesh geometry={GL.box({ x: 0, y: 0, z: 0 , w: (gridSizeX / heightmap[i].length), h: (1 * heightmap[k][i]), d: (gridSizeZ / heightmap.length) })}
                             location={[ (-(gridSizeX / 2) + (i * (gridSizeX / heightmap[0].length))), 0, (-(gridSizeZ / 2) + (k * (gridSizeZ / heightmap.length))) ]}
                             rotation={[ 0, 0, 0]}
                             scale={[ w, 3 * h / 8, d]}
                             uniforms={{ color: adjustColor(color, heightmap[k][i]), alpha: a }}
                    />
                {/each}
            {/each}
        {/if}

        <!-- moving light -->
        <GL.Group location={[ light.x, light.y, light.z ]}>
            <GL.PointLight
                    location={[ 0, 0, 0 ]}
                    color={adjustColor(color, 1.0)}
                    intensity={0.6}
            />
        </GL.Group>

    </GL.Group>
</GL.Scene>

<NavigationControls
        bind:init={controlInit}
        bind:color={color}
        bind:options={options}
        bind:rangeOptions={ranges}
        bind:rangeValues={ranges.values}
        bind:timeExtent={timeExtent}
        bind:viewLocation={location}
        bind:viewTarget={target}
        bind:worldPosition={worldPosition}
        extent={eventQuad.extent}
        on:move={(event) => updateWorld(event)}/>
