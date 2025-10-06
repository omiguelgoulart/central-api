import express from 'express'
import routesUsuarios from './routes/usuariosRoute'
import routesLogin from './routes/loginRoute'
import routesPlanos from './routes/planosRoute'
import routesAssinatura from './routes/assinaturaRoute'
import routesFatura from './routes/faturaRoute'

import cors from 'cors'


const app = express()
const port = 3003

app.use(cors(
  {
    origin: '*'
  }
))
app.use(express.json())


app.use("/usuario", routesUsuarios)
app.use("/login", routesLogin)
app.use("/planos", routesPlanos)
app.use("/assinatura", routesAssinatura)
app.use("/fatura", routesFatura)


app.get('/', (req, res) => {
  res.send('API central de torcedores!')
})

app.listen(port, () => {
  console.log(`Servidor rodando na porta: ${port}`)
})