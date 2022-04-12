import graphql from "babel-plugin-relay/macro";
import React from "react";
import { useFragment } from "react-relay";
import type {
    BlogListItem$key
} from "./__generated__/BlogListItem.graphql";

interface Props {
    blog: BlogListItem$key;
}

export const BlogListItem: React.VFC<Props> = ({ blog }) => {
    const { name } = useFragment(
        graphql`
            fragment BlogListItem on Blog {
                name
            }
        `,
        blog
    );

    return <div>{name}</div>
}
