import React, { lazy, Suspense } from "react"
import { GlobalStyle, Header, Body, Loading } from "./Styles"
import { Routes, Route, BrowserRouter } from "react-router-dom"
import brand from "./img/brand.png"
import text from "./img/text.png"
import { useRecoilValue } from "recoil"
import { authorStatsState, issuesState } from "./atoms"
const RequestForm = lazy(() => import("./pages/RequestForm"))
const CustomDataGrid = lazy(() => import("./pages/CustomDataGrid"))
const IssueHistory = lazy(() => import("./pages/IssueHistory"))
const AuthorStats = lazy(() => import("./pages/AuthorStats"))

export default function App() {
  const issues = useRecoilValue(issuesState)
  const authorStats = useRecoilValue(authorStatsState)

  return (
    <div className="app">
      <GlobalStyle />
      <Header>
        <img src={brand} alt="" className="brand" />
        <img src={text} alt="" className="text" />
      </Header>
      <Body>
        <BrowserRouter>
          <Routes>
            <Route
              path="tabela-is"
              element={
                <Suspense fallback={<Loading />}>
                  <CustomDataGrid issues={issues} />
                </Suspense>
              }
            />
            <Route
              path="stats-colaboradores"
              element={
                <Suspense fallback={<Loading />}>
                  <AuthorStats authorStats={authorStats} />
                </Suspense>
              }
            />
            <Route
              path="historico/:id/:iid"
              element={
                <Suspense fallback={<Loading />}>
                  <IssueHistory />
                </Suspense>
              }
            />
            <Route
              path="historico/:id/"
              element={
                <Suspense fallback={<Loading />}>
                  <IssueHistory />
                </Suspense>
              }
            />
            <Route
              path="historico/"
              element={
                <Suspense fallback={<Loading />}>
                  <IssueHistory />
                </Suspense>
              }
            />
            <Route
              index
              element={
                <Suspense fallback={<Loading />}>
                  <RequestForm />
                </Suspense>
              }
            />
          </Routes>
        </BrowserRouter>
      </Body>
    </div>
  )
}
