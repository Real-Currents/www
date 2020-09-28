<script>
	import { onMount } from 'svelte';
	import QuadStore from "./modules/quad-store";

	export let title;

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
	h4 {
		margin-left: 10%;
	}

</style>

<h4>{title}</h4>

<div class="controls">
	<label>
		Create Invoice
		<input type="button" style="height: 40px" value="Create Invoice" />
	</label>
</div>
