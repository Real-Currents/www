<script>
    import {  createEventDispatcher } from 'svelte';

    export let title;
    export let color = '#ff3e00';

    let navContext;

    export let booleanOptions = [];
    export let colorOptions = [];
    export let rangeOptions = [];

    export let viewLocation, viewTarget;

    let dispatch = createEventDispatcher();

    let formatPlayTime = (time) => "" + (new Date(time).toString());

    let mouse_x = 0, mouse_y = 0, mouse_down = false, mouse_disabled = false;

    let sinceLastMovementEvent = 0;

    let isFullscreen = false;

    let toggleFullscreen = function () {};

    export const init = function () {
        console.log("Initializing Controls...");

        document.querySelectorAll('.controls h4').forEach(c => {
            console.log(c);

            const scrollLength = 3 * window.innerHeight / 4;
            c.addEventListener('click', function (event) {
                let scrollInterval = 33;
                let scrollTime = 533;
                let scrolled = 0

                const startScroll = setInterval(function () {
                    if (scrolled < scrollLength) {
                        scroll({top: scrolled, left: 0});
                    }
                    scrolled += Math.floor(scrollLength / (scrollTime / scrollInterval));
                }, scrollInterval);

            });

            c.title = "Click To See Article";
        });

        document.querySelectorAll('canvas').forEach(c => {
            console.log(c);

            toggleFullscreen = () => {
                if (!isFullscreen) {
                    isFullscreen = true;
                    c.parentElement.className += " fullscreen"
                    for (const control of document.getElementsByClassName("controls")) {
                        control.className += " fullscreen";
                    }
                } else {
                    isFullscreen = false;
                    c.parentElement.className = c.parentElement.className.replace("fullscreen", '');
                    for (const control of document.getElementsByClassName("controls")) {
                        control.className = control.className.replace("fullscreen", '');
                    }
                }
            }

            c.addEventListener('keydown', function (event) {
                const kbEvent = (event || window['event']); // cross-browser shenanigans

                if (((new Date()).getTime() - sinceLastMovementEvent) > 66) {

                    // console.log(kbEvent);

                    sinceLastMovementEvent = (new Date()).getTime();

                    if (kbEvent['keyCode'] === 32) { // spacebar

                        kbEvent.preventDefault();

                        return true;

                    } else if (kbEvent['keyCode'] === 38 || kbEvent['keyCode'] === 87) { // up || W

                        dispatch('forward');

                        kbEvent.preventDefault();

                        return true;

                    } else if (kbEvent['keyCode'] === 40 || kbEvent['keyCode'] === 83) { // down || S

                        dispatch('backward');

                        kbEvent.preventDefault();

                        return true;

                    } else if (kbEvent['keyCode'] === 37 || kbEvent['keyCode'] === 65) { // left || A

                        dispatch('left');

                        kbEvent.preventDefault();

                        return true;

                    } else if (kbEvent['keyCode'] === 39 || kbEvent['keyCode'] === 68) { // right || D

                        dispatch('right');

                        kbEvent.preventDefault();

                        return true;

                    } else {
                        console.log('Keyboard Event: ', kbEvent['keyCode']);

                        return false;
                    }
                }
            });

            c.addEventListener('wheel', function (event) {
                const wheelEvent = (event || window['event']);

                if (((new Date()).getTime() - sinceLastMovementEvent) > 66) {

                    sinceLastMovementEvent = (new Date()).getTime();

                    if (wheelEvent.deltaY < 0) {
                        dispatch('up');
                    } else if (wheelEvent.deltaY > 0) {
                        dispatch('down');
                    }
                }

                // wheelEvent.preventDefault();
            });
        });
    };
</script>

<style>
    .controls h4 {
        color: black;
        cursor: pointer;
        pointer-events: all;
    }
</style>

<div class="controls right">

    <h4>{ title }</h4>

    {#if (booleanOptions['labels'].length > 0 && booleanOptions['values'].length > 0)}
        {#each booleanOptions['values'] as option, o}
            <label>
                <input type="checkbox" bind:checked={option.value} /> {booleanOptions['labels'][o]}
            </label><br />
        {/each}
    {/if}

    {#if (colorOptions['labels'].length > 0 && colorOptions['values'].length > 0)}
        {#each colorOptions['values'] as option, o}
            <label>
                <input type="color" style="height: 40px" bind:value={option.value} /><br />
                {colorOptions['labels'][o]}
            </label><br />
        {/each}
    {/if}

    {#if (rangeOptions['labels'].length > 0 && rangeOptions['values'].length > 0)}
        {#each rangeOptions['values'] as option, o}
            <label>
                <input type="range" bind:value={option.value} min={rangeOptions['min'][o]} max={rangeOptions['max'][o]} step={rangeOptions['step'][o]} /><br />
                {rangeOptions['labels'][o]}({option.value})
            </label><br />
        {/each}
    {/if}

    <label>
        <button on:click="{toggleFullscreen}">{((isFullscreen) ? 'minimize' : 'maximize')}</button>
    </label>

</div>
