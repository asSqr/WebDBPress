export type BlogData = {
  id: string;
  name: string;
};

const BLOGS: BlogData[] = [
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

export async function findBlog(id: string): Promise<BlogData | undefined> {
  return BLOGS.find((blog) => blog.id === id);
}

export async function findBlogs(
  ids: readonly string[]
): Promise<{ [id in string]: BlogData }> {
  const result: { [id in string]: BlogData } = {};
  for (const id of ids) {
    const blog = await findBlog(id);
    if (!blog) {
      continue;
    }
    result[id] = blog;
  }
  return result;
}

export async function getBlogs(): Promise<BlogData[]> {
  return BLOGS;
}
