import React, { useState } from "react"
import { axiosDb as axios } from "../axios"
import { Dayjs } from "dayjs"
import { yupResolver } from "@hookform/resolvers/yup"
import { InputLabel, MenuItem, Select, TextField } from "@mui/material"
import FormControl from "@mui/material/FormControl"
import FormHelperText from "@mui/material/FormHelperText"
import Checkbox from "@mui/material/Checkbox"
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import { useForm } from "react-hook-form"
import { ApiRequest, AuthorStats, FilteredIssue, TotalDiffs } from "../../typings"
import { Message, Loading, StyledButton, StyledCard } from "../Styles"
import { requestSchema } from "../yup/schemas"
import { getProjectIssues, getProjects } from "../util"
import { useNavigate } from "react-router-dom"
import { issuesState, authorStatsState } from "../atoms"
import { useRecoilState } from "recoil"
import logo from "../img/logo.png"

function addTotalDiffs(
  committers: { committer_name: string; totalDiffs: string }[],
  users: AuthorStats[]
) {
  return users.map(user => {
    const matchingCommitters = committers.filter(committer => {
      const userWords = user.name.split(" ")
      const committerWords = committer.committer_name.split(" ")
      let matchingWordCount = 0
      for (const userWord of userWords) {
        for (const committerWord of committerWords) {
          if (userWord.toLowerCase() === committerWord.toLowerCase()) {
            matchingWordCount++
            if (matchingWordCount >= 2) {
              break
            }
          }
        }
      }
      return matchingWordCount >= Math.min(2, userWords.length, committerWords.length)
    })
    let totalDiffs = 0
    if (matchingCommitters.length > 0) {
      totalDiffs = matchingCommitters.reduce(
        (total, committer) => total + parseInt(committer.totalDiffs),
        0
      )
    }
    return {
      ...user,
      totalDiffs: totalDiffs.toString(),
    }
  })
}

