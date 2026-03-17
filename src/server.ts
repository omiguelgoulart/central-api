import app from "./app";

const port = 3003;

if (!process.env.VERCEL) {
  import("./emails/jobs/lembreteVencimento.job").then(
    ({ startLembreteVencimentoJob }) => {
      startLembreteVencimentoJob();
    }
  );
}

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});