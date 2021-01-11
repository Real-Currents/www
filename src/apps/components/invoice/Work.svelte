<script>
    import * as d3 from "d3";

    export let selection = [];

    export const getWorkEntries = async (data) => {
        entries = (await getWorkData(data));
        return entries;
    };

    let entries;

    async function getWorkData (data) {
        return (await d3.csv(data)).map(d => ({
            // TODO: validate field values...
            org: d['org'],
            code: d['code'],
            description: d['description'],
            date: d['date'],
            price: +d['price'], // make number
            qt: +d['qt'] // make number
        }));
    }

</script>

<style>
    article {
        margin-top: 20px;
        padding: 0;
        /*border: 2px solid black;*/
        text-align: left;
    }

    article:not(:first-of-type) {
        border-top: none;
    }

    ul {
        margin: 0;
        padding: 0;
    }

    article * li {
        display: inline-flex;
        list-style: none;
        padding: 2px;
    }

    ul:hover {
        background-color: rgba(202, 202, 202, 0.5);
    }

    ul:hover {
        color: #000;
    }

    ul li span.name {
        font-weight: bolder;
    }

    ul li span.date-time {
        font-family: "Consolas", "Fira Code Retina", "Source Code Pro", "FreeMono", Monospaced,sans-serif;
    }

</style>

{#if (!!entries && entries.length > 0)}
{#each entries as entry, idx}
    <article>
        <ul class="asset" layout>
            <li><input class="key" type="hidden" value="{entry.code + '-' + idx}" /></li>
            <li flex="25">
                <div flex>
                    <input class="action"
                           name="{entry.code + '-' + idx}"
                           type="checkbox"
                           value="{entry}"
                           bind:group="{selection}" />
                </div>
            </li>
            <li flex><span class="code">{entry.code}</span></li>
            <li flex><span class="description">{entry.description}</span></li>
            <li flex="50" layout>
                <div flex><span class="date">{(new Date(entry.date).toDateString().replace(' ', ', '))}</span></div>,&nbsp;
                <div flex><span class="price">{entry.price}</span></div>&nbsp;
                <div flex><span class="qt">{entry.qt}</span></div>
                <!--div flex><span class="date-time created_at">{(new Date(created_at).toDateString())}</span></div-->
                <!--div flex><span class="date-time last_modified">{(new Date(last_modified).toDateString())}</span></div-->
            </li>
        </ul>
    </article>
{/each}
{/if}
