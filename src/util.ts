import { FilteredIssue, Issue, MergeRequest, Project, Commit } from "../typings"
import { axiosGit as axios } from "./axios"
import React from "react"
import {
  GridApi,
  gridFilteredSortedRowIdsSelector,
  gridVisibleColumnFieldsSelector,
} from "@mui/x-data-grid"
import replaceSpecialCharacters from "replace-special-characters"
var pixelWidth = require("string-pixel-width")

export const getDate = (date: string) => {
  if (!date) return ""
  const formatedDate = new Date(date)
  const finalDate = [
    formatedDate.getDate().toString().padStart(2, "0"),
    (formatedDate.getMonth() + 1).toString().padStart(2, "0"),
    formatedDate.getFullYear().toString().substring(2),
  ]
  return finalDate.join("/")
}

export const getTime = (date: string) => {
  if (!date) return ""
  const formatedDate = new Date(date)
  const finalDate = [
    formatedDate.getHours().toString().padStart(2, "0"),
    formatedDate.getMinutes().toString().padStart(2, "0"),
  ]
  return finalDate.join(":")
}

export const autoFitColumns = (json: any, worksheet: any) => {
  const jsonKeys = Object.keys(json[0])

  const objectMaxLength: any = []
  jsonKeys.forEach(key => {
    objectMaxLength.push(
      pixelWidth(key, {
        size: 2,
      })
    )
  })

  json.forEach((data: any, i: number) => {
    const value = json[i]
    jsonKeys.forEach((key, j) => {
      const l = value[jsonKeys[j]]
        ? pixelWidth(value[jsonKeys[j]], {
            size: 2,
          })
        : 0
      objectMaxLength[j] = objectMaxLength[j] >= l ? objectMaxLength[j] : l
    })
  })

  return objectMaxLength.map((w: any) => {
    return { width: w }
  })
}

export const getJson = (
  apiRef: React.MutableRefObject<GridApi>,
  csv: boolean,
  issues: FilteredIssue[]
) => {
  const filteredSortedRowIds = gridFilteredSortedRowIdsSelector(apiRef)
  const visibleColumnsField = gridVisibleColumnFieldsSelector(apiRef)

  const data = filteredSortedRowIds.map(id => {
    let row: Record<string, any> = {}

    visibleColumnsField.forEach(field => {
      if (field === "Responsáveis" || field === "Labels") {
        row[field] = apiRef.current.getCellParams(id, field).value.join(", ")
      } else row[field] = apiRef.current.getCellParams(id, field).value
      if (field === "Título") {
        issues.forEach(issue => {
          if (issue.Título === apiRef.current.getCellParams(id, "Título").value)
            row["URL"] = issue.URL
        })
      }
      if (field === "Data Inicial" || field === "Data Fim") {
        row[field] = getDate(apiRef.current.getCellParams(id, field).value)
      }
    })
    return row
  })
  if (csv) return JSON.stringify(data, null, 2)
  else return data
}

export async function getProjects(groupId: number) {
  const projects: { id: number; name: string }[] = []
  let currentPage = 1
  let totalPages = 0
  do {
    await axios
      .get(`/groups/${groupId}/projects/`, {
        params: { per_page: 100, page: currentPage++ },
      })
      .then(res => {
        totalPages = parseInt(res.headers["x-total-pages"]!)
        res.data.map((project: Project) => {
          if (groupId === 3) {
            if (project.id === 78) return
            if (project.id === 18) return
          }
          projects.push({ id: project.id, name: project.name })
        })
      })
      .catch(err => {
        console.log(err.code)
        console.log(err.message)
        console.log(err.stack)
      })
  } while (currentPage <= totalPages)
  return projects
}

