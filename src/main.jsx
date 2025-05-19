import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { createRoot } from "react-dom/client";

import "./index.css";

import { StrictMode } from "react";
import "react-calendar/dist/Calendar.css";

import { Wrapper } from "./Wrapper.jsx";
import App from "./App.jsx";

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Wrapper heading="Net Revenue">
      <App></App>
    </Wrapper>
  </StrictMode>
);
