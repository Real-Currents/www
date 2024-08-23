// From tutorial by Smoljames
// https://www.github.com/jamezmca/static-recipe-blog
// https://www.youtube.com/watch?v=QIIc5EYSZpw
import React from "react";
import fs from "fs";
import matter from "gray-matter";
import Markdown from "markdown-to-jsx";
import { metadata } from "@/app/layout";
import StaticRewriteComponent from "@/components/StaticRewriteComponent";
import { Recipe } from "@/types";
import { cleanMarkdownToJSContent, getPostMetadata } from "@/utils";

interface ContentParams {
    params: Recipe;
}

// Return a list of `params` to populate the [slug] dynamic segment
export async function generateStaticParams (): Promise<Recipe[]> {
    // const Recipes = // await fetch('https://.../Recipes').then((res) => res.json())
    //     [
    //         { slug: "apple_pie" }, // => /content/apple_pie.html
    //         { slug: "banana_bread" }, // => /content/banana_bread.html
    //         { slug: "blueberry_scones" }, // => /content/blueberry_scones.html
    //         { slug: "chocolate_chip_cookies" }, // => /content/chocolate_chip_cookies.html
    //         { slug: "cinnamon_rolls" }, // => /content/cinnamon_rolls.html
    //         { slug: "lemon_poppy_seed_muffins" } // => /content/lemon_poppy_seed_muffins.html
    //     ];

    return (
        // Recipes.map((Recipe) => ({
        //     slug: Recipe.slug,
        // }));
        getPostMetadata("content/recipes") as Recipe[]
    );
}

export async function generateMetadata ({ params }: ContentParams) {
    const id: string = (!!params?.slug) ? params.slug : '';
    return {
        title: `${metadata.title} - ${id.replaceAll("_", " ")}`
    }
}

function getRecipeContent (slug: string) {
    const file = `./content/recipes/${slug}.md`;
    const content = fs.readFileSync(file, "utf8");

    const matterResult = matter(content);
    return matterResult;
}

// Multiple versions of this page will be statically generated
// using the `params` returned by `generateStaticParams`
export default function ContentPage ({ params }: ContentParams) {
    const { slug } = params;
    const RecipeMatter = getRecipeContent(slug);

    return (
        <main>
            <article>
                <Markdown>{cleanMarkdownToJSContent(RecipeMatter.content)}</Markdown>
            </article>
            <StaticRewriteComponent uri={`/content/recipes/${slug}.html`} />
        </main>
    );
}
