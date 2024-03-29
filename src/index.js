import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import UIProvider, { UIContext } from "./contexts/UIProvider/UIProvider";
import UserProvider from "./contexts/UserProvider/UserProvider";

const root = ReactDOM.createRoot(document.getElementById("root"));
// Create a client
const queryClient = new QueryClient();
root.render(
  <QueryClientProvider client={queryClient}>
    <UserProvider>
      <UIProvider>
        <App />
      </UIProvider>
    </UserProvider>
  </QueryClientProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
