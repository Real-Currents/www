<script>
    import { onMount } from 'svelte';
    import * as GL from '@sveltejs/gl';
    import terrain from './modules/terrain-small';
    // import terrainFrag from './shaders/default/frag.glsl';
    // import terrainVert from './shaders/default/vert.glsl';
    import terrainFrag from './shaders/custom/terrain-frag.glsl';
    import terrainVert from './shaders/custom/terrain-and-light-vert.glsl';

    export let title;

    export let color = '#F7C77B';

    let use_heightmap = false;

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

    let webgl;
    let normalmap;
    let process_extra_shader_components = (gl, material, model) => {
        console.log("Process Extra Shader Components");
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

    onMount(() => {
        let frame;

        const map_src = document.getElementById("heightmap").src

        if (map_src.match(/height/) !== null) use_heightmap = true;

        normalmap = new GL.Texture(document.getElementById("heightmap").src, { width: 512, height: 512 });

        light.z = 0.1 * Math.cos(Date.now() * 0.0002);

        const loop = () => {
            frame = requestAnimationFrame(loop);
            light.x = 1.5 * Math.sin(Date.now() * 0.0001);
            light.y = h + h/2 * Math.sin(Math.pow((h - light.x)/2, 2));
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
    <GL.Target id="center" location={[0, h/2 - h, 0]}/>

    <GL.OrbitControls maxPolarAngle={Math.PI / 2} let:location>
        <GL.PerspectiveCamera {location} lookAt="center" near={0.01} far={1000}/>
    </GL.OrbitControls>

    <GL.AmbientLight intensity={0.3}/>
    <GL.DirectionalLight direction={[-1,-1,-1]} intensity={0.5}/>

    <!-- ground -->
    <GL.Mesh
            geometry={((use_heightmap) ? GL.terrain() : terrain())}
            location={[0, -h/2, 0]}
            rotation={[-rot, 0, 0]}
            scale={h}
            frag={terrainFrag}
            vert={terrainVert}
            uniforms={{ color: adjustColor(color, h), alpha: 1.0, normalmap: normalmap }}
    />

    <!-- water -->
    <GL.Mesh
            geometry={GL.plane()}
            location={[0, -h * 63/128, 0]}
            rotation={[-90, 0, 0]}
            scale={h}
            uniforms={{ color: 0x0066ff, alpha: 0.45 }}
            transparent
    />

    <!-- moving light -->
    <GL.Group location={[light.x,light.y,light.z]}>
        <GL.PointLight
                location={[0,0,0]}
                color={adjustColor(color, 1.0)}
                intensity={0.6}
        />
    </GL.Group>
</GL.Scene>

<div class="controls right">
    <label>
        <input type="color" style="height: 64px" bind:value={color}>
    </label>

    <label>
        <input type="range" bind:value={h} min={0.75} max={2} step={0.05}><br />
        size ({h})
    </label>

    <label>
        <input type="range" bind:value={rot} min={0} max={180} step={15.0}><br />
        rotation ({rot})
    </label>
</div>
