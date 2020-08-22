<script>
    import { onMount } from 'svelte';
    import * as GL from '@sveltejs/gl';
    // import Controls from './components/Controls.svelte';
    import Controls from './components/NavigationControls.svelte';
    import QuadStore from "./modules/quad-store";
    import terrain from './modules/terrain-small';
    // import terrainFrag from './shaders/default/frag.glsl';
    // import terrainVert from './shaders/default/vert.glsl';
    import terrainFrag from './shaders/custom/terrain-frag.glsl';
    import terrainVert from './shaders/custom/terrain-and-light-vert.glsl';

    export let title;

    export let color = '#F7C77B';

    let eventTotal = 0;

    const eventQuad = new QuadStore(
        6,
        [[ -16.0, -16.0 ],[ 16.0, 16.0 ]]
    );

    const eventsLoading = [false];

    const eventsLoaded = [false];

    const initQuadWidth = (eventQuad.extent[1][0] - eventQuad.extent[0][0]) / 2,
        initQuadDepth = (eventQuad.extent[1][1] - eventQuad.extent[0][1]) / 2;

    const heightmap = [];
    const gridSizeX = initQuadWidth;
    const gridSizeZ = initQuadDepth;

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

    let showGroups = [ foundGroups[1], foundGroups[2], foundGroups[3], foundGroups[4], foundGroups[5], foundGroups[6] ];
    let showCursor = false;
    let showQuads = false;
    let showByTime = false;
    let playTimeLoop = false;
    // let options = {
    //     'labels': ["Show Terrain Cursor", "Show Quad Extents", "Filter Events By Time", " Play Time Loop"],
    //     'values': [showCursor, showQuads, showByTime, playTimeLoop]
    // };

    export let options = {
        labels: [],
        values: []
    };

    export let ranges = {
        labels: [ "block-height-alpha", "terrain-height", "terrain-rotation", "light-distance" ],
        min: [ 0.0, 1.0, 0.0, 1.0 ],
        max: [ 1.0, 2.0, 180.0, 100.0 ],
        step: [ 0.05, 0.25, 10.0, 10.0 ],
        values: []
    };

    // initial view
    let location = new Float32Array([ 0, 50, 10 ]);
    let target = new Float32Array([0, 1, 0]);

    const captureViewDirection = (loc, tgt) => {
        // console.log("location: ", loc, "\n", "target: ", tgt);
        return "";
    };

    let use_heightmap = false;

    let a = 0.0;
    let w = 1;
    let h = 1;
    let d = 1;
    let rot = 90;

    const light = {
        color: "#FFFFFF"
    };

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
    let webgl;
    let normalmap;
    let process_extra_shader_components = (gl, material, model) => {
        // console.log("Process Extra Shader Components");
        const program = material.program;

        if (material.vertName === "terrain-vert") {
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

        }
    };

    let updateWorld = (event) => {
        console.log(event);
    };

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

        console.log("Quads initialized: ", quadList);
    }

    onMount(() => {
        if (typeof controlInit === 'function') {
            controlInit();
        }

        const data = JSON.parse(document.getElementById('data_in_html').children[0].innerHTML);

        let frame;

        for (let z=0; z < data.length; z++) {
            const xx = [];
            for (let x=0; x < data[z].length; x++) {
                xx.push(data[z][x])
            }
            heightmap[z] = xx;
        }

        console.log(heightmap);

        const map_src = document.getElementById("heightmap").src

        if (map_src.match(/height/) !== null) use_heightmap = true;

        normalmap = new GL.Texture(document.getElementById("heightmap").src, { width: 512, height: 512 });

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

        return () => cancelAnimationFrame(frame);
    });
</script>

<style>
    .controls {
        width: 256px;
    }
</style>

<GL.Scene bind:gl={webgl} backgroundOpacity=1.0 process_extra_shader_components={process_extra_shader_components}>
    <GL.Target id="center" location={[0, 0.5, 0]}/>

    <GL.OrbitControls maxPolarAngle={Math.PI / 2} let:location={location}>
        <GL.PerspectiveCamera {location} lookAt="center" near={0.01} far={1000}/>
    </GL.OrbitControls>

    <GL.AmbientLight intensity={0.5}/>
    <GL.DirectionalLight direction={[ -1,-1,-1 ]} intensity={0.5}/>

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

    <!-- ground -->
    <GL.Mesh
            geometry={((use_heightmap) ? GL.terrain() : terrain())}
            location={[ 0, -h/8, 0 ]}
            rotation={[ -rot, 0, 0 ]}
            scale={[ 8, 8, 31 * h / 8 ]}
            frag={terrainFrag}
            vert={terrainVert}
            uniforms={{ color: adjustColor(color, h), alpha: 1.0, normalmap: normalmap }}
    />

    <!-- water -->
    <GL.Mesh
            geometry={GL.plane()}
            location={[0, -h * 127/1024, 0]}
            rotation={[ -90, 0, 0 ]}
            scale={[ 8, 8, 8 ]}
            uniforms={{ color: 0x0066ff, alpha: 0.45 }}
            transparent
    />

    <!-- moving light -->
    <GL.Group location={[ light.x, light.y, light.z ]}>
        <GL.PointLight
                location={[ 0, 0, 0 ]}
                color={adjustColor(color, 1.0)}
                intensity={0.6}
        />
    </GL.Group>
</GL.Scene>

<Controls
        bind:init={controlInit}
        bind:color={color}
        bind:options={options}
        bind:rangeOptions={ranges}
        bind:rangeValues={ranges.values}
        bind:viewLocation={location}
        bind:viewTarget={target}
        title={title}
        on:move={(event) => updateWorld(event)}/>

<!--<div class="controls right">-->
<!--    <label>-->
<!--        <input type="color" style="height: 64px" bind:value={color}>-->
<!--    </label>-->

<!--    <label>-->
<!--        <input type="range" bind:value={h} min={0.75} max={2} step={0.05}><br />-->
<!--        size ({h})-->
<!--    </label>-->

<!--    <label>-->
<!--        <input type="range" bind:value={rot} min={0} max={180} step={15.0}><br />-->
<!--        rotation ({rot})-->
<!--    </label>-->
<!--</div>-->
