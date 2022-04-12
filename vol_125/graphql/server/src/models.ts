export type BlogModel = {
    id: string;
    name: string;
}

export type PostModel = {
    id: string;
    blogId: string;
    title: string;
    body: string;
}