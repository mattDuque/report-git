import * as yup from "yup"

export const requestSchema = yup.object().shape({
  id: yup.number().min(1, "Selecione o grupo").required(),
  endpoint: yup.number().min(1, "Selecione o grupo").required(),
  dateClosed: yup.boolean(),
  minDate: yup.string(),
  maxDate: yup.string(),
})
