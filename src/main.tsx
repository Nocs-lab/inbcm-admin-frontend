import React from "react"
import ReactDOM from "react-dom/client"

import App from "./App"

import "uno.css"
import "@unocss/reset/tailwind.css"
import "@govbr-ds/core/dist/core.css"
import "@fortawesome/fontawesome-free/css/all.css"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
