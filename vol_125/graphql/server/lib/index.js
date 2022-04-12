"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_1 = require("apollo-server");
const dataloader_1 = __importDefault(require("dataloader"));
const graphql_relay_1 = require("graphql-relay");
const blog_1 = require("./data/blog");
const post_1 = require("./data/post");
const context = {
    blogLoader: new dataloader_1.default(async (ids) => {
        const blogs = await (0, blog_1.findBlogs)(ids);
        return ids.map((id) => blogs[id] ?? new Error(`No result for ${id}`));
    }),
};
const typeDefs = (0, apollo_server_1.gql) `
    interface Node {
        id: ID!
    }

    type PageInfo {
        hasNextPage: Boolean!
        hasPreviousPage: Boolean!
        startCursor: String
        endCursor: String
    }

    type Blog implements Node {
        id: ID!
        name: String!
        posts(first: Int!, after: String): PostConnection!
    }

    type BlogConnection {
        edges: [BlogEdge]
        pageInfo: PageInfo!
    }

    type BlogEdge {
        node: Blog
        cursor: String!
    }

    type Post implements Node {
        id: ID!
        title: String!
        body: String!
        blog: Blog!
    }

    type PostConnection {
        edges: [PostEdge]
        pageInfo: PageInfo!
    }

    type PostEdge {
        node: Post
        cursor: String!
    }

    type Query {
        node(id: ID!): Node
        blogs(first: Int!, after: String): BlogConnection!
    }
`;
const resolvers = {
    Query: {
        node: async (parent, args) => {
            const { type, id } = (0, graphql_relay_1.fromGlobalId)(args.id);
            switch (type) {
                case "Blog":
                    const blog = await (0, blog_1.findBlog)(id);
                    if (!blog) {
                        return null;
                    }
                    return {
                        ...blog,
                        id: (0, graphql_relay_1.toGlobalId)("Blog", blog.id),
                    };
                case "Post":
                    const post = await (0, post_1.findPost)(args.id);
                    if (!post) {
                        return null;
                    }
                    return {
                        ...post,
                        id: (0, graphql_relay_1.toGlobalId)("Post", post.id),
                    };
                default:
                    throw new Error(`Unknown type: ${type}`);
            }
        },
        blogs: async (parent, args) => {
            return (0, graphql_relay_1.connectionFromArray)((await (0, blog_1.getBlogs)()).map((blog) => ({
                ...blog,
                id: (0, graphql_relay_1.toGlobalId)("Blog", blog.id),
            })), args);
        },
    },
    Blog: {
        posts: async (parent, args) => {
            const { id } = (0, graphql_relay_1.fromGlobalId)(parent.id);
            return (0, graphql_relay_1.connectionFromArray)((await (0, post_1.findPostByBlogId)(id)).map((post) => ({
                ...post,
                id: (0, graphql_relay_1.toGlobalId)("Post", post.id),
            })), args);
        },
    },
    Post: {
        blog: async (parent, args, context) => {
            const blog = await context.blogLoader.load(parent.blogId);
            return {
                ...blog,
                id: (0, graphql_relay_1.toGlobalId)("Blog", blog.id),
            };
        },
    },
    Node: {
        __resolveType: (parent) => {
            const { type } = (0, graphql_relay_1.fromGlobalId)(parent.id);
            switch (type) {
                case "Blog":
                case "Post":
                    return type;
                default:
                    throw new Error(`Unknown Type: ${type}`);
            }
        },
    },
};
const server = new apollo_server_1.ApolloServer({
    typeDefs,
    resolvers,
    context,
});
server.listen().then(({ url }) => {
    console.log(`Server ready at ${url}`);
});