export async function getProjectIssues(
  project: { id: number; name: string },
  minDate: Date,
  maxDate: Date,
  dateClosed: boolean
) {
  let totalPages = 0
  const url = `/projects/${project.id}/issues/`
  const filteredIssues: FilteredIssue[] = []

  const pushData = (issues: Issue[]) => {
    issues.map(issue => {
      const date = dateClosed ? new Date(issue.closed_at!) : new Date(issue.created_at!)
      if (date > minDate && date < maxDate) {
        filteredIssues.push({
          Sistema: project.name,
          IS: issue.iid.toString(),
          Cliente: issue.title.split(" - ")[0],
          Título: issue.title.split(" - ")[1],
          URL: issue.web_url,
          project_id: issue.project_id,
          Responsáveis: issue.assignees.map(assignee => {
            return assignee.name
          }),
          Labels: issue.labels,
          Status: issue.state.replace(/[a-z]{6}/, state => {
            return state === "opened" ? "Aberta" : "Fechada"
          }),
          "Data Inicial": issue.created_at,
          "Hora Inicial": getTime(issue.created_at),
          Validade: issue.due_date,
          "Data Fim": issue.closed_at,
          "Hora Fim": getTime(issue.closed_at),
        })
      }
    })
  }

  const pagesRequest: any = []
  await axios
    .get(url, {
      params: { per_page: 100, page: 1 },
    })
    .then(async (res: { headers: { [x: string]: string }; data: Issue[] }) => {
      totalPages = parseInt(res.headers["x-total-pages"]!)
      pushData(res.data)
      if (totalPages > 1) {
        let page = 2
        while (page <= totalPages) {
          pagesRequest.push(
            axios
              .get(url, {
                params: { per_page: 100, page: page },
              })
              .then((res: { data: Issue[] }) => {
                pushData(res.data)
                console.log(res.data[0])
              })
          )
          page++
        }
      }
      await Promise.all(pagesRequest)
    })
    .catch(err => {
      console.log(err.code)
      console.log(err.message)
      console.log(err.stack)
    })

  return filteredIssues
}

export async function getIssueCommits(projectId: string, issueId: string, isClosed: string) {
  let issueCommits: Commit[] = []

  if (isClosed) {
    let totalPages = 0
    const url = `projects/${projectId}/merge_requests/`
    let mergeRequestIid: number = null
    await axios
      .get(url, {
        params: { per_page: 100, page: 1 },
      })
      .then(async (res: { headers: { [x: string]: string }; data: MergeRequest[] }) => {
        totalPages = parseInt(res.headers["x-total-pages"]!)
        res.data.every(mr => {
          if (mr.title.includes(issueId)) {
            mergeRequestIid = mr.iid
            return false
          }
          return true
        })
        if (totalPages > 1 && !mergeRequestIid) {
          let page = 2
          while (page <= totalPages) {
            if (mergeRequestIid) break
            await axios
              .get(url, {
                params: { per_page: 100, page: page },
              })
              .then((res: { data: MergeRequest[] }) => {
                res.data.every(mr => {
                  if (mr.title.includes(issueId)) {
                    mergeRequestIid = mr.iid
                    return false
                  }
                  return true
                })
              })
            page++
          }
        }
        return mergeRequestIid
      })
      .then(async mergeRequestIid => {
        await axios
          .get(`/projects/${projectId}/merge_requests/${mergeRequestIid}/commits`)
          .then((res: { data: Commit[] }) => issueCommits.push(...res.data.reverse()))
      })
      .catch(err => {
        console.log(err.code)
        console.log(err.message)
        console.log(err.stack)
      })
  } else {
    await axios
      .get(`/projects/${projectId}/issues/${issueId}`)
      .then(res => {
        let branch = [issueId, res.data.title.toLowerCase().split(" - ")].flat()
        branch[2] = branch[2].split(" ")
        return replaceSpecialCharacters(branch.flat().join("-"))
      })
      .then(async branchName => {
        await axios
          .get(`/projects/${projectId}/repository/commits`, {
            params: { ref_name: branchName },
          })
          .then((res: { data: Commit[] }) => {
            issueCommits.push(
              ...res.data.reverse().filter((commit: any) => commit.title.includes(issueId))
            )
          })
      })
  }
  return issueCommits
}

export function workingHoursBetweenDates(startDate: string, endDate: string) {
  let minutesWorked = 0

  const start_date = new Date(startDate)
  const end_date = !endDate ? new Date() : new Date(endDate)

  if (endDate < startDate) {
    return 0
  }

  const current = start_date
  const workHoursStart = 8
  const workHoursEnd = 18

  while (current <= end_date) {
    if (
      current.getHours() >= workHoursStart &&
      current.getHours() < workHoursEnd &&
      current.getDay() !== 0 &&
      current.getDay() !== 6
    ) {
      minutesWorked++
    }
    current.setTime(current.getTime() + 1000 * 60)
  }

  return minutesWorked / 60
}

export function timeConvert(decimaltime: number) {
  var hrs = Math.floor(decimaltime)
  var min = Math.round((Number(decimaltime) - hrs) * 60)

  return hrs.toString().padStart(2, "0") + "h" + ":" + min.toString().padStart(2, "0") + "m"
}
