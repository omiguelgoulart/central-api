import { PrismaClient, Periodicidade, StatusIngresso } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed...");

  /* 1️⃣ ADMIN */
  const senhaHash = await hash("admin123!", 8);
  const admin = await prisma.admin.upsert({
    where: { email: "admin@brasildt.com" },
    update: {},
    create: {
      nome: "Administrador",
      email: "admin@brasildt.com",
      senha: senhaHash,
    },
  });

  /* 2️⃣ PLANOS */
  await prisma.plano.createMany({
    data: [
      {
        nome: "Torcedor",
        valor: new Decimal("19.90"),
        periodicidade: Periodicidade.MENSAL,
        descricao: "Plano de entrada com benefícios digitais exclusivos.",
        isFeatured: false,
        ordem: 1,
      },
      {
        nome: "Arquibancada",
        valor: new Decimal("39.90"),
        periodicidade: Periodicidade.MENSAL,
        descricao:
          "Descontos maiores e acesso antecipado a ingressos.",
        isFeatured: false,
        ordem: 2,
      },
      {
        nome: "Cadeira",
        valor: new Decimal("69.90"),
        periodicidade: Periodicidade.MENSAL,
        descricao:
          "Plano mais popular, com prioridade na compra de ingressos e experiências VIP.",
        isFeatured: true,
        badgeLabel: "Mais Popular",
        ordem: 3,
      },
      {
        nome: "Camarote",
        valor: new Decimal("129.90"),
        periodicidade: Periodicidade.MENSAL,
        descricao:
          "Plano premium com ingresso garantido e experiências exclusivas.",
        isFeatured: false,
        ordem: 4,
      },
      {
        nome: "Conselheiro",
        valor: new Decimal("249.90"),
        periodicidade: Periodicidade.MENSAL,
        descricao:
          "Nível mais alto com experiências exclusivas e participação em decisões.",
        isFeatured: false,
        ordem: 5,
      },
    ],
    skipDuplicates: true,
  });

  const planoCadeira = await prisma.plano.findFirstOrThrow({
    where: { nome: "Cadeira" },
  });

  /* 3️⃣ TORCEDOR */
  const torcedor = await prisma.torcedor.upsert({
    where: { email: "joao@teste.com" },
    update: {},
    create: {
      matricula: "BR001",
      nome: "João da Silva",
      email: "joao@teste.com",
      senha: await hash("Senha123!", 8),
      telefone: "51999999999",
      cpf: "12345678901",
      enderecoLogradouro: "Rua Bento Gonçalves",
      enderecoNumero: "123",
      enderecoCidade: "Pelotas",
      enderecoUF: "RS",
      enderecoCEP: "96000-000",
      statusSocio: "ATIVO",
      aceitaTermosEm: new Date(),
    },
  });

  /* 4️⃣ BENEFÍCIOS */
  await prisma.beneficio.createMany({
    data: [
      {
        slug: "descontos-loja",
        titulo: "Descontos na Loja Oficial",
        descricao: "10% de desconto em todos os produtos oficiais.",
        planoId: planoCadeira.id,
      },
      {
        slug: "sorteios-exclusivos",
        titulo: "Sorteios Exclusivos",
        descricao: "Sorteios mensais de camisetas e ingressos.",
        planoId: planoCadeira.id,
        destaque: true,
      },
      {
        slug: "area-vip",
        titulo: "Acesso à Área VIP",
        descricao:
          "Assentos reservados e experiências exclusivas nos jogos.",
        planoId: planoCadeira.id,
      },
    ],
    skipDuplicates: true,
  });

  /* 5️⃣ ASSINATURA */
  const assinatura = await prisma.assinatura.create({
    data: {
      torcedorId: torcedor.id,
      planoId: planoCadeira.id,
      inicioEm: new Date("2025-01-01"),
      proximaCobrancaEm: new Date("2025-02-01"),
      periodicidade: Periodicidade.MENSAL,
      valorAtual: new Decimal("69.90"),
    },
  });

  /* 6️⃣ FATURA */
  const fatura = await prisma.fatura.create({
    data: {
      assinaturaId: assinatura.id,
      competencia: "2025-01",
      valor: new Decimal("69.90"),
      vencimentoEm: new Date("2025-01-10"),
      referencia: "FAT-202501-001",
      metodo: "PIX",
      status: "PAGA",
      pagoEm: new Date("2025-01-05"),
    },
  });

  /* 7️⃣ PAGAMENTO */
  await prisma.pagamento.create({
    data: {
      torcedorId: torcedor.id,
      valor: new Decimal("69.90"),
      status: "PAGO",
      dataVencimento: new Date("2025-01-10"),
      pagoEm: new Date("2025-01-05"),
      referencia: fatura.referencia!,
      metodo: "PIX",
      descricao: "Mensalidade janeiro",
      faturaId: fatura.id,
    },
  });

  /* 8️⃣ SETORES */
  const setorArquibancada = await prisma.setor.create({
    data: {
      nome: "Arquibancada Norte",
      capacidade: 500,
    },
  });

  const setorCadeiras = await prisma.setor.create({
    data: {
      nome: "Cadeiras Cobertas",
      capacidade: 200,
    },
  });

  /* 9️⃣ JOGO */
  const jogo = await prisma.jogo.create({
    data: {
      nome: "Brasil de Pelotas x Grêmio",
      data: new Date("2025-11-10T19:30:00Z"),
      local: "Estádio Bento Freitas",
      descricao: "Rodada 15 do Campeonato Gaúcho",
      criadoPorId: admin.id,
    },
  });




  console.log("✅ Seed finalizado com sucesso!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Erro no seed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
