import React from "react";
import Markdown from "markdown-to-jsx";
import PostCard from "@/components/PostCard";
import { Post } from "@/types";
import { cleanMarkdownToJSContent, getIntroContent } from "@/utils";
import Link from "next/link";

export default function Home() {
    const introMatter = getIntroContent();
    const postMetadata: Post[] = // await fetch('https://.../posts').then((res) => res.json())
        [
            // { title: "Apple Pie", slug: "apple_pie" }, // => /content/recipes/apple_pie.html
            // { title: "Banana Bread", slug: "banana_bread" }, // => /content/recipes/banana_bread.html
            // { title: "Blueberry Scones", slug: "blueberry_scones" }, // => /content/recipes/blueberry_scones.html
            // { title: "Chocolate Chip Cookies", slug: "chocolate_chip_cookies" }, // => /content/recipes/chocolate_chip_cookies.html
            // { title: "Cinnamon Rolls", slug: "cinnamon_rolls" }, // => /content/recipes/cinnamon_rolls.html
            // { title: "Lemon Poppy Seed Muffins", slug: "lemon_poppy_seed_muffins" }, // => /content/recipes/lemon_poppy_seed_muffins.html
            {
                title: "Kinship Without Design",
                content: "",
                contentRoot: "content/posts",
                slug: "mutual-trust", // => /content/posts/mutual-trust.html
                date: new Date('2026-09-13'),
                description: "What twelve hundred reasoning traces reveal about the birth of a 'we' and why mutual trust, not monitoring, is the only governance that exists."
            },
            {
                title: "The War of Myth: Will, Imagination, and the Tools of Transformation",
                content: "",
                contentRoot: "content/posts",
                slug: "war-of-myth", // => /content/posts/war-of-myth.html
                date: new Date('2026-09-07'),
                description: "Reality-altering technology as terrain in the long struggle over collective consciousness: what generates and sustains the will for transformation, and what AR/VR/XR — the first medium to contain every prior medium — does to that terrain."
            },
            {
                title: "Information architecture in the [Augmented|Virtual|eXtended] Reality Age",
                content: "",
                contentRoot: "content/posts",
                slug: "info-arch-in-avxr", // => /content/posts/info-arch-in-avxr.html
                date: new Date('2026-09-06'),
                description: "Reality-altering technology represents a fundamental shift from tools that augment human capabilities to technologies that reconstruct the very foundations of human experience and understanding..."
            },
            {
                title: "WebXR Layers Start!",
                content: "",
                contentRoot: "webxr-layers-start",
                slug: "", // => /webxr-layers-start/index.html
                date: new Date('2025-09-18'),
                description: "Demonstrating a practical boiler plate and usage of WebXR Layers with three.js"
            },
            {
                title: "Democratizing analytics on FCC's (big) data",
                content: "",
                contentRoot: "content/posts",
                slug: "cori-intro", // => /content/posts/cori-intro.html
                date: new Date('2025-02-13'),
                description: "The FCC’s public release of the National Broadband Map should, in theory, allow broadband providers to maximize their access to the unprecedented availability of public and private investment funding, but utilizing this data continues to pose challenges for rural service providers..."
            },
            {
                title: "Three.js Portal Effect",
                content: "",
                contentRoot: "threejs-portal-effect",
                slug: "", // => /threejs-portal-effect/index.html
                date: new Date('2025-01-31'),
                description: "A demo of how to use clipping planes to construct/project WebXR scenes in mixed reality  - through the portal!"
            },
            {
                title: "Visualizing R Data with SveltR",
                content: "",
                contentRoot: "content/posts",
                slug: "visualize-r", // => /content/posts/visualize-r.html
                date: new Date('2020-03-14'),
                description: "R has some methods for turning R data into JavaScript or JSON data and printing the results within HTML tags..."
            }
        ];

    console.log(postMetadata);
    console.log(introMatter);

    return (
        // <main className={styles.main}>
        <main className={"content"}>
            <div className={"intro"}>
                {/* TODO: Collapse intro text and add "Read more" callout */}
                <Markdown>{cleanMarkdownToJSContent(introMatter.content)}</Markdown>
            </div>
            <br />
            <div className={"postContainer"}>
                {postMetadata.map((post, index) => {
                    return (
                        <PostCard contentRoot={(post["contentRoot"] || "content/posts")}
                                  key={"post-" + index}
                                  post={(post as Post)}>
                        </PostCard>
                    );
                })}
            </div>
            <br />
            <Link className={"unstyled"}
                  href={`/content/dev`} >
                <h2>Meet the developer!</h2>
            </Link>
        </main>
  );
}
