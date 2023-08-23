import React from "react"
import {
  GridToolbarContainer,
  GridToolbarContainerProps,
} from "@mui/x-data-grid/components/containers"
import {
  GridExportMenuItemProps,
  GridToolbarColumnsButton,
  GridToolbarDensitySelector,
  GridToolbarExportContainer,
  GridToolbarFilterButton,
} from "@mui/x-data-grid/components/toolbar"
import { useGridApiContext } from "@mui/x-data-grid-premium"
import { Button, ButtonProps, MenuItem } from "@mui/material"
import { utils, writeFile } from "xlsx"
import { VscJson } from "react-icons/vsc/"
import { AiFillFileExcel } from "react-icons/ai/"
import { FaFileCsv } from "react-icons/fa/"
import { getJson, autoFitColumns } from "../util"
import { useNavigate } from "react-router-dom"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import { useRecoilValue } from "recoil"
import { issuesState } from "../atoms"
import { FilteredIssue } from "../../typings"

export default function CustomToolbar(props: GridToolbarContainerProps) {
  const navigate = useNavigate()
  const issues =
    useRecoilValue(issuesState) || (JSON.parse(localStorage.getItem("issues")) as FilteredIssue[])

  const exportBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()

    setTimeout(() => {
      URL.revokeObjectURL(url)
    })
  }
  const JsonExportMenuItem = (props: GridExportMenuItemProps<{}>) => {
    const apiRef = useGridApiContext()
    const { hideMenu } = props

    return (
      <MenuItem
        onClick={() => {
          const jsonString = getJson(apiRef, true, issues)
          const blob = new Blob([jsonString as string], {
            type: "text/json",
          })
          exportBlob(blob, "DataGrid_demo.json")
          hideMenu?.()
        }}
      >
        <VscJson style={{ marginRight: "6px" }} />
        JSON
      </MenuItem>
    )
  }

  const ExcelExportMenuItem = (props: GridExportMenuItemProps<{}>) => {
    const apiRef = useGridApiContext()
    const { hideMenu } = props

    const downloadExcel = (data: any) => {
      const workbook = utils.book_new()
      const worksheet = utils.json_to_sheet(data)
      const wscols = autoFitColumns(data, worksheet)
      worksheet["!cols"] = wscols
      utils.book_append_sheet(workbook, worksheet, "Sheet1")

      writeFile(workbook, "DataSheet.xlsx")
    }

    return (
      <MenuItem
        onClick={() => {
          const jsonString = getJson(apiRef, false, issues)
          downloadExcel(jsonString)
          hideMenu?.()
        }}
      >
        <AiFillFileExcel style={{ marginRight: "6px" }} />
        Excel
      </MenuItem>
    )
  }

  const CSVExportMenuItem = (props: GridExportMenuItemProps<{}>) => {
    const apiRef = useGridApiContext()
    const { hideMenu } = props

    const toCsv = (data: any[]) => {
      const headerKeys = Object.keys(data[0])
      const csv = data.map(row =>
        headerKeys
          .map(fieldName => JSON.stringify(row[fieldName] === 0 ? 0 : row[fieldName] ?? ""))
          .join(";")
      )
      csv.unshift(headerKeys.join(";"))
      const csvAsString = csv.join("\r\n")
      const blob = new Blob([csvAsString], {
        type: "text/csv",
      })
      exportBlob(blob, "DataGrid_demo.csv")
    }

    return (
      <MenuItem
        onClick={() => {
          const jsonString = getJson(apiRef, false, issues)
          toCsv(jsonString as Record<string, any>[])
          hideMenu?.()
        }}
      >
        <FaFileCsv style={{ marginRight: "6px" }} />
        CSV
      </MenuItem>
    )
  }

  const CustomExportButton = (props: ButtonProps) => (
    <GridToolbarExportContainer
      nonce={undefined}
      onResize={undefined}
      onResizeCapture={undefined}
      {...props}
    >
      <JsonExportMenuItem />
      <CSVExportMenuItem />
      <ExcelExportMenuItem />
    </GridToolbarExportContainer>
  )

  return (
    <GridToolbarContainer {...props} style={{ marginLeft: "12px" }}>
      <Button onClick={() => navigate("/")}>
        <ArrowBackIcon style={{ fontSize: "18px", marginRight: "6px " }} /> Voltar
      </Button>
      <GridToolbarColumnsButton
        nonce={undefined}
        onResize={undefined}
        onResizeCapture={undefined}
      />
      <GridToolbarFilterButton nonce={undefined} onResize={undefined} onResizeCapture={undefined} />
      <GridToolbarDensitySelector
        nonce={undefined}
        onResize={undefined}
        onResizeCapture={undefined}
      />
      <CustomExportButton />
    </GridToolbarContainer>
  )
}
