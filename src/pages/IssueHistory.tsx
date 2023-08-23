import React, { useEffect, useState } from "react"
import { PieChart } from "react-minimal-pie-chart"
import { useNavigate, useParams } from "react-router-dom"
import { LabelResponse, LabelData, Issue, Commit } from "../../typings"
import { axiosGit as axios } from "../axios"
import {
  BackButton,
  Grid,
  Loading,
  StyledCard,
  StyledTimeline,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "../Styles"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import { getDate, getIssueCommits, getTime, timeConvert, workingHoursBetweenDates } from "../util"
import CircleIcon from "@mui/icons-material/Circle"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import Tooltip from "@mui/material/Tooltip"
import TimelineItem, { timelineItemClasses } from "@mui/lab/TimelineItem"
import TimelineSeparator from "@mui/lab/TimelineSeparator"
import TimelineConnector from "@mui/lab/TimelineConnector"
import TimelineContent from "@mui/lab/TimelineContent"
import TimelineDot from "@mui/lab/TimelineDot"
import logo from "../img/logo.png"
import { Accordion, AccordionSummary } from "@mui/material"
import AccordionDetails from "@mui/material/AccordionDetails"
import { Timeline } from "@mui/lab"

const excluded = [
  "🐞 BUG",
  "Pronto",
  "🔥 Produção Parada",
  "😰 War Room",
  "Em análise",
  "Melhoria",
  "👍 Homologado",
  "🔥 Urgente",
  "⚠ IS Alterada",
]

export default function IssueHistory() {
  const { id, iid } = useParams()
  const navigate = useNavigate()
  const [responseData, setResponseData] = useState<LabelResponse[]>(null)
  const [chartData, setChartData] = useState<LabelData[]>(null)
  const [closed, setClosed] = useState<{ closed_at: string; closed_by: string }>(null)
  const [totalHours, setTotalHours] = useState(0)
  const [chartKey, setChartKey] = useState(0)
  const [issueTitle, setIssueTitle] = useState<string>(null)
  const [issueCommits, setIssueCommits] = useState<Commit[]>(null)
  const [error, setError] = useState({ error: false, message: null })
  const [expanded, setExpanded] = useState<string | false>(false)

  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false)
    }

  const handleClick = (item: LabelData) => {
    item.active = !item.active
    if (!item.active) {
      setTotalHours(totalHours - item.label_hours)
    } else {
      setTotalHours(totalHours + item.label_hours)
    }
  }

  const goBack = () => {
    if (localStorage.getItem("issues")) navigate("/tabela")
    else navigate("/home")
  }

  useEffect(() => {
    if (chartData) {
      const newData = chartData.map(item => {
        if (item.active) {
          return {
            ...item,
            percent_hours: Math.round((item.label_hours / totalHours) * 1000) / 10,
          }
        } else return item
      })
      setChartData(newData)
    }
    setChartKey(chartKey + 1)
  }, [totalHours])

  useEffect(() => {
    let labelEvents: LabelData[] = []
    let totalHours: number = 0

    if (!id || !iid) {
      goBack()
    }
    if (!closed) {
      axios
        .get(`/projects/${id}/issues/${iid}`)
        .then(res => {
          setClosed({
            closed_at: res.data.closed_at,
            closed_by: res.data.closed_by,
          })
        })
        .catch(err => {
          setError({ error: true, message: err.message })
          console.log(err.message)
        })
    } else {
      axios
        .get(`/projects/${id}/issues/${iid}`)
        .then((res: { data: Issue }) => setIssueTitle(res.data.title))
      axios
        .get(`/projects/${id}/issues/${iid}/resource_label_events`)
        .then(res => {
          setResponseData(res.data)
          let labels: string[] = res.data
            .map((item: LabelResponse) => {
              const name = item.label ? item.label.name : ""
              return name
            })
            .sort()
            .filter(function (item: string, pos: number, ary: string[]) {
              return !pos || item != ary[pos - 1]
            })

          labels.map((label, i) => {
            labelEvents.push({
              label_name: label,
              events: [],
              color: null,
              label_hours: null,
              percent_hours: null,
              active: true,
            })

            let labelActions: any = []

            res.data.map((item: LabelResponse) => {
              const name = item.label ? item.label.name : ""
              const color = item.label
                ? item.label.color
                : "#" + Math.floor(Math.random() * 16777215).toString(16)

              if (name === label) {
                labelActions.push({
                  action: item.action,
                  created_at: item.created_at,
                  user_name: item.user.name,
                })
                labelEvents[i].color = color
              }
            })

            let actionPairs = []

            while (labelActions.length > 0) actionPairs.push(labelActions.splice(0, 2))
            actionPairs.map((pair: any) => {
              labelEvents[i].events.push({
                added_date: pair[0].created_at,
                added_by: pair[0].user_name,
                removed_date: pair[1]?.created_at,
                removed_by: pair[1]?.user_name,
                event_hours: workingHoursBetweenDates(
                  pair[0].created_at,
                  pair[1]?.created_at ? pair[1]?.created_at : closed.closed_at
                ),
              })
            })

            labelEvents[i].label_hours = labelEvents[i].events
              .map((event: any) => {
                return event.event_hours
              })
              .reduce((partialSum: number, a: number) => partialSum + a, 0)

            if (excluded.includes(labelEvents[i].label_name)) {
              labelEvents[i].active = false
            }
            if (labelEvents[i].active) totalHours += labelEvents[i].label_hours
          })

          labelEvents.map(event => {
            if (event.active)
              event.percent_hours =
                Math.round((event.label_hours / totalHours) * 1000) / 10
          })

          setChartData(labelEvents)
          setTotalHours(totalHours)
        })
        .catch(err => {
          setError({ error: true, message: err.message })
          console.log(err.message)
        })
      getIssueCommits(id, iid, closed.closed_at).then(issueCommits =>
        setIssueCommits(issueCommits)
      )
    }
  }, [closed])

  return (
    <StyledCard $medium $smpadding>
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        {issueTitle && (
          <>
            {iid} - {issueTitle}
          </>
        )}
      </div>
      {chartData ? (
        <Grid>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <PieChart
              data={chartData
                .filter(item => item.active === true)
                .map((item, i) => {
                  return {
                    title: item.label_name,
                    value: item.label_hours,
                    color: item.color,
                  }
                })}
              key={chartKey}
              style={{ height: "35%", marginBottom: "16px" }}
              animate
              animationDuration={500}
              labelPosition={50}
              label={({ x, y, dx, dy, dataEntry }) => (
                <text
                  x={x}
                  y={y}
                  dx={dx}
                  dy={dy}
                  dominantBaseline="central"
                  textAnchor="middle"
                  style={{
                    fontSize: "5px",
                    fontFamily: "Poppins",
                    fill: dataEntry.color,
                  }}
                >
                  {Math.round(dataEntry.percentage) + "%"}
                </text>
              )}
              animationEasing="ease-out"
              lineWidth={35}
            />
            <Table>
              <TableBody>
                {chartData.map(item => (
                  <TableRow
                    $active={item.active}
                    key={item.label_name + chartKey}
                    onClick={() => handleClick(item)}
                    style={{ textDecoration: `${item.active ? "none" : "line-through"}` }}
                  >
                    <TableCell>
                      <CircleIcon
                        style={{
                          color: `${item.active ? item.color : "#242627"}`,
                          marginRight: "4px",
                        }}
                      />
                      <span>{item.label_name}</span>
                    </TableCell>
                    <TableCell>{timeConvert(item.label_hours)}</TableCell>
                    <TableCell>{item.percent_hours}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div>
            <Accordion expanded={expanded === "labels"} onChange={handleChange("labels")}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                Histórico de Labels
              </AccordionSummary>
              <AccordionDetails style={{ backgroundColor: "#242627" }}>
                <StyledTimeline
                  position="alternate"
                  nonce={undefined}
                  onResize={undefined}
                  onResizeCapture={undefined}
                >
                  {responseData.map(item => (
                    <TimelineItem key={item.id}>
                      <TimelineSeparator>
                        <TimelineDot
                          style={{
                            backgroundColor: `${
                              item.action === "add" ? item.label.color : "none"
                            }`,
                            borderColor: item.label.color,
                            height: "8px",
                            width: "8px",
                          }}
                          variant={`${item.action === "add" ? "filled" : "outlined"}`}
                        />
                        <TimelineConnector
                          style={{
                            backgroundColor: item.label.color,
                          }}
                        />
                      </TimelineSeparator>
                      <Tooltip title={item.action === "add" ? "Adicionado" : "Removido"}>
                        <TimelineContent>
                          <h4>{item.label.name}</h4>
                          <p>
                            {getDate(item.created_at)} {getTime(item.created_at)}
                          </p>
                          <p>{item.user.name}</p>
                        </TimelineContent>
                      </Tooltip>
                    </TimelineItem>
                  ))}
                </StyledTimeline>
              </AccordionDetails>
            </Accordion>
            <Accordion
              expanded={expanded === "commits"}
              onChange={handleChange("commits")}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                Histórico de Commits
              </AccordionSummary>
              <AccordionDetails style={{ backgroundColor: "#242627" }}>
                <StyledTimeline
                  sx={{
                    [`& .${timelineItemClasses.root}:before`]: {
                      flex: 0,
                      padding: 0,
                    },
                  }}
                  nonce={undefined}
                  onResize={undefined}
                  onResizeCapture={undefined}
                >
                  {issueCommits?.map(item => (
                    <TimelineItem key={item.id}>
                      <TimelineSeparator>
                        <TimelineDot
                          style={{
                            height: "8px",
                            width: "8px",
                          }}
                          variant="filled"
                        />
                        <TimelineConnector />
                      </TimelineSeparator>
                      <TimelineContent>
                        <h4
                          style={{
                            width: "27vw",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          <a
                            href={item.web_url}
                            rel="noopener noreferrer"
                            target="_blank"
                            style={{ textDecoration: "none", color: "inherit" }}
                          >
                            {item.title}
                          </a>
                        </h4>
                        <p>
                          {getDate(item.created_at)} {getTime(item.created_at)}
                        </p>
                        <p>{item.author_name}</p>
                      </TimelineContent>
                    </TimelineItem>
                  ))}
                </StyledTimeline>
              </AccordionDetails>
            </Accordion>
          </div>
        </Grid>
      ) : error.error ? (
        <div style={{ margin: "0 30px" }}>{error.message}</div>
      ) : (
        <Loading src={logo} alt="" />
      )}
      <BackButton onClick={goBack}>
        <ArrowBackIcon />
      </BackButton>
    </StyledCard>
  )
}
