import app from "./src/app";


const port = Number(process.env.PORT) || 3003;

async function startServer() {
  if (!process.env.VERCEL) {
    const { startLembreteVencimentoJob } = await import(
      "./src/emails/jobs/lembreteVencimento.job"
    );
    startLembreteVencimentoJob();
  }

  app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
  });
}

startServer();