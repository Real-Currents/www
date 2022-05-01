# Shiny Svelte App

## A simple template for Svelte app development (optionally with R/Shiny backend)

<br />

    appDir <- "."

<br />

## Get started

Install the dependencies…

    npm install

…then start [Rollup](https://rollupjs.org):

    npm run dev

Navigate to [localhost:5000](http://localhost:5000). You should see your
app running. Edit a component file in `src`, save it, and reload the
page to see your changes.

## Building and running in production mode

To create an optimised version of the app:

    npm run build

You can run the newly built app with `npm run start`.

## Using TypeScript

This template comes with a script to set up a TypeScript development
environment, you can run it immediately after cloning the template with:

    node scripts/setupTypeScript.js

Or remove the script via:

    rm scripts/setupTypeScript.js

If you want to use `baseUrl` or `path` aliases within your `tsconfig`,
you need to set up `@rollup/plugin-alias` to tell Rollup to resolve the
aliases. For more info, see [this StackOverflow
question](https://stackoverflow.com/questions/63427935/setup-tsconfig-path-in-svelte).
