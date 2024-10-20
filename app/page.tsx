import React from "react";
import fs from "fs";
import matter from "gray-matter";
import Markdown from "markdown-to-jsx";
import PostCard from "@/components/PostCard";
// import RecipeCard from "@/components/RecipeCard";
import ScrollToTopComponent from "@/components/ScrollToTopComponent";
import { Post, Recipe } from "@/types";
import { getContent } from "@/utils";

const introFileContent = fs.readFileSync(`./content/index.md`, "utf8");

export default function Home() {
    const introMatter = getContent(introFileContent);
    const postMetadata: Post[] = // await fetch('https://.../posts').then((res) => res.json())
        [
            // { title: "Apple Pie", content: "", description: "", slug: "apple_pie" }, // => /content/apple_pie.html
            // { title: "Banana Bread", content: "", description: "", slug: "banana_bread" }, // => /content/banana_bread.html
            // { title: "Blueberry Scones", content: "", description: "", slug: "blueberry_scones" }, // => /content/blueberry_scones.html
            // { title: "Chocolate Chip Cookies", content: "", description: "", slug: "chocolate_chip_cookies" }, // => /content/chocolate_chip_cookies.html
            // { title: "Cinnamon Rolls", content: "", description: "", slug: "cinnamon_rolls" }, // => /content/cinnamon_rolls.html
            // { title: "Lemon Poppy Seed Muffins", content: "", description: "", slug: "lemon_poppy_seed_muffins" } // => /content/lemon_poppy_seed_muffins.html
            { title: "Meet the Developer", content: "", description: "", slug: "README" }
        ];

    console.log(introMatter.content);

    // console.log(introMatter.content.toString().search("class="));

    // console.log(postMetadata);

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

            <ScrollToTopComponent />
        </main>
  );
}
