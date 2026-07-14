import React from "react";
import { createRoot } from "react-dom/client";
import TidepoolReef from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <TidepoolReef />
  </React.StrictMode>
);
