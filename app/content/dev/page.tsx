// From tutorial by Smoljames
// https://www.github.com/jamezmca/static-recipe-blog
// https://www.youtube.com/watch?v=QIIc5EYSZpw
import RecipeCard from "@/components/RecipeCard";
import {Post, Recipe} from "@/types";
import { getPostMetadata } from "@/utils";
import StaticRewriteComponent from "@/components/StaticRewriteComponent";
import React from "react";

export default function Home() {
  const postMetadata: Post[] = getPostMetadata("content/dev");

  console.log(postMetadata);

  return (
    // <main className={styles.main}>
    <main>
        <div className={"postContainer"}>
            {postMetadata.map((post, index) => {
                return (
                    <RecipeCard contentRoot={"content/dev"}
                              key={"post-" + index}
                              post={(post as Recipe)}>
                    </RecipeCard>
                );
            })}
        </div>
        <StaticRewriteComponent uri={`/content/dev.html`} />
    </main>
  );
}
