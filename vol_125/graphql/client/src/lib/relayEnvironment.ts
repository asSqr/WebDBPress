import {
    Environment,
    FetchFunction,
    Network,
    RecordSource,
    Store,
} from "relay-runtime";

const fetchRelay: FetchFunction = async (params, variables) => {
    const response = await fetch("/graphql", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            query: params.text,
            variables,
        }),
    });

    return await response.json()
}

export const relayEnvironment = new Environment({
    network: Network.create(fetchRelay),
    store: new Store(new RecordSource()),
});
