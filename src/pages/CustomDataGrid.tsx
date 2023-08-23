import React from "react"
import { v4 as uuidv4 } from "uuid"
import { StyledCard } from "../Styles"
import { DataGrid, GridColDef, GridValueGetterParams } from "@mui/x-data-grid"
import { FilteredIssue } from "../../typings"
import { Navigate, useNavigate } from "react-router-dom"
import LinkIcon from "@mui/icons-material/Link"
import CustomToolbar from "../components/CustomToolbar"
import { getDate } from "../util"

const flex = new Map([
  ["Sistema", 1.2],
  ["IS", 0.5],
  ["Cliente", 1],
  ["Título", 5],
  ["Responsáveis", 2],
  ["Labels", 2],
  ["Status", 1.2],
  ["Data Inicial", 1],
  ["Hora Inicial", 1],
  ["Validade", 1],
  ["Data Fim", 1],
  ["Hora Fim", 1],
])

export default function CustomDataGrid(props: { issues: FilteredIssue[] }) {
  const navigate = useNavigate()
  const issues = (JSON.parse(localStorage.getItem("issues")) as FilteredIssue[]) || props.issues

  if (!issues) {
    return <Navigate to="/" />
  }
  const columns: GridColDef[] = Object.keys(issues[0])
    .filter(value => value !== "URL" && value !== "project_id")
    .map(header => {
      return {
        field: header,
        hideable: header === "Título" ? false : true,
        headerName: header,
        flex: flex.get(header),
        headerAlign: "center",
        align:
          header === "Responsáveis" || header === "Labels" || header === "Título"
            ? "left"
            : "center",
        sortable:
          header === "Responsáveis" ||
          header === "Labels" ||
          header === "Hora Inicial" ||
          header === "Hora Fim"
            ? false
            : true,
        renderCell: (params: GridValueGetterParams) => {
          if (header === "IS")
            return (
              <a
                href={params.row.URL}
                style={{ textDecoration: "none", color: "white" }}
                rel="noopener noreferrer"
                target="_blank"
                onClick={e => e.stopPropagation}
              >
                {params.row.IS}
                <LinkIcon style={{ marginLeft: "3px", fontSize: "14px" }} />
              </a>
            )
          if (header === "Responsáveis")
            return (
              <div style={{ margin: "5px 0" }}>
                {params.row.Responsáveis.map((responsavel: any, index: number) => (
                  <p key={responsavel}>
                    {responsavel + (index != params.row.Responsáveis.length - 1 ? "," : "")}
                  </p>
                ))}
              </div>
            )
          if (header === "Labels")
            return (
              <div style={{ margin: "5px 0" }}>
                {params.row.Labels.map((label: any, index: number) => (
                  <p key={label} style={{whiteSpace: "nowrap",overflow: "hidden",textOverflow: "ellipsis",  }}>
                    {label + (index != params.row.Labels.length - 1 ? "," : "")}
                  </p>
                ))}
              </div>
            )
          if (header === "Data Inicial") return getDate(params.row["Data Inicial"])
          if (header === "Validade") return getDate(params.row.Validade)
          if (header === "Data Fim") return getDate(params.row["Data Fim"])
        },
      }
    })

  const rows = issues.map(issue => {
    return { id: uuidv4(), ...issue }
  })

  return (
    <StyledCard $large $nopadding>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={20}
        rowsPerPageOptions={[20]}
        isRowSelectable={() => false}
        components={{
          Toolbar: CustomToolbar,
        }}
        onRowClick={params => {
          if (params.row.Labels.length > 0) {
            navigate(`/historico/${params.row.project_id}/${params.row.IS}`)
          }
        }}
        getRowClassName={params => {
          let classes = ""
          if (params.indexRelativeToCurrentPage % 2 === 0) classes = classes + "even "
          if (params.row.Labels.length > 0) classes = classes + "pointer"
          return classes
        }}
        sx={{
          ".MuiDataGrid-columnSeparator": {
            display: "none",
          },
          "&.MuiDataGrid-root": {
            border: "none",
          },
          ".even": {
            background: "#3b3b3b",
          },
          ".pointer": {
            cursor: "pointer",
          },
          "& .MuiDataGrid-renderingZone": {
            maxHeight: "none !important",
          },
          "& .MuiDataGrid-cell": {
            lineHeight: "unset !important",
            maxHeight: "none !important",
            whiteSpace: "normal",
          },
          "& .MuiDataGrid-row": {
            maxHeight: "none !important",
          },
          "& .MuiDataGrid-columnHeaders": {
            borderBottom: "3px solid #00a0c6",
            zIndex: 10,
          },
          "& .MuiDataGrid-cell:focus-within, & .MuiDataGrid-cell:focus": {
            outline: "none",
          },
        }}
      />
    </StyledCard>
  )
}
