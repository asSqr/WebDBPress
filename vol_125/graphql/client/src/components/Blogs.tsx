import graphql from "babel-plugin-relay/macro";
import React from "react";
import { useLazyLoadQuery } from "react-relay";
import type {
    BlogsQuery
} from './__generated__/BlogsQuery.graphql';
import { BlogList } from "./BlogList";

export const Blogs: React.VFC = () => {
    const data = useLazyLoadQuery<BlogsQuery>(
        graphql`
            query BlogsQuery {
                ...BlogList
            }
        `,
        {}
    );

    return <BlogList blogs={data} />;
}