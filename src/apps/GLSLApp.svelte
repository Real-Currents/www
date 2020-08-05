<script>
    import { onMount } from 'svelte';
    import * as GL from '@sveltejs/gl';
    import generateFace from './content/grid-generator';
    import vert from './shaders/custom/normal-selected-txt-vertex-shader.glsl';
    import frag from './shaders/custom/normal-selected-txt-fragment-shader.glsl';

    export let title;

    export let color = '#F7C77B';

    let w = 1;
    let h = 1;
    let d = 1;

    const light = {};

    // initial view
    let location = new Float32Array([ 0.25, 1, 2.5 ]);
    let target = new Float32Array([0, 1, 0]);

    const captureViewDirection = (loc, tgt) => "";

    function adjustColor (clr, height = 1) {
        const r = parseInt('0x' + clr.substr(1, 2), 16),
                g = parseInt('0x' + clr.substr(3, 2), 16),
                b = parseInt('0x' + clr.substr(5, 2), 16);

        const hr = Math.floor(r * (height / 0.25)),
                hb = Math.floor(b * (height / 0.25));
        return Math.abs((((hr < 255) ? hr : r) << 16) + (g << 8) + ((hb < 255) ? hb : b));
    }

    let webgl;
    let textures = [];
    const ctx = document.createElement("canvas").getContext("2d");
    ctx.canvas.width = 256;
    ctx.canvas.height = 256;
    let process_extra_shader_components = (gl, material, model) => {
        // console.log("Process Extra Shader Components");
        const program = material.program;

        if (material.vertName == "normal-selected-txt-vertex-shader" && material.fragName == "normal-selected-txt-fragment-shader") {
            // console.log(material.vertName, material.fragName);

            const uvCoordLocation = gl.getAttribLocation(program, "uv");

            // gl.disable(gl.CULL_FACE); // for double-sided poly

            gl.enableVertexAttribArray(uvCoordLocation);
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
            gl.vertexAttribPointer(uvCoordLocation, 2, gl.FLOAT, false, 0, 0);

            // Un-bind buffers
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

            if ((material.vertName == "normal-selected-txt-vertex-shader" && material.fragName == "normal-selected-txt-fragment-shader")) {
                for (let t = 0; t < 6; ++t) {
                    if (!!textures[t]) {
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
                        gl.bindTexture(gl.TEXTURE_2D, textures[t]);
                        gl.uniform1i(fragmentTextureLocation, t);
                    }
                }
            } else {
                if (!!textures[0]) {
                    const fragmentTextureLocation = gl.getUniformLocation(program, "uTexture0");
                    gl.activeTexture(gl.TEXTURE0);
                    gl.bindTexture(gl.TEXTURE_2D, textures[0]);
                    gl.uniform1i(fragmentTextureLocation, 0);
                }
            }

        } else if (material.vertName == "texture-vertex-shader" && material.fragName == "cubemap-fragment-shader") {
            // console.log(material.vertName, material.fragName);

            const fragmentTextureLocation = gl.getUniformLocation(program, "uTexture");

            if (!!textures[0]) {
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, textures[0]);
                gl.uniform1i(fragmentTextureLocation, 0);
            }
        }

    };

    onMount(() => {
        let frame;

        console.log(webgl);

        for (let t = 0; t < 6; ++t) {
            if (!!textures[t] == false) {
                // Create a texture and create initial bind
                textures[t] = webgl.createTexture();
                webgl.bindTexture(webgl.TEXTURE_2D, textures[t]);
                // webgl.bindTexture(webgl.TEXTURE_CUBE_MAP, texture);
            }
        }

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
            const level = 0;
            const internalFormat = webgl.RGBA;
            const format = webgl.RGBA;
            const type = webgl.UNSIGNED_BYTE;
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
                webgl.bindTexture(webgl.TEXTURE_2D, textures[i]);
                // webgl.bindTexture(webgl.TEXTURE_CUBE_MAP, texture);
                webgl.pixelStorei(webgl.UNPACK_FLIP_Y_WEBGL, true);
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
            if (!!textures[i]) webgl.texImage2D(target, level, internalFormat, width, height, 0, format, type, null);
        });

        const loop = () => {
            frame = requestAnimationFrame(loop);

            light.x = 3 * Math.sin(Date.now() * 0.001);
            light.y = 2.5 + 2 * Math.sin(Date.now() * 0.0004);
            light.z = 3 * Math.cos(Date.now() * 0.002);
        };

        loop();

        return () => cancelAnimationFrame(frame);
    });
</script>

<style>

    @media screen and (max-width: 480px) {
        .controls {
            margin-top: 8px;
        }
    }

    .controls label input[type="color"] {
        clear: both;
        margin: 100px;
        margin-top: 2px;
        margin-bottom: 10px;
    }

    .keys * {
        padding: 24px;
    }
</style>

<GL.Scene bind:gl={webgl} backgroundOpacity=1.0 process_extra_shader_components={process_extra_shader_components}>
    <GL.Target id="center" location={[0, h/2, 0]}/>

    <GL.OrbitControls maxPolarAngle={Math.PI / 2} {location}>
        <GL.PerspectiveCamera bind:location={location} lookAt="center" near={0.01} far={1000}/>
    </GL.OrbitControls>

    <GL.AmbientLight intensity={0.3}/>
    <GL.DirectionalLight direction={[-1,-1,-1]} intensity={0.5}/>

    <!-- box -->
    <GL.Mesh
            geometry={GL.box({})}
            location={[0,h/2,0]}
            rotation={[0,-20,0]}
            scale={[w,h,d]}
            vert={vert}
            frag={frag}
            uniforms={{ color: adjustColor(color), alpha: 1.0 }}
            transparent
    />

    <!-- floor -->
    <GL.Mesh
            geometry={GL.plane()}
            location={[0,-0.01,0]}
            rotation={[-90,0,0]}
            scale={10}
            uniforms={{ color: 0xffffff }}
    />

    <!-- ceiling -->
    <GL.Mesh
            geometry={GL.plane()}
            location={[0,5.0,0]}
            rotation={[90,0,0]}
            scale={10}
            uniforms={{ color: 0xffffff }}
    />

    <!-- wall1 -->
    <GL.Mesh
            geometry={GL.plane()}
            location={[0,-0.01,-10.0]}
            rotation={[0,0,0]}
            scale={10}
            uniforms={{ color: 0xffffff }}
    />

    <!-- wall2 -->
    <GL.Mesh
            geometry={GL.plane()}
            location={[10.0,-0.01,0.0]}
            rotation={[0,-90,0]}
            scale={10}
            uniforms={{ color: 0xffffff }}
    />

    <!-- wall3 -->
    <GL.Mesh
            geometry={GL.plane()}
            location={[-10.0,-0.01,0.0]}
            rotation={[0,90,0]}
            scale={10}
            uniforms={{ color: 0xffffff }}
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
                color={0xff0000}
                intensity={0.6}
        />
    </GL.Group>
</GL.Scene>

<div class="controls">
    <label>
        <input type="range" bind:value={w} min={0.1} max={5} step={0.1} /><br /> width ({w})
    </label>

    <label>
        <input type="range" bind:value={h} min={0.1} max={5} step={0.1} /><br /> height ({h})
    </label>

    <label>
        <input type="range" bind:value={d} min={0.1} max={5} step={0.1} /><br /> depth ({d})
    </label>
</div>
