import axios from "axios"

export const axiosGit = axios.create({
  baseURL: `http://${window._env_.ENDERECO_GIT}/api/v4`,
  headers: {
    Authorization: "Bearer --token--",
  },
})

export const axiosDb = axios.create({
  baseURL: `http://${window._env_.ENDERECO_DB}/`
})
