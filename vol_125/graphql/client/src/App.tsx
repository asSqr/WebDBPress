import React from 'react';
import {
  RelayEnvironmentProvider
} from "react-relay";
import { Blogs } from './components/Blogs';
import {
  relayEnvironment
} from "./lib/relayEnvironment";

const App: React.VFC = () => (
  <RelayEnvironmentProvider
    environment={relayEnvironment}
  >
    <React.Suspense fallback="Loading...">
      <Blogs />
    </React.Suspense>
  </RelayEnvironmentProvider>
)

export default App;
