"use client";
import Link from "next/link";
import { Post } from "@/types";

export default function PostCard (props: { contentRoot: string, post: Post }) {
    const { contentRoot, post } = props;

    return (
      <Link className={"unstyled"}
            href={`/${contentRoot}/${post.slug}`}
            key={post.slug}>
          <div className={"postCard"}>
              <h3>{post.title}</h3>
              <p>{post.description}</p>
          </div>
      </Link>
    );
 }
