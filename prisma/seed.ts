import { PrismaClient, Periodicidade } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed...");

  // 1️⃣ ADMIN
  const senhaHash = await hash("admin123", 8);
  const admin = await prisma.admin.create({
    data: {
      nome: "Administrador",
      email: "admin@brasildt.com",
      senha: senhaHash,
    },
  });

  // 2️⃣ PLANOS (mantidos conforme solicitado)
  const planosData = [
    {
      nome: "Torcedor",
      valor: 19.9,
      periodicidade: Periodicidade.MENSAL,
      descricao:
        "Plano de entrada para acesso a conteúdo e benefícios digitais exclusivos.",
      isFeatured: false,
      ordem: 1,
    },
    {
      nome: "Arquibancada",
      valor: 39.9,
      periodicidade: Periodicidade.MENSAL,
      descricao:
        "Nível intermediário com descontos maiores e acesso antecipado a ingressos.",
      isFeatured: false,
      ordem: 2,
    },
    {
      nome: "Cadeira",
      valor: 69.9,
      periodicidade: Periodicidade.MENSAL,
      descricao:
        "O plano mais popular, oferece prioridade na compra de ingressos e experiências VIP limitadas.",
      isFeatured: true,
      badgeLabel: "Mais Popular",
      ordem: 3,
    },
    {
      nome: "Camarote",
      valor: 129.9,
      periodicidade: Periodicidade.MENSAL,
      descricao:
        "Plano premium focado na experiência de jogo, incluindo ingresso garantido em casa.",
      isFeatured: false,
      ordem: 4,
    },
    {
      nome: "Conselheiro",
      valor: 249.9,
      periodicidade: Periodicidade.MENSAL,
      descricao:
        "O nível mais alto de associação, oferecendo experiências exclusivas com a diretoria e participação em decisões.",
      isFeatured: false,
      ordem: 5,
    },
  ];

  const planos = await prisma.plano.createMany({ data: planosData });
  console.log(`✅ ${planos.count} planos criados.`);

  const planoCadeira = await prisma.plano.findFirst({
    where: { nome: "Cadeira" },
  });

  // 3️⃣ TORCEDOR
  const torcedor = await prisma.torcedor.create({
    data: {
      matricula: "BR001",
      nome: "João da Silva",
      email: "joao@teste.com",
      senha: await hash("123456", 8),
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

  // 4️⃣ BENEFÍCIOS
  await prisma.beneficio.createMany({
    data: [
      {
        slug: "descontos-loja",
        titulo: "Descontos na Loja Oficial",
        descricao: "10% de desconto em todos os produtos oficiais.",
        planoId: planoCadeira!.id,
      },
      {
        slug: "sorteios-exclusivos",
        titulo: "Sorteios Exclusivos",
        descricao: "Participe de sorteios mensais de camisetas e ingressos.",
        planoId: planoCadeira!.id,
        destaque: true,
      },
      {
        slug: "area-vip",
        titulo: "Acesso à Área VIP do Estádio",
        descricao:
          "Assentos reservados e experiências exclusivas nos jogos do Brasil de Pelotas.",
        planoId: planoCadeira!.id,
      },
    ],
  });

  // 5️⃣ ASSINATURA
  const assinatura = await prisma.assinatura.create({
    data: {
      torcedorId: torcedor.id,
      planoId: planoCadeira!.id,
      inicioEm: new Date("2025-01-01"),
      proximaCobrancaEm: new Date("2025-02-01"),
      periodicidade: "MENSAL",
      valorAtual: new Decimal(69.9),
    },
  });

  // 6️⃣ FATURA
  const fatura = await prisma.fatura.create({
    data: {
      assinaturaId: assinatura.id,
      competencia: "2025-01",
      valor: new Decimal(69.9),
      vencimentoEm: new Date("2025-01-10"),
      referencia: "FAT-202501-001",
      metodo: "PIX",
      status: "PAGA",
      pagoEm: new Date("2025-01-05"),
    },
  });

  // 7️⃣ PAGAMENTO
  await prisma.pagamento.create({
    data: {
      torcedorId: torcedor.id,
      valor: new Decimal(69.9),
      status: "PAGO",
      dataVencimento: new Date("2025-01-10"),
      pagoEm: new Date("2025-01-05"),
      referencia: fatura.referencia!,
      metodo: "PIX",
      descricao: "Mensalidade janeiro",
      faturaId: fatura.id,
    },
  });

  // 8️⃣ SETORES
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

  // 9️⃣ ASSENTO
  const assento1 = await prisma.assento.create({
    data: { setorId: setorCadeiras.id, numero: 1 },
  });

  // 🔟 JOGO
  const jogo = await prisma.jogo.create({
    data: {
      nome: "Brasil de Pelotas x Grêmio",
      data: new Date("2025-11-10T19:30:00Z"),
      local: "Estádio Bento Freitas",
      descricao: "Rodada 15 do Campeonato Gaúcho",
      criadoPorId: admin.id,
    },
  });

  // 1️⃣1️⃣ LOTE
  const lote1 = await prisma.lote.create({
    data: {
      nome: "1º Lote",
      quantidade: 100,
      precoUnitario: new Decimal(50.0),
      jogoId: jogo.id,
      setorId: setorArquibancada.id,
    },
  });

  // 1️⃣2️⃣ INGRESSO
  const ingresso = await prisma.ingresso.create({
    data: {
      socioId: torcedor.id,
      eventoId: jogo.id,
      qrCode: "BRAS20251110-001",
      valor: new Decimal(50.0),
      status: "VALIDO",
      loteId: lote1.id,
      assentoId: assento1.id,
    },
  });

  // 1️⃣3️⃣ CHECKIN
  await prisma.checkin.create({
    data: {
      ingressoId: ingresso.id,
      feitoPor: admin.id,
      local: "Portão Principal",
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
