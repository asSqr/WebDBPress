"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBlogs = exports.findBlogs = exports.findBlog = void 0;
const BLOGS = [
    {
        id: "1",
        name: "つれづれ草子",
    },
    {
        id: "2",
        name: "インターネット観察日記",
    },
    {
        id: "3",
        name: "びっくりブログ",
    },
];
async function findBlog(id) {
    return BLOGS.find((blog) => blog.id === id);
}
exports.findBlog = findBlog;
async function findBlogs(ids) {
    const result = {};
    for (const id of ids) {
        const blog = await findBlog(id);
        if (!blog) {
            continue;
        }
        result[id] = blog;
    }
    return result;
}
exports.findBlogs = findBlogs;
async function getBlogs() {
    return BLOGS;
}
exports.getBlogs = getBlogs;
