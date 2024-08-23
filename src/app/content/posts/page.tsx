import * as React from "react";
import PostCard from "@/components/PostCard";
import StaticRewriteComponent from "@/components/StaticRewriteComponent";
import { Post } from "@/types";
import { getPostMetadata } from "@/utils";

export default function Home() {
  const postMetadata: Post[] = getPostMetadata("content/posts");

  console.log(postMetadata);

  return (
    // <main className={styles.main}>
    <main>
        <div className={"postContainer"}>
            {postMetadata.map((post, index) => {
                return (
                    <PostCard contentRoot={"content/posts"}
                              key={"post-" + index}
                              post={(post as Post)}>
                    </PostCard>
                );
            })}
        </div>
        <StaticRewriteComponent uri={`/content/posts.html`} />
    </main>
  );
}
