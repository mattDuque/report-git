import React from "react"
import { StyledCard } from "../Styles"
import { DataGrid, GridColDef, GridValueGetterParams } from "@mui/x-data-grid"
import { Navigate, useNavigate } from "react-router-dom"
import { AuthorStats } from "../../typings"
import CustomToolbar from "../components/CustomToolbar"
import LinkIcon from "@mui/icons-material/Link"

const column = new Map([
  ["id", { header: "Id", flex: 0.4 }],
  ["name", { header: "Nome", flex: 2 }],
  ["state", { header: "Status", flex: 0.5 }],
  ["avatar_url", { header: "Foto", flex: 0.5 }],
  ["totalDiffs", { header: "Total Commits", flex: 1 }],
  ["project_count", { header: "Total Projetos", flex: 1 }],
])

const noAvatar =
  "http://git.jallcard.com.br:9700/assets/no_avatar-849f9c04a3a0d0cea2424ae97b27447dc64a7dbfae83c036c45b403392f0e8ba.png"

const moveInArray = function (arr: any[], from: number, to: number) {
  const item = arr.splice(from, 1)
  arr.splice(to, 0, item[0])
}

export default function AuthorStats(props: { authorStats: AuthorStats[] }) {
  const navigate = useNavigate()
  const authorStats =
    (JSON.parse(localStorage.getItem("authorStats")) as AuthorStats[]) ||
    props.authorStats

  if (!authorStats) {
    return <Navigate to="/" />
  }

  console.log(authorStats)

  const columns: GridColDef[] = Object.keys(authorStats[0])
    .filter(
      value =>
        value !== "group_id" &&
        value !== "id" &&
        value !== "createdAt" &&
        value !== "updatedAt" &&
        value !== "username" &&
        value !== "web_url"
    )
    .map(header => {
      return {
        field: header,
        headerName: column.get(header).header,
        flex: column.get(header).flex,
        headerAlign: "center",
        align: "center",
        sortable: header === "avatar_url" ? false : true,
        renderCell: (params: GridValueGetterParams) => {
          if (header === "name")
            return (
              <a
                href={params.row.web_url}
                style={{ textDecoration: "none", color: "white" }}
                rel="noopener noreferrer"
                target="_blank"
                onClick={e => e.stopPropagation}
              >
                {params.row.name}
                <LinkIcon style={{ marginLeft: "3px", fontSize: "14px" }} />
              </a>
            )
          if (header === "avatar_url")
            return (
              <img
                src={params.row.avatar_url ? params.row.avatar_url : noAvatar}
                alt=""
                style={{
                  height: "55px",
                  borderRadius: "999px",
                  border: "1px solid #515151",
                  margin: "4px 0",
                }}
              />
            )
          if (header === "state")
            return <div>{params.row.status === "blocked" ? "Bloqueado" : "Ativo"}</div>
        },
      }
    })
  moveInArray(columns, 2, 0)
  const rows = authorStats

  return (
    <StyledCard $nopadding style={{ width: "50vw", height: "70vh" }}>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={20}
        rowsPerPageOptions={[20]}
        isRowSelectable={() => false}
        components={{
          Toolbar: CustomToolbar,
        }}
        getRowClassName={params => {
          let classes = ""
          if (params.indexRelativeToCurrentPage % 2 === 0) classes = classes + "even "
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
