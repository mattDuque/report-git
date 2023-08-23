import { atom } from "recoil"
import { AuthorStats, FilteredIssue } from "../typings"

export const issuesState = atom<FilteredIssue[]>({
  key: "issues",
  default: null,
})

export const authorStatsState = atom<AuthorStats[]>({
  key: "devStats",
  default: null,
})
