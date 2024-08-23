"use client";
import Link from "next/link";
import dateformat from "dateformat";
import { Post } from "@/types";

export default function PostCard (props: { contentRoot: string, post: Post }) {
    const { contentRoot, post } = props;

    return (
      <Link className={"unstyled"}
            href={`/${contentRoot}/${post.slug}`}
            key={post.slug}>
          <div className={"post-card"}>
              <h3>{post.title}</h3>
              {(!!post.date
                && <p className={"post-description"}>{dateformat(post.date, 'dddd, mmmm dS, yyyy').toString()}</p>
              )}
              {(!!post.description
                && <p className={"post-description"}>{post.description}</p>
              )}
          </div>
      </Link>
    );
 }
