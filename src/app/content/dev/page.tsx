// From tutorial by Smoljames
// https://www.github.com/jamezmca/static-recipe-blog
// https://www.youtube.com/watch?v=QIIc5EYSZpw
import React from "react";
import fs from "fs";
import matter from "gray-matter";
import Markdown from "markdown-to-jsx";
import { metadata } from "@/app/layout";
import StaticRewriteComponent from "@/components/StaticRewriteComponent";
import { Post } from "@/types";
import { cleanMarkdownToJSContent, getPostMetadata } from "@/utils";

interface ContentParams {
    params: Post;
}

// Return a list of `params` to populate the [slug] dynamic segment
export async function generateStaticParams (): Promise<Post[]> {
    return getPostMetadata("content/dev");
}

export async function generateMetadata ({ params }: ContentParams) {
    const id: string = (!!params?.slug) ? params.slug : '';
    return {
        title: `${metadata.title} - ${id.replaceAll("_", " ")}`
    }
}

function getPostContent () {
    const file = `./content/dev/index.md`;
    const content = fs.readFileSync(file, "utf8");

    const matterResult = matter(content);
    return matterResult;
}

// Multiple versions of this page will be statically generated
// using the `params` returned by `generateStaticParams`
export default function ContentPage ({ params }: ContentParams) {
    const postMatter = getPostContent();

    // console.log(postMatter);
    // console.log(cleanMarkdownToJSContent(postMatter.content));

    return (
        <main>
            <article>
                {(!!postMatter.data.title && <h1>{postMatter.data.title}</h1>)}
                <Markdown>{cleanMarkdownToJSContent(postMatter.content)}</Markdown>
            </article>
            {/*<StaticRewriteComponent uri={`/content/dev.html`} />*/}
        </main>
    );
}
