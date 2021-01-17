<script>
    import {  createEventDispatcher } from 'svelte';

    export let title;

    export let color = '#F7C77B';

    export let extent = [[-1.0, -1.0], [1.0, 1.0]];

    export let groups = {};

    export let options = [];

    export let rangeOptions = [];
    export let rangeValues = [];

    export let timeExtent = [];

    export let viewLocation, viewTarget;
    export let worldPosition = {
        x: 0.0,
        y: 0.0,
        z: 0.0,
        r: 1.0
    };

    let dispatch = createEventDispatcher();

    let formatPlayTime = (time) => "" + (new Date(time).toString());

    let mouse_x = 0, mouse_y = 0, mouse_down = false, mouse_disabled = false;

    let navContext;

    let positive_forward_vector_x = 0;
    let positive_forward_vector_z = 0;

    const navWidth = 200, navHeight = 200;

    let map = new Image();
    map.src = "images/map.png";
    map.style.width = navWidth + "px";
    map.style.height = navWidth + "px";

    let terrainWidth = extent[1][0] - extent[0][0],
        terrainDepth = extent[1][1] - extent [0][1];

    let isFullscreen = false;

    let sinceLastMovementEvent = 0;

    let toggleFullscreen = function () {};

    let renderTerrainNavigationCursor = function (ctx) {
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        const focusSize = width / (4 * worldPosition.r); // 256

        ctx.clearRect(0, 0, width, height);

        ctx.strokeRect(
            (width / 2 - focusSize / 2) + (width * worldPosition.x / terrainWidth),
            (height / 2 - focusSize / 2) + (height * worldPosition.z / terrainDepth),
            focusSize,
            focusSize)
    };

    let triggerMovement = function (direction) {
        // Get radius of viewing angle
        const distance = 0.5 / worldPosition.r;
        const vx = viewLocation[0] - viewTarget[0];
        const vz = viewLocation[2] - viewTarget[2];
        const r = Math.sqrt(Math.pow(vx, 2) + Math.pow(vz, 2));

        // console.log(vx, vz, r, distance);

        positive_forward_vector_x = (vx * (r - distance) / (r)) - vx;
        positive_forward_vector_z = (vz * (r - distance) / (r)) - vz;

        // console.log(positive_forward_vector_x, positive_forward_vector_z);

        // Adjust worldPosition coords
        switch (direction) {
            case "forward":
                worldPosition.x += positive_forward_vector_x;
                worldPosition.z += positive_forward_vector_z;
                break;
            case "backward":
                worldPosition.x -= positive_forward_vector_x;
                worldPosition.z -= positive_forward_vector_z;
                break;
            // // Need better math for lateral movement...
            // case "left":
            //     if (Math.abs(vx) > Math.abs(vz)) {
            //         worldPosition.x -= positive_forward_vector_z;
            //         worldPosition.z -= positive_forward_vector_x;
            //     } else {
            //         worldPosition.x += positive_forward_vector_z;
            //         worldPosition.z += positive_forward_vector_x;
            //     }
            //     break;
            // case "right":
            //     if (Math.abs(vx) > Math.abs(vz)) {
            //         worldPosition.x += positive_forward_vector_z;
            //         worldPosition.z += positive_forward_vector_x;
            //     } else {
            //         worldPosition.x -= positive_forward_vector_z;
            //         worldPosition.z -= positive_forward_vector_x;
            //     }
            //     break;
        }

        if (worldPosition.x < -terrainWidth * 0.45) worldPosition.x = -terrainWidth * 0.45;
        if (terrainWidth * 0.45 < worldPosition.x) worldPosition.x = terrainWidth * 0.45;
        if (worldPosition.z < -terrainDepth * 0.45) worldPosition.z = -terrainDepth * 0.45;
        if (terrainDepth * 0.45 < worldPosition.z) worldPosition.z = terrainDepth * 0.45;

        // Pass event to SvelteGL App for view update
        dispatch("move");

        if (!!navContext === true) {
            renderTerrainNavigationCursor(navContext)
        }
    }

    let tryDateTime = function (value) {
        let toDate = value;try {
            if (parseInt(value) > 1577810000000)
                toDate = new Date(value).toString().match(/(.+) GMT/)[1];
        } finally {
            return toDate;
        }
    }

    let zoom = function (y) {
        worldPosition.y = y;
        worldPosition.r = Math.pow(2, (-y / 4));

        // Pass event to SvelteGL App for view update
        dispatch("move");

        if (!!navContext === true) {
            renderTerrainNavigationCursor(navContext)
        }
    }

    let zoomY = 0;

    $: zoom(-zoomY);

    let terrainNavigationCursor = function (cursorCanvas, glCanvas) {
        const ctx = cursorCanvas.getContext('2d');
        cursorCanvas.width = 1024;
        cursorCanvas.height = 1024;
        cursorCanvas.style.width = navWidth + "px";
        cursorCanvas.style.height = navWidth + "px";

        ctx.lineWidth = 8;
        ctx.strokeStyle = '#ff3e00';

        renderTerrainNavigationCursor(ctx);

        let mouse_x = 0, mouse_y = 0, mouse_down = false, mouse_disabled = false;

        const touchHit = function touchHit(event) {
            // console.log(event.touches);
            mouseHit(event.touches[0]);
        };

        const mouseHit = function mouseHit(event) {
            const scale_correct = 2.0;
            const current_x = event.clientX - (cursorCanvas.offsetParent.offsetLeft + cursorCanvas.offsetLeft);  // / parseInt(canvas.style.width.substring(-2,3))
            const current_y = event.clientY - (cursorCanvas.offsetParent.offsetTop + cursorCanvas.offsetTop); // / parseInt(canvas.style.height.substring(-2,3))
            if (!mouse_disabled) {
                const delta_x = (mouse_down) ? current_x - mouse_x : 0.0;
                const delta_y = (mouse_down) ? current_y - mouse_y : 0.0;
                // if (mouse_down) {
                //     console.log('mouse movement (', delta_x, ',', delta_y, ')');
                // }
                mouse_x = current_x;
                mouse_y = current_y;
                if (mouse_down) {
                    worldPosition.x += scale_correct * (terrainWidth / 2 * delta_x / parseInt(cursorCanvas.style.width.substring(-2,3)));
                    worldPosition.z += scale_correct * (terrainDepth / 2 * delta_y / parseInt(cursorCanvas.style.height.substring(-2,3)));

                    // Pass event to SvelteGL App for view update
                    dispatch("move");

                    renderTerrainNavigationCursor(ctx);
                }
            }
        };

        if ('ontouchmove' in document.createElement('div'))  {
            cursorCanvas.addEventListener('touchstart', function(e){
                if (!mouse_disabled) {
                    // console.log('MouseDown');
                    touchHit(e);
                    mouse_down = true;
                }
                e.preventDefault();
            });
            cursorCanvas.addEventListener('touchmove', function(e){
                if (!mouse_disabled && mouse_down) {
                    touchHit(e);
                }
                e.preventDefault();
            });
            cursorCanvas.addEventListener('touchend', function(e){
                if (!mouse_disabled) {
                    // console.log('MouseUp');
                    mouse_down = false;
                }
                e.preventDefault();
            });
            console.log('touch is present');

        } else {
            cursorCanvas.addEventListener('mousedown', function(e) {
                if (!mouse_disabled) {
                    // console.log('MouseDown');
                    mouseHit(e);
                    mouse_down = true;
                }
                e.preventDefault();
            });
            cursorCanvas.addEventListener('mousemove', mouseHit);
            cursorCanvas.addEventListener('mouseup', function (e) {
                if (!mouse_disabled) {
                    // console.log('MouseUp');
                    mouse_down = false;
                }
                e.preventDefault();
            });
        }

        let sinceLastMovementEvent = 0;

        glCanvas.addEventListener('wheel', function (event) {
            const wheelEvent = (event || window['event']);

            if (((new Date()).getTime() - sinceLastMovementEvent) > 66) {

                sinceLastMovementEvent = (new Date()).getTime();

                if (wheelEvent.deltaY < 0) {
                    triggerMovement('forward');
                } else if (wheelEvent.deltaY > 0) {
                    triggerMovement('backward');
                }
            }

            wheelEvent.preventDefault();
        });

        document.addEventListener('keydown', function (event) {
            const kbEvent = (event || window['event']); // cross-browser shenanigans

                console.log(kbEvent);

                if (kbEvent['keyCode'] === 32) { // spacebar

                    kbEvent.preventDefault();

                } else if (kbEvent['keyCode'] === 38 || kbEvent['keyCode'] === 87) { // up || W

                    if (((new Date()).getTime() - sinceLastMovementEvent) > 66) {
                        sinceLastMovementEvent = (new Date()).getTime();
                        triggerMovement('forward');
                    }

                    kbEvent.preventDefault();

                } else if (kbEvent['keyCode'] === 40 || kbEvent['keyCode'] === 83) { // down || S

                    if (((new Date()).getTime() - sinceLastMovementEvent) > 66) {
                        sinceLastMovementEvent = (new Date()).getTime();
                        triggerMovement('backward');
                    }

                    kbEvent.preventDefault();

                    return true;

                } else if (kbEvent['keyCode'] === 37 || kbEvent['keyCode'] === 65) { // left || A

                    if (((new Date()).getTime() - sinceLastMovementEvent) > 66) {
                        sinceLastMovementEvent = (new Date()).getTime();
                        triggerMovement('left');
                    }

                    kbEvent.preventDefault();

                } else if (kbEvent['keyCode'] === 39 || kbEvent['keyCode'] === 68) { // right || D

                    if (((new Date()).getTime() - sinceLastMovementEvent) > 66) {
                        sinceLastMovementEvent = (new Date()).getTime();
                        triggerMovement('right');
                    }

                    kbEvent.preventDefault();

                } else if (kbEvent['keyCode'] === 27) { // ESC

                    kbEvent['minimize'] = true;

                    toggleFullscreen(kbEvent); // minimize

                    kbEvent.preventDefault();

                } else {
                    console.log('Keyboard Event: ', kbEvent['keyCode']);
                }

                return true;
        });

        document.getElementById("magnification").addEventListener('keydown', function (event) {
            const kbEvent = (event || window['event']); // cross-browser shenanigans

            kbEvent.preventDefault();

            return true;
        });

        return ctx;
    }

    export const init = function () {
        console.log("Initializing Terrain Navigation Controls...");

        document.querySelectorAll('main div[role="main"] .container canvas').forEach(c => {
            console.log(c);

            if (!!navContext !== true) {
                const mapCursor = document.getElementById("terrain-navigation-cursor");
                navContext = terrainNavigationCursor(mapCursor, c);

                let intro;
                let sinceLastMoveBack = (new Date()).getTime();

                const loop = () => {

                    if (zoomY > -2.5) {
                        zoomY -= 0.125;
                        zoom(-(zoomY.toFixed(2)));
                        if (((new Date()).getTime() - sinceLastMoveBack) > 45) {
                            sinceLastMoveBack = (new Date()).getTime();
                            triggerMovement('backward');
                        }
                        intro = requestAnimationFrame(loop);
                    } else {
                        zoomY = -2.5;
                        zoom(-zoomY);
                    }
                };

                setTimeout(loop, 533);
            }

            toggleFullscreen = (event) => {
                console.log(event['minimize']);

                if (!!event['minimize'] | !!isFullscreen) {
                    isFullscreen = false;
                    c.parentElement.className = c.parentElement.className.replace("fullscreen", '');
                    for (const control of document.getElementsByClassName("controls")) {
                        control.className = control.className.replace("fullscreen", '');
                    }

                } else {
                    isFullscreen = true;
                    c.parentElement.className += " fullscreen"
                    for (const control of document.getElementsByClassName("controls")) {
                        control.className += " fullscreen";
                    }
                }
            }
        });
    };
