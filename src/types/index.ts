export type Profiles = {
    id: string;
    username: string;
    bio: string | null;
    avatar_url: string | null;
    created_at: string;
    user_id: string;
}
export type Threads = {
    id: string;
    tags: string;
    category_id: string;
    author_id: string;
    title: string;
    content: string;
    image_url: string | null;
    upvote_count: number;
    downvote_count: number;
    created_at: string;                                 
}
export type Categories = {
    id: string;
    name: string;
    description: string | null;
    created_at: string;
}