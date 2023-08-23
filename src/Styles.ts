import styled, { createGlobalStyle, keyframes, css } from "styled-components"
import { Card, Button, IconButton, ListItemButton, TextField } from "@mui/material"
import { createTheme } from "@mui/material/styles"
import { ptBR } from "@mui/x-data-grid"
import { Timeline } from "@mui/lab"

export const theme = createTheme(
  {
    typography: {
      fontFamily: ["Poppins", "sans-serif"].join(","),
    },
    palette: {
      mode: "dark",
      primary: {
        main: "#00a0c6",
      },
    },
  },
  ptBR
)

export const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: Poppins;
    src: url('./Poppins.ttf') format('truetype');
  }
  * {
  margin: 0;
  font-family: 
    'Poppins',
    'sans-serif';
  }
  body, html {
    background: #1b1e1f; 
  }
  ::-webkit-scrollbar {
    width: 20px;
  }
  ::-webkit-scrollbar-track {
    background-color: transparent;
  }
  ::-webkit-scrollbar-thumb {
    background-color: #d6dee1;
    border-radius: 20px;
    border: 6px solid transparent;
    background-clip: content-box;
  }
  ::-webkit-scrollbar-thumb:hover {
    background-color: #a8bbbf;
  }
`
export const Header = styled.div`
  height: 80px;
  display: flex;
  align-items: center;
  padding-left: 13vw;
  padding-right: 8vw;
  background-color: #202124;
  justify-content: space-between;
  position: fixed;
  left: 0;
  right: 0;
  margin-bottom: 10px;
  box-shadow: 2px 7px 4px 2px rgba(18, 20, 21, 0.7);
  img {
    vertical-align: middle;
  }
  @media (max-height: 768px) {
    height: 60px;
    .text {
      height: 49%;
    }
    .brand {
      height: 90%;
    }
  }
`
export const Body = styled.div`
  width: 100%;
  padding-top: 90px;
  height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  @media (max-height: 768px) {
    height: calc(100vh - 80px);
    padding-top: 70px;
  }
`
export const StyledCard = styled(Card)<{
  $large?: boolean
  $medium?: boolean
  $smpadding?: boolean
  $nopadding?: boolean
}>`
  display: flex;
  flex-direction: column;
  width: 22vw;
  ${props =>
    props.$large &&
    css`
      width: 98vw;
      height: 85vh;
    `}

  ${props =>
    props.$medium &&
    css`
      width: 75vw;
      height: 85vh;
    `}
  position: relative;
  padding: 32px;
  font-size: 18px;
  background-color: #181a1b;
  box-shadow: 2px 7px 4px 2px rgba(18, 20, 21, 0.7) !important;
  border-radius: 0.75rem !important;
  margin: 0 auto;
  border: 1px solid #444444;
  padding: ${props => props.$smpadding && "20px"} !important;
  padding: ${props => props.$nopadding && "0px"} !important;

  @media (max-height: 768px) {
    font-size: 14px;
  }
`
export const StyledButton = styled(Button)<{ $pesquisa?: boolean }>`
  height: 46px;
  font-size: 16px;
  color: white !important;
  text-transform: inherit !important;
  width: 100%;
  background: #00a0c6 !important;
  &:hover {
    background: #1caacc !important;
  }
  @media (max-height: 768px) {
    height: 38px;
    font-size: 12px;
    min-width: 0px !important;
  }
`
export const BackButton = styled(IconButton)`
  position: absolute !important;
  top: 16px;
  left: 16px;
`
const spin = keyframes`
  from {transform: rotate(0deg);}
  to {transform: rotate(360deg);}
`
export const Loading = styled.img`
  width: 5%;
  display: block;
  margin: auto;
  animation: ${spin} infinite 4s linear;
`
export const Message = styled.div<{ $error?: boolean }>`
  font-size: 14px;
  margin-top: 15px;
  border-radius: 4px;
  background-color: #242627;
  color: ${props => props.$error && "red"};
`
export const Grid = styled.div`
  height: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr ;
`
export const ChartLegend = styled.div`
  background-color: #242627;
  border-radius: 8px;
  padding: 16px;
  width: 100%;
`
export const Table = styled.div`
  height: auto;
  max-height: 27.5vh;
  background-color: #242627;
  border-radius: 8px;
  padding: 16px;
  width: 90%;
  display: flex;
  overflow: hidden;
  text-align: center;
  flex-direction: column;
  vertical-align: middle;
  * {
    vertical-align: middle;
  }

`
export const TableBody = styled.div`
  overflow-y: scroll;
`
export const TableRow = styled.div<{ $active: boolean }>`
  display: flex;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.25s ease;
  &:hover {
    background-color: #243134;
    transition: background-color 0.25s ease;
    ${props =>
      !props.$active &&
      css`
        div > svg {
          fill: #243134;
        }
      `}
  }
  div:first-child {
    width: 60%;
    text-align: left;
  }
  div:last-child {
    margin-left: auto;
    margin-right: 12px;
  }
`
export const TableCell = styled.div`
  padding-top: 5px;
  padding-bottom: 5px;

  svg {
    margin-right: 8px;
  }
`
export const StyledTimeline = styled(Timeline)`
  overflow: auto;
  height: auto;
  max-height: 70vh;
  @media (max-height: 768px) {
    height: auto;
    max-height: 50vh;
  }
`
export const StyledListItemButton = styled(ListItemButton)`
  font-size: 16px;
  height: 46px;
  margin: 15px 15px 15px 0px !important;
  padding-left: 300px;
  padding-right: 200px;
  text-transform: inherit !important;
  border-radius: .50rem !important;
  width: 100%;
  &:hover {
    background: #363636 !important;
  }
`