</script>

<style>

    .controls h4 {
        color: black;
        cursor: pointer;
        pointer-events: all;
    }

    .controls label input[type="color"] {
        margin: 2px 100px 10px;
    }

    .controls label input[type="checkbox"] {
        float: left;
        margin-left: 32px;
        margin-right: -48px;
    }

    .controls label input[type="color"] {
        clear: both;
    }

    .controls #terrain-navigation-view img {
        float: none;
        margin: 2px;
        width: 200px;
        height: 200px;
    }

    .controls #terrain-navigation-view {
        padding: 2px;
    }

    .controls #terrain-navigation-cursor {
        position: absolute;
        top: 0px;
        left: 0px;
        margin-top: 16px;
        margin-left: 64px;
        min-width: 20px;
        min-height: 20px;
        border: 2px solid;
    }

    @media screen and (max-width: 480px) {
        .controls {
            margin-top: 8px;
        }
    }

</style>

<div class="controls right" style="top: -5em;">
    <!--{#if (!!color)}-->
    <!--    <label>-->
    <!--        <input type="color" style="height: 40px" bind:value={color}>-->
    <!--    </label>-->
    <!--{/if}-->

    <div id="terrain-navigation-view">
        <img alt="Navigation Controls Map"
             src={map.src}
             width={map.style.width}
             height={map.style.height} />
        <canvas id="terrain-navigation-cursor"
                width="{map.width}"
                height="{map.height}"
                style="border-color: {color}"
        ></canvas>
    </div>

    <label>
        <b>-</b><input id="magnification" type="range" bind:value={zoomY} on:input={zoomY} min={-4.0} max={0.5} step={0.1}><b>+</b><br />
        magnification({zoomY})
    </label><br />

    {#if (groups.length > 0)}
        {#each groups as group, i}
            <label>
                <input type="checkbox" bind:checked={group} on:click={() => dispatch("clickCheckbox")} /> Group {i + 1}
            </label><br />
        {/each}
    {/if}

    {#if (options['labels'].length > 0 && options['values'].length > 0)}
        {#each options['values'] as option, o}
            <label>
                <input type="checkbox" bind:checked={option} /> {options['labels'][o]}
            </label><br />
        {/each}
    {/if}

    {#if (rangeOptions['labels'].length > 0 && rangeValues.length > 0)}
        {#each rangeValues as option, o}
            <label>
                <input type="range" bind:value={option} min={rangeOptions['min'][o]} max={rangeOptions['max'][o]} step={rangeOptions['step'][o]} /><br />
                {rangeOptions['labels'][o]}({tryDateTime(option)})
            </label><br />
        {/each}
    {/if}

    <label>
        <button on:click="{toggleFullscreen}">{((isFullscreen) ? 'minimize' : 'maximize')}</button>
    </label>

</div>
