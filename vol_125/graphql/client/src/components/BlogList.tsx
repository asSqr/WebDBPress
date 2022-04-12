import graphql from "babel-plugin-relay/macro";
import React from "react";
import { usePaginationFragment } from "react-relay";
import type {
    BlogList$key
} from "./__generated__/BlogList.graphql";
import { BlogListItem } from "./BlogListItem";

interface Props {
    blogs: BlogList$key;
}

export const BlogList: React.VFC<Props> = ({ blogs }) => {
    const { data, loadNext, hasNext } = usePaginationFragment(
        graphql`
        fragment BlogList on Query
        @argumentDefinitions(
            first: { type: "Int", defaultValue: 10 }
            after: { type: "String", defaultValue: "" }
        )
        @refetchable(queryName: "BlogListPaginationQuery") {
            blogs(first: $first, after: $after) 
                @connection(key: "BlogList_blogs")
            {
                edges {
                    node {
                        id
                        ...BlogListItem
                    }
                }
            }
        }
        `,
        blogs
    );

    return (
        <div>
            <ul>
                {data.blogs.edges?.map((edge) => (
                    <li key={edge?.node?.id}>
                        {edge?.node && <BlogListItem blog={edge.node} />}
                    </li>
                ))}
            </ul>
            {hasNext && (
                <div>
                    <button
                        onClick={async () => await loadNext(10)}
                    >
                        Load more
                    </button>
                </div>
            )}
        </div>
    );
}
