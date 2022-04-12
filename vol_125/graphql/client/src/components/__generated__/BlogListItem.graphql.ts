/**
 * @generated SignedSource<<1f891b462da9c26bdae4f2009a9d2ae7>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type BlogListItem$data = {
  readonly name: string;
  readonly " $fragmentType": "BlogListItem";
};
export type BlogListItem$key = {
  readonly " $data"?: BlogListItem$data;
  readonly " $fragmentSpreads": FragmentRefs<"BlogListItem">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "BlogListItem",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    }
  ],
  "type": "Blog",
  "abstractKey": null
};

(node as any).hash = "2c1df6dbf7f94c604bf1d97f744e0223";

export default node;
