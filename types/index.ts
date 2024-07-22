export interface Post {
    title: string;
    slug: string;
}

export interface Recipe extends Post {
    description: string;
    cook_time: string;
    prep_time: string;
}
