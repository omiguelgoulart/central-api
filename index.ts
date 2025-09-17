import express from 'express'
import routesUsuarios from './routes/usuarios.route'

const app = express()
const port = 3003

app.use(express.json())


app.use("/usuarios", routesUsuarios)


app.get('/', (req, res) => {
  res.send('API central de torcedores!')
})

app.listen(port, () => {
  console.log(`Servidor rodando na porta: ${port}`)
})