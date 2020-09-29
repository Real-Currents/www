<script>
	import { onMount } from 'svelte';
	import QuadStore from "./modules/quad-store";

	export let title;

	let buttonText = 'Create Invoice'

	let invoiceResult = null;

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

	onMount(() => {

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

	{#if (invoiceResult != null)}
		<p>{invoiceResult}</p>
	{/if}

</div>
