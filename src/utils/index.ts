import fs from "fs";
import matter from "gray-matter";
import { Post } from "@/types";

export function getIntroContent() {
    const file = `./content/index.md`;
    const content = fs.readFileSync(file, "utf8");

    const matterResult = matter(content);
    return matterResult;
}

export function getPostMetadata (basePath: string): Post[] {
    const dir = basePath + "/";
    const files = fs.readdirSync(dir);
    const markdownPosts = files.filter((file) => file.endsWith(".md"));

    return markdownPosts.map((filename) => {
        const fileContents = fs.readFileSync(`${basePath}/${filename}`, "utf8");
        const matterResult = matter(fileContents);
        return {
            ...matterResult.data,
            slug: filename.replace('.md', '')
        } as Post;
    });
}

export function cleanMarkdownToJSContent (content: string) {
    const result = content.replace(/class=/g, "className=");
    console.log(content.match(/(class=)/g));
    return result;
}
