// From tutorial by Smoljames
// https://www.github.com/jamezmca/static-recipe-blog
// https://www.youtube.com/watch?v=QIIc5EYSZpw
"use client";
import Link from "next/link";
import { Recipe } from "@/types";

export default function RecipeCard (props: { contentRoot: string, post: Recipe }) {
    const { contentRoot, post } = props;

    return (
      <Link className={"unstyled"}
            href={`/${contentRoot}/${post.slug}`}
            key={post.slug}>
          <div className={"postCard"}>
              <h3>{post.title}</h3>
              <p>{post.description}</p>
              <div>
                  <h5>Prep time:</h5>
                  <p>{post.prep_time}</p>
              </div>
              <div>
                  <h5>Cook time:</h5>
                  <p>{post.cook_time}</p>
              </div>
          </div>
      </Link>
    );
 }