export default function RequestForm() {
  const navigate = useNavigate()
  const [id, setId] = useState<ApiRequest["id"]>(0)
  const [endpoint, setEndpoint] = useState<ApiRequest["endpoint"]>(0)
  const [minDate, setMinDate] = useState<Date>(null)
  const [maxDate, setMaxDate] = useState<Date>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setEror] = useState<boolean>(false)
  const [issues, setIssues] = useRecoilState(issuesState)
  const [authorStats, setAuthorStats] = useRecoilState(authorStatsState)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ApiRequest>({
    resolver: yupResolver(requestSchema),
  })

  const menuItems = [
    { value: 0, label: "Selecione..." },
    { value: 3, label: "Desenvolvimento" },
    { value: 78, label: "Atendimento" },
    { value: 17, label: "Processos" },
    { value: 193, label: "CMO-Producao" },
  ]

  const onSubmit = async ({ id, dateClosed, endpoint }: ApiRequest) => {
    const min_date = minDate ? minDate : new Date(-8640000000000000)
    const max_date = maxDate ? maxDate : new Date(8640000000000000)

    console.log(endpoint)
    setLoading(true)
    if (endpoint === 1) {
      getProjects(id).then(projects => {
        const promises: Promise<FilteredIssue[]>[] = []
        projects.forEach(project => {
          promises.push(getProjectIssues(project, min_date, max_date, dateClosed))
        })
        Promise.all(promises).then(res => {
          if (res.flat().length > 0) {
            setIssues(res.flat())
            localStorage.setItem("issues", JSON.stringify(res.flat()))
            setLoading(false)
            navigate("/tabela-is")
          } else {
            setLoading(false)
            setEror(true)
          }
          reset()
        })
      })
    } else {
      axios.get("/getAuthors", { params: { group_id: id } }).then(
        res => {
          const authors = res.data
          if (res.data.length > 0) {
            axios
              .get("/getCommitsByCommitterName", {
                params: { group_id: id, start_date: minDate, end_date: maxDate },
              })
              .then(async res => {
                const newStats = addTotalDiffs(res.data, authors).map(async stat => {
                  const project_count = await axios.get("/getMergeRequestsByAuthor", {
                    params: {
                      author_id: stat.id,
                      start_date: minDate,
                      end_date: maxDate,
                    },
                  })
                  return { ...stat, project_count: project_count.data }
                })
                console.log(newStats)
                const resolvedNewStats = await Promise.all(newStats)
                setAuthorStats(resolvedNewStats)
                localStorage.setItem("authorStats", JSON.stringify(resolvedNewStats))
                setLoading(false)
                navigate("/stats-colaboradores")
              })
          } else {
            setLoading(false)
            setEror(true)
          }
        },
        err => {
          console.log(err)
        }
      )
    }
  }

  return (
    <>
      {loading ? (
        <Loading src={logo} alt="" />
      ) : (
        <StyledCard>
          <p style={{ marginBottom: "12px" }}>
            Olá, selecione o departamento e datas desejadas
          </p>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FormControl style={{ width: "100%", marginBottom: "18px" }}>
              <InputLabel id="medidas-label">Tipo de Relatório</InputLabel>
              <Select
                {...register("endpoint")}
                name="endpoint"
                labelId="endpoint-label"
                label="Tipo de Relatório"
                id="endpoint"
                size={`${window.innerWidth < 1920 ? "small" : "medium"}`}
                error={errors?.endpoint && true}
                value={endpoint}
                onChange={(endpoint: React.ChangeEvent<HTMLInputElement>) => {
                  setEndpoint(parseInt(endpoint.target.value))
                }}
              >
                <MenuItem value={0}>Selecione...</MenuItem>
                <MenuItem value={1}>Relatórios IS</MenuItem>
                <MenuItem value={2}>Estatisticas Colaboradores</MenuItem>
              </Select>
              <FormHelperText error>{errors.id?.message.toString()}</FormHelperText>
            </FormControl>

            <FormControl style={{ width: "100%" }}>
              <InputLabel id="medidas-label">Grupo</InputLabel>
              <Select
                {...register("id")}
                name="id"
                labelId="id-label"
                label="Grupo"
                id="id"
                size={`${window.innerWidth < 1920 ? "small" : "medium"}`}
                error={errors?.id && true}
                value={id}
                onChange={(id: React.ChangeEvent<HTMLInputElement>) => {
                  setId(parseInt(id.target.value))
                }}
              >
                {menuItems
                  .filter(
                    item => (item.value !== 17 && item.value !== 193) || endpoint !== 2
                  )
                  .map(item => (
                    <MenuItem value={item.value} key={item.value}>
                      {item.label}
                    </MenuItem>
                  ))}
              </Select>
              <FormHelperText error>{errors.id?.message.toString()}</FormHelperText>
            </FormControl>
            {endpoint === 1 ? (
              <div style={{ display: "flex", alignItems: "center" }}>
                <Checkbox {...register("dateClosed")} />
                <span>Pesquisar pela data de fechamento</span>
              </div>
            ) : (
              <div style={{ marginBottom: "18px" }}></div>
            )}
            <FormControl style={{ width: "100%" }}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DesktopDatePicker
                  label="Data mínima"
                  inputFormat="DD/MM/YYYY"
                  renderInput={params => (
                    <TextField
                      {...params}
                      {...register("minDate")}
                      error={errors?.minDate && true}
                      size={`${window.innerWidth < 1920 ? "small" : "medium"}`}
                      helperText={errors.minDate?.message}
                      style={{ marginBottom: "18px" }}
                    />
                  )}
                  value={minDate}
                  onChange={(date: Dayjs | null) => {
                    setMinDate(date.toDate())
                  }}
                />
                <DesktopDatePicker
                  label="Data máxima"
                  inputFormat="DD/MM/YYYY"
                  renderInput={params => (
                    <TextField
                      {...params}
                      {...register("maxDate")}
                      error={errors?.maxDate && true}
                      size={`${window.innerWidth < 1920 ? "small" : "medium"}`}
                      helperText={errors.maxDate?.message}
                      style={{ marginBottom: "18px" }}
                    />
                  )}
                  value={maxDate}
                  onChange={(date: Dayjs | null) => {
                    setMaxDate(date.toDate())
                  }}
                />
              </LocalizationProvider>
            </FormControl>
            <StyledButton color="inherit" type="submit" id="enviar">
              Enviar
            </StyledButton>
          </form>
          <Message $error={error}>
            {error ? (
              "Ocorreu um erro, cheque sua conexão e tente novamente"
            ) : (
              <div style={{ padding: "8px" }}>
                <span>* Ambas as datas são opcionais</span>
                <br />
                <span>* O padrão de pesquisa é pela data de abertura</span>
              </div>
            )}
          </Message>
        </StyledCard>
      )}
    </>
  )
}
