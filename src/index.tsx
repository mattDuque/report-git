import React from "react"
import { createRoot } from "react-dom/client"
import { RecoilRoot } from "recoil"
import { ThemeProvider } from "@mui/material/styles"
import { theme } from "./Styles"
import App from "./App"

const container = document.getElementById("root")
const root = createRoot(container)

root.render(
  <RecoilRoot>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </RecoilRoot>
)
