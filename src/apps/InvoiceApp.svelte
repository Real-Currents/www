<script>
    import * as d3 from 'd3';
    import { map } from 'rxjs/operators';
    import { onMount } from 'svelte';
    import QuadStore from './modules/quad-store';
    import Emitter from './components/invoice/Emitter.svelte';

    export let title;

    let buttonText = 'Create Invoice';

    let emitter;

    let invoiceResult = null;

    async function getEmitterData () {
        const emitterData = (await d3.csv('shop/data/emitter.csv')).map(d => ({
            name: 'Real~Currents',
            first_name: 'John',
            last_name: 'Hall',
            street_number: '17',
            street_name: 'Victory Circle',
            city: 'White River Junction',
            country: 'VT', // state
            zip_code: '05001',
            phone: '510.306.1376',
            mail: 'john@real-currents.com',
            website: 'www.real-currents.com'
        }));

        console.log("emitter: ", emitterData);

        return emitterData;
    }

    async function handleClick() {
        buttonText = 'Building ...'

        await fetch('/test-invoice', {
            method: 'POST'
            // headers: {},
            // body: uploadData
        })
            .then(res => res.json())
            .then(json => (invoiceResult = json) && console.log("Response: ", json))
            .catch(err => (invoiceResult = err) && console.error(err));

        buttonText = 'Create Invoice';
    }

    const eventQuad = new QuadStore(
        6,
        [[ -16.0, -16.0 ],[ 16.0, 16.0 ]]
    );

    const eventsLoading = [false];

    const eventsLoaded = [false];

    const initQuadWidth = (eventQuad.extent[1][0] - eventQuad.extent[0][0]) / 2,
        initQuadDepth = (eventQuad.extent[1][1] - eventQuad.extent[0][1]) / 2;

    const heightmap = [];
    const gridSizeX = initQuadWidth * 2;
    const gridSizeZ = initQuadDepth * 2;

    let quadList = [];

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

    onMount(async () => {
        emitter = await getEmitterData();
        console.log("Retrieved emitter data");
    });
</script>

<style>
    .invoice-controls {
        text-align: center;
        padding: 1em;
        max-width: 240px;
        margin: 0 auto;
    }

    h1, h2, h3, h4 {
        text-transform: uppercase;
        font-size: 4em;
        font-weight: 100;
    }

</style>

<div class="invoice-controls">

    <h4>{title}</h4>

    <button on:click="{handleClick}">{buttonText}</button>

    {#if (!!emitter && emitter.length > 0)}
        <Emitter bind:emitter="{emitter[0]}" />
        <!--p>{emitter[0].name}</p-->
    {/if}

    {#if (invoiceResult != null)}
        <p>{invoiceResult}</p>
    {/if}

</div>
