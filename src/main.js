import './styles/global.css';
import App from './apps/App.svelte';
import GLSLApp from './apps/GLSLApp.svelte';
import SimulationApp from './apps/SimulationApp.svelte';
import TerrainApp from './apps/TerrainApp.svelte';
import TechApp from './apps/TechApp.svelte';
import VizRApp from './apps/VizRApp.svelte';


const appId = 'svelte-app';
const appElement = document.getElementById(appId);
export default ( // Check if app id exists in DOM
    appElement !== null &&
    (appElement.constructor.name === 'HTMLElement' ||
        appElement.constructor.name === 'HTMLDivElement')
) ?
    new App({
        target: appElement,
        props: {
            greeting:
                `Hooray 🎉 - you've built this with <a href='https://github.com/dancingfrog/sveltr' target='_blank'>SveltR</a>!`
        }
    }) : {};


const glslAppId = "glsl-app";
const glslAppElement = document.getElementById(glslAppId);
export const glslApp = (
    glslAppElement !== null &&
    (glslAppElement.constructor.name === 'HTMLElement' ||
        glslAppElement.constructor.name === 'HTMLDivElement')
) ?
    new GLSLApp({
        target: glslAppElement,
        props: {
            title: "🦊 Hello SvelteGL!"
        }
    }) : {};


const simulationAppId = "simulation-app";
const simulationAppElement = document.getElementById(simulationAppId);
export const simulationApp = (
    simulationAppElement !== null &&
    (simulationAppElement.constructor.name === 'HTMLElement' ||
        simulationAppElement.constructor.name === 'HTMLDivElement')
) ?
    new SimulationApp({
        target: simulationAppElement,
        props: {
            title: "Event Simulation"
        }
    }) : {};


const terrainAppId = "terrain-app";
const terrainAppElement = document.getElementById(terrainAppId);
export const terrainApp = (
    terrainAppElement !== null &&
    (terrainAppElement.constructor.name === 'HTMLElement' ||
        terrainAppElement.constructor.name === 'HTMLDivElement')
) ?
    new TerrainApp({
        target: terrainAppElement,
        props: {
            title: "🦊 Hello SvelteGL!"
        }
    }) : {};


const techAppId = 'tech-app';
const techAppElement = document.getElementById(techAppId);
export const techApp = (
    techAppElement !== null &&
    (techAppElement.constructor.name === 'HTMLElement' ||
        techAppElement.constructor.name === 'HTMLDivElement')
    ) ?
    new TechApp({
        target: techAppElement,
        props: {
            title: '🎉 Built with <a href="https://github.com/Real-Currents/SveltR" target="_blank">SveltR</a>! 🦊'
        }
    }) : {};


const vizrAppId = 'vizr-app';
const vizrAppElement = document.getElementById(vizrAppId);
export const vizrApp = (
    vizrAppElement !== null &&
    (vizrAppElement.constructor.name === 'HTMLElement' ||
        vizrAppElement.constructor.name === 'HTMLDivElement')
) ?
    new VizRApp({
        target: vizrAppElement,
        props: {
            title: 'Visualizing R Data with SveltR 🦊'
        }
    }) : {};

