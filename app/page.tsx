import React from "react";
import fs from "fs";
import matter from "gray-matter";
import Markdown from "markdown-to-jsx";
import { getIntroContent, metadata } from "@/app/layout";
import PostCard from "@/components/PostCard";
import RecipeCard from "@/components/RecipeCard";
import StaticRewriteComponent from "@/components/StaticRewriteComponent";
import { Post, Recipe } from "@/types";

export default function Home() {
    const introMatter = getIntroContent();
    const postMetadata: Post[] = // await fetch('https://.../posts').then((res) => res.json())
        [
            // { title: "Apple Pie", slug: "apple_pie" }, // => /content/apple_pie.html
            // { title: "Banana Bread", slug: "banana_bread" }, // => /content/banana_bread.html
            // { title: "Blueberry Scones", slug: "blueberry_scones" }, // => /content/blueberry_scones.html
            // { title: "Chocolate Chip Cookies", slug: "chocolate_chip_cookies" }, // => /content/chocolate_chip_cookies.html
            // { title: "Cinnamon Rolls", slug: "cinnamon_rolls" }, // => /content/cinnamon_rolls.html
            // { title: "Lemon Poppy Seed Muffins", slug: "lemon_poppy_seed_muffins" } // => /content/lemon_poppy_seed_muffins.html
            { title: "Meet the Developer", slug: "README" }
        ];

    console.log(postMetadata);
    console.log(introMatter);

    return (
        // <main className={styles.main}>
        <main className={"content"}>
            <div className={"intro"}>
                {/* TODO: Collapse intro text and add "Read more" callout */}
                <Markdown>{introMatter.content}</Markdown>
            </div>
            <br />
            <div className={"postContainer"}>
                {postMetadata.map((post, index) => {
                    return (
                        // <PostCard contentRoot={"content/recipes"}
                        <PostCard contentRoot={"content/dev"}
                                    key={"post-" + index}
                                    post={(post as Post)}>
                        </PostCard>
                    );
                })}
            </div>
        </main>
  );
}
