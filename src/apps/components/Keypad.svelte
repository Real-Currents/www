<script>
	import { createEventDispatcher } from 'svelte';

	export let value = '';

	const dispatch = createEventDispatcher();

	const select = num => () => value = `${value}${num}`;
	const clear  = () => value = '';
	const submit = () => dispatch('submit');

	document.addEventListener('keydown', function (event) {
		const kbEvent = (event || window['event']); // cross-browser shenanigans

		console.log(kbEvent);

		if (kbEvent['keyCode'] === 13) { // Enter

			submit();

			kbEvent.preventDefault();

		} else if (kbEvent['keyCode'] === 8 || kbEvent['keyCode'] === 46) { // Backspace or Delete

			clear();

			kbEvent.preventDefault();

		} else if (47 < kbEvent['keyCode'] && kbEvent['keyCode'] < 58) { // numbers

			value = `${value}${kbEvent['key']}`;
			console.log(value);

			kbEvent.preventDefault();

		} else {
			console.log('Keyboard Event: ', kbEvent['keyCode']);
		}

		return true;
	});
</script>

<style>
	.keypad {
		display: grid;
		grid-template-columns: repeat(3, 5em);
		grid-template-rows: repeat(4, 3em);
		grid-gap: 0.5em
	}

	button {
		margin: 0
	}
</style>

<div class="keypad">
	<button on:click={select(1)}>1</button>
	<button on:click={select(2)}>2</button>
	<button on:click={select(3)}>3</button>
	<button on:click={select(4)}>4</button>
	<button on:click={select(5)}>5</button>
	<button on:click={select(6)}>6</button>
	<button on:click={select(7)}>7</button>
	<button on:click={select(8)}>8</button>
	<button on:click={select(9)}>9</button>

	<button disabled={!value} on:click={clear}>clear</button>
	<button on:click={select(0)}>0</button>
	<button disabled={!value} on:click={submit}>submit</button>
</div>
