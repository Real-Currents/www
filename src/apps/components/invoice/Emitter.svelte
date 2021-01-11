<script>
    import * as d3 from "d3";

    export let emitter;

    export const getEmitters = async (data) => {
        emitters = (await getEmitterData(data));
        emitter = emitters[0];
        return emitters;
    };

    let emitters;

    async function getEmitterData (data) {
        return (await d3.csv(data)).map(d => ({
            // TODO: validate field values...
            org: d['org'],
            name: d['name'],
            first_name: d['first_name'],
            last_name: d['last_name'],
            street_number: d['street_number'],
            street_name: d['street_name'],
            city: d['city'],
            country: d['country'], // state
            zip_code: d['zip_code'],
            phone: d['phone'],
            mail: d['mail'],
            website: d['website']
        }));
    }

</script>

<style>
    article {
        margin-top: 20px;
        padding: 0;
        /*border: 2px solid black;*/
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

{#if (!!emitters && emitters.length > 0)}
{#each emitters as emitter}
    <article>
        <ul class="asset" layout>
            <li><input class="key" type="hidden" value="{emitter.org}" /></li>
            <li flex><span class="name">{emitter.name}</span></li>
            <li flex><span class="first_name">{emitter.first_name}</span></li>
            <li flex><span class="last_name">{emitter.last_name}</span></li>
            <li flex="50" layout>
                <div flex><span class="street_number">{emitter.street_number}</span></div>&nbsp;
                <div flex><span class="street_number">{emitter.street_name}</span></div>
            </li>
            <li flex="50" layout>
                <div flex><span class="street_number">{emitter.city}</span></div>,&nbsp;
                <div flex><span class="street_number">{emitter.country}</span></div>&nbsp;
                <div flex><span class="street_number">{emitter.zip_code}</span></div>
                <!--div flex><span class="date-time created_at">{(new Date(created_at).toDateString())}</span></div-->
                <!--div flex><span class="date-time last_modified">{(new Date(last_modified).toDateString())}</span></div-->
            </li>
            <li flex><span class="phone">{emitter.phone}</span></li>
            <li flex><span class="mail">{emitter.mail}</span></li>
            <li flex><span class="website">{emitter.website}</span></li>
            <!--li flex="25">
                <div flex><input class="action" type="button" value="select" disabled /></div>
            </li-->
        </ul>
    </article>
{/each}
{/if}
