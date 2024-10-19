import { Metadata } from "next";

export interface HeaderLayoutProps extends Metadata {
    title: string,
    description?: string,
    subtitles?: string[]
}

export interface Post {
    content: string;
    description: string;
    title: string;
    slug: string;
}

export interface Recipe extends Post {
    cook_time: string;
    prep_time: string;
}
