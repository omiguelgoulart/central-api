import express from 'express'
import routesUsuarios from './src/routes/torcedor/usuariosRoute';
import routesLogin from './src/routes/torcedor/loginRoute';
import routesPlanos from './src/routes/plano/planosRoute';
import routesAssinatura from './src/routes/pagamento/assinaturaRoute';
import routesFatura from './src/routes/pagamento/faturaRoute';
import routesPagamento from './src/routes/pagamento/pagamentoRoute';
import asaasRoutes from './src/routes/asaas/asaasRoutes';
import asaasWebhook from './src/routes/asaas/webhooksAsaas';

import routesSetor from './src/routes/ADMIN/estadio/setorRoute';
import routesIngresso from './src/routes/ADMIN/jogo/ingressoRoute';
import routesJogo from './src/routes/ADMIN/jogo/jogoRoute';
import routesJogoSetor from './src/routes/ADMIN/jogo/jogoSetorRoute';
import routesLote from './src/routes/ADMIN/jogo/loteRoute';

import cors from 'cors'

const app = express()
const port = 3003
app.use(express.json());

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
app.use("/pagamento", routesPagamento)
app.use("/asaas", asaasRoutes);
app.use(asaasWebhook);

//ADMIN
app.use("/admin/setor", routesSetor)
app.use("/admin/ingresso", routesIngresso)
app.use("/admin/jogo", routesJogo)
app.use("/admin/jogoSetor", routesJogoSetor)
app.use("/admin/lote", routesLote)

app.get('/', (req, res) => {
  res.send('API central de torcedores!')
})

app.listen(port, () => {
  console.log(`Servidor rodando na porta: ${port}`)
})