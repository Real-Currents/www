<script>
    import { onMount } from 'svelte';
    import Emitter from './components/invoice/Emitter.svelte';
    import Clients from './components/invoice/Clients.svelte';
    import Work from './components/invoice/Work.svelte';

    export let title;

    let buttonText = 'Create Invoice';

    let getEmitters;

    let emitter;

    let getClients;

    let clients;

    let getWork;

    let workSelection;

    let note = "";

    let invoiceResult = null;

    async function handleClick() {
        buttonText = 'Building ...'

        if (!!workSelection && workSelection.length > 0) {
            let  client;
            workSelection.filter(w =>
                clients.filter(c => {
                    if (c['org'] === w['org']) {
                        client = c;
                        return true;
                    }
                }).length > 0
            );

            if (!!client) {

                const invoiceData = {
                    emitter: emitter,
                    client: client,
                    workEntries: workSelection
                };

                if (!!note) {
                    invoiceData['note'] = note;
                }

                await fetch('/create-invoice', {
                    // headers: {},
                    method: 'POST',
                    body: JSON.stringify(invoiceData)
                })
                    .then(res => res.json())
                    .then(json => (invoiceResult = JSON.stringify(json)) && console.log("Response: ", json))
                    .catch(err => (invoiceResult = err) && console.error(err));

            } else {
                window.alert("Work entries do not match any client!");
            }

        } else {
            window.alert("Not work entries have been selected!");
        }

        buttonText = 'Create Invoice';
    }

    onMount(async () => {
        if (typeof getEmitters === 'function' &&
            typeof getClients === 'function' &&
            typeof getWork === 'function'
        ) {
            console.log("Retrieving work data: ");
            console.log(await getEmitters('shop/data/emitter.csv'));
            console.log(await getClients('shop/data/clients.csv'));
            console.log(await getWork('shop/data/work.csv'));
        }
    });
</script>

<style>
    .invoice-controls {
        text-align: center;
        padding: 1em;
        margin: 0 auto;
    }

    h1, h2, h3, h4 {
        text-transform: uppercase;
        font-size: 4em;
        font-weight: 100;
    }

    .invoice-controls .emitter {
        display: inline-block;
        float: left;
        padding: 10px;
        max-width: 320px;
        width: max-content;
        width: -moz-max-content;
    }

    .invoice-controls .clients {
        display: inline-block;
        padding: 10px;
        max-width: 320px;
        width: max-content;
        width: -moz-max-content;
    }


    .invoice-controls .work {
        clear: both;
        padding: 10px;
        width: max-content;
        width: -moz-max-content;
    }

    .invoice-controls button {
        clear: both;
    }

</style>

<div class="invoice-controls">

    <h4>{title}</h4>

    <div class="emitter">
        <Emitter bind:emitter="{emitter}" bind:getEmitters="{getEmitters}" />
    </div>

    <div class="clients">
        <Clients bind:clients="{clients}" bind:getClients="{getClients}" />
    </div>

    <br /><br /><br />

    <div class="work">
        <Work bind:getWorkEntries="{getWork}" bind:selection="{workSelection}" />
    </div>

    <input name="note" type="text" value="{note}" />

    {#if (!!workSelection && workSelection.length > 0)}
        {#each workSelection as selected}
            <p>{selected.org} - {selected.description}</p>
        {/each}
    {/if}

    {#if (invoiceResult != null)}
        <p>{invoiceResult}</p>
    {/if}

    <button on:click="{handleClick}">{buttonText}</button>

</div>
