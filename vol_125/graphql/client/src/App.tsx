import React from 'react';
import {
  RelayEnvironmentProvider
} from "react-relay";
import {
  relayEnvironment
} from "./lib/relayEnvironment";

const App: React.VFC = () => (
  <RelayEnvironmentProvider
    environment={relayEnvironment}
  >
    <React.Suspense fallback="Loading...">
      
    </React.Suspense>
  </RelayEnvironmentProvider>
)

export default App;
