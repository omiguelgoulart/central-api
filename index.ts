import express from 'express'
import routesUsuarios from './routes/usuariosRoute'
import routesLogin from './routes/loginRoute'
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


app.get('/', (req, res) => {
  res.send('API central de torcedores!')
})

app.listen(port, () => {
  console.log(`Servidor rodando na porta: ${port}`)
})