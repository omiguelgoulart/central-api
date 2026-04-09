import { prisma } from "../src/lib/prisma";
import { Periodicidade, StatusSocio, StatusAssinatura, StatusFatura, MetodoPagamento, TipoSetor, StatusIngresso, StatusPedido, TipoLote } from "@prisma/client";
import { fakerPT_BR as faker } from "@faker-js/faker";

// Utilitário para datas
const subMonths = (date: Date, months: number) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() - months);
  return d;
};

async function main() {
  console.log("🔴⚫ INICIANDO SEED DO BRASIL DE PELOTAS...");

  // 0. RESET COMPLETO DO BANCO
  console.log("⚠️ RESETANDO BANCO DE DADOS...");
  try {
    await prisma.$executeRawUnsafe(`
      TRUNCATE TABLE "checkins" CASCADE;
      TRUNCATE TABLE "ingressos" CASCADE;
      TRUNCATE TABLE "itens_pedido" CASCADE;
      TRUNCATE TABLE "pedidos" CASCADE;
      TRUNCATE TABLE "pagamentos_ingresso" CASCADE;
      TRUNCATE TABLE "pagamentos_socio" CASCADE;
      TRUNCATE TABLE "faturas" CASCADE;
      TRUNCATE TABLE "assinaturas" CASCADE;
      TRUNCATE TABLE "beneficios" CASCADE;
      TRUNCATE TABLE "lotes" CASCADE;
      TRUNCATE TABLE "jogos_setores" CASCADE;
      TRUNCATE TABLE "jogos" CASCADE;
      TRUNCATE TABLE "setores" CASCADE;
      TRUNCATE TABLE "planos" CASCADE;
      TRUNCATE TABLE "torcedores" CASCADE;
      TRUNCATE TABLE "admins" CASCADE;
    `);
    console.log("✅ Banco resetado com sucesso!");
  } catch (error) {
    console.log("⚠️ Tentando deletar dados manualmente...");
  }

  // 1. LIMPEZA DO BANCO (FALLBACK)
  console.log("🧹 Limpando dados antigos...");
  await prisma.checkin.deleteMany();
  await prisma.ingresso.deleteMany();
  await prisma.itemPedido.deleteMany();
  await prisma.pedido.deleteMany();
  await prisma.pagamentoIngresso.deleteMany();
  await prisma.pagamentoSocio.deleteMany();
  await prisma.fatura.deleteMany();
  await prisma.assinatura.deleteMany();
  await prisma.beneficio.deleteMany();
  await prisma.lote.deleteMany();
  await prisma.jogoSetor.deleteMany();
  await prisma.jogo.deleteMany();
  await prisma.setor.deleteMany();
  await prisma.plano.deleteMany();
  await prisma.torcedor.deleteMany();
  await prisma.admin.deleteMany();

  // 2. ADMIN
  console.log("👤 Criando administrativo...");
  await prisma.admin.create({
    data: {
      nome: "Miguel Goulart",
      email: "admin@gebrasil.com.br",
      senha: "$2b$10$YOUR_HASH_HERE",
      role: "SUPER_ADMIN",
    },
  });

  // 3. SETORES
  console.log("🏟️ Criando setores do Bento Freitas...");
  const setoresData = [
    {
      slug: "arquibancada-jk",
      nome: "Arquibancada JK (Juscelino)",
      tipo: TipoSetor.ARQUIBANCADA,
    },
    {
      slug: "arquibancada-social",
      nome: "Arquibancada Social",
      tipo: TipoSetor.ARQUIBANCADA,
    },
    {
      slug: "arquibancada-norte",
      nome: "Arquibancada Norte",
      tipo: TipoSetor.ARQUIBANCADA,
    },
    {
      slug: "arquibancada-sul",
      nome: "Arquibancada Sul",
      tipo: TipoSetor.ARQUIBANCADA,
    },
    {
      slug: "cadeiras-cativas",
      nome: "Cadeiras Cativas",
      tipo: TipoSetor.CADEIRA,
    },
    {
      slug: "camarote-premium",
      nome: "Camarote Premium",
      tipo: TipoSetor.CAMAROTE,
    },
    {
      slug: "visitante",
      nome: "Setor Visitante",
      tipo: TipoSetor.VISITANTE,
    },
    {
      slug: "acessivel",
      nome: "Setor Acessível",
      tipo: TipoSetor.ACESSIVEL,
    },
  ];

  const setoresMap = new Map();
  for (const s of setoresData) {
    const setor = await prisma.setor.create({
      data: {
        slug: s.slug,
        nome: s.nome,
        tipo: s.tipo,
      },
    });
    setoresMap.set(s.nome, setor);
  }

  // 4. PLANOS DE SÓCIO
  console.log("💳 Criando planos de sócio...");
  const planosData = [
    {
      nome: "Xavante",
      descricao: "Plano de entrada para apoiar o Brasil em todos os jogos.",
      valor: 49.9,
      periodicidade: Periodicidade.MENSAL,
      isFeatured: false,
      ordem: 1,
      beneficios: [
        "Acesso Arquibancada Norte",
        "Carteirinha Digital",
        "10% desconto em ingressos",
      ],
    },
    {
      nome: "Rubro Negro",
      descricao:
        "Mais vantagens em ingressos e prioridade na compra no Bento Freitas.",
      valor: 89.9,
      periodicidade: Periodicidade.MENSAL,
      isFeatured: true,
      badgeLabel: "Mais Querido",
      ordem: 2,
      beneficios: [
        "Acesso Total Arquibancadas",
        "Camisa Oficial 2026",
        "15% desconto em loja",
        "Prioridade de compra",
      ],
    },
    {
      nome: "Bento Freitas",
      descricao: "Plano premium para quem vive o Xavante todos os dias.",
      valor: 159.9,
      periodicidade: Periodicidade.MENSAL,
      isFeatured: false,
      badgeLabel: "Experiência",
      ordem: 3,
      beneficios: [
        "Cadeira Cativa Garantida",
        "Acesso VIP + Lounge",
        "Estacionamento Premium",
        "Kit Boas-vindas",
        "20% desconto em tudo",
      ],
    },
    {
      nome: "Estudante",
      descricao: "Plano especial para estudantes.",
      valor: 29.9,
      periodicidade: Periodicidade.MENSAL,
      isFeatured: false,
      ordem: 4,
      beneficios: [
        "Acesso Arquibancada Norte",
        "Carteirinha Digital",
        "12% desconto em ingressos",
        "Desconto em parceiros",
      ],
    },
  ];

  const planos = [];
  for (const p of planosData) {
    const plano = await prisma.plano.create({
      data: {
        nome: p.nome,
        descricao: p.descricao,
        valor: p.valor,
        periodicidade: p.periodicidade,
        isFeatured: p.isFeatured,
        badgeLabel: p.badgeLabel,
        ordem: p.ordem,
        beneficios: {
          create: p.beneficios.map((b, idx) => ({
            titulo: b,
            slug: `${p.nome.toLowerCase().replace(/\s+/g, "-")}-${idx}`,
            descricao: b,
            ativo: true,
            ordem: idx,
            destaque: idx === 0,
          })),
        },
      },
    });
    planos.push(plano);
  }

  // 5. CALENDÁRIO DE JOGOS
  console.log("⚽ Agendando jogos...");
  const hoje = new Date();

  const listaJogos = [
    {
      nome: "Brasil x São Luiz",
      data: subMonths(hoje, 2),
      adv: "São Luiz",
      passado: true,
      classico: false,
    },
    {
      nome: "Brasil x Ypiranga",
      data: subMonths(hoje, 1),
      adv: "Ypiranga",
      passado: true,
      classico: false,
    },
    {
      nome: "Brasil x Novo Hamburgo",
      data: new Date(hoje.getTime() - 86400000 * 7),
      adv: "Novo Hamburgo",
      passado: true,
      classico: false,
    },
    {
      nome: "Brasil x Pelotas",
      data: new Date(hoje.getTime() + 86400000 * 3),
      adv: "Pelotas",
      passado: false,
      classico: true,
    },
    {
      nome: "Brasil x Internacional",
      data: new Date(hoje.getTime() + 86400000 * 10),
      adv: "Internacional",
      passado: false,
      classico: false,
    },
    {
      nome: "Brasil x Caxias",
      data: new Date(hoje.getTime() + 86400000 * 17),
      adv: "Caxias",
      passado: false,
      classico: false,
    },
  ];

  const jogosCriados = [];

  for (const j of listaJogos) {
    const jogo = await prisma.jogo.create({
      data: {
        nome: j.nome,
        data: j.data,
        local: "Estádio Bento Freitas, Pelotas",
        descricao: j.classico ? "O maior clássico do interior!" : `Rodada do campeonato contra ${j.adv}`,
      },
    });

    // Criar JogoSetor e Lotes para cada setor
    const lotesDoJogo = [];
    for (const [nomeSetor, setorObj] of setoresMap) {
      const capacidades: Record<string, number> = {
        "Arquibancada JK (Juscelino)": 4000,
        "Arquibancada Social": 2000,
        "Arquibancada Norte": 2500,
        "Arquibancada Sul": 2500,
        "Cadeiras Cativas": 1500,
        "Camarote Premium": 500,
        "Setor Visitante": 1000,
        "Setor Acessível": 180,
      };

      const jogoSetor = await prisma.jogoSetor.create({
        data: {
          jogoId: jogo.id,
          setorId: setorObj.id,
          capacidade: capacidades[nomeSetor] || 1000,
          aberto: true,
        },
      });

      // Preço dinâmico
      let precoBase = 40.0;
      if (nomeSetor.includes("Cadeira")) precoBase = 120.0;
      if (nomeSetor.includes("Camarote")) precoBase = 180.0;
      if (j.classico) precoBase *= 1.5;

      const lote = await prisma.lote.create({
        data: {
          nome: "Lote 1 - Antecipado",
          jogoId: jogo.id,
          jogoSetorId: jogoSetor.id,
          precoUnitario: precoBase,
          quantidade: 500,
          inicioVendas: subMonths(hoje, 3),
          fimVendas: j.data,
          tipo: TipoLote.INTEIRA,
        },
      });

      lotesDoJogo.push({ lote, setorObj, jogoSetor });
    }

    jogosCriados.push({ ...jogo, lotes: lotesDoJogo, passado: j.passado });
  }

  // 6. POPULAÇÃO DE TORCEDORES
  console.log("👥 Gerando 150 torcedores...");

  const NUM_TORCEDORES = 150;
  const metodosPagamento = [
    MetodoPagamento.PIX,
    MetodoPagamento.CARTAO_CREDITO,
    MetodoPagamento.BOLETO,
  ];

  for (let i = 0; i < NUM_TORCEDORES; i++) {
    const sexo = faker.person.sexType();
    const nome = faker.person.firstName(sexo) + " " + faker.person.lastName();
    const ehSocio = Math.random() > 0.4; // 60% são sócios

    let statusSocio: StatusSocio | null = ehSocio
      ? StatusSocio.ATIVO
      : null;
    if (ehSocio && Math.random() > 0.8) statusSocio = StatusSocio.INADIMPLENTE;

    const torcedor = await prisma.torcedor.create({
      data: {
        nome,
        email: faker.internet.email({ firstName: nome.split(" ")[0] }),
        senha: "$2b$10$HASH_FICTICIO",
        matricula: faker.string.numeric(ehSocio ? 6 : 8),
        cpf: faker.string.numeric(11),
        telefone: faker.phone.number(),
        dataNascimento: faker.date.birthdate({ min: 16, max: 70, mode: "age" }),
        enderecoCidade: "Pelotas",
        enderecoUF: "RS",
        statusSocio: ehSocio ? statusSocio : null,
        emailVerificado: true,
        criadoEm: faker.date.past({ years: 2 }),
      },
    });

    // === SE FOR SÓCIO: GERAR ASSINATURA E FATURAS ===
    if (ehSocio) {
      const plano = planos[Math.floor(Math.random() * planos.length)];

      const assinatura = await prisma.assinatura.create({
        data: {
          torcedorId: torcedor.id,
          planoId: plano.id,
          status:
            statusSocio === StatusSocio.INADIMPLENTE
              ? StatusAssinatura.SUSPENSA
              : StatusAssinatura.ATIVA,
          inicioEm: subMonths(hoje, 8),
          valorAtual: plano.valor,
          periodicidade: Periodicidade.MENSAL,
          proximaCobrancaEm: new Date(
            hoje.getFullYear(),
            hoje.getMonth() + 1,
            10
          ),
        },
      });

      // Gerar faturas dos últimos 6 meses
      for (let m = 0; m < 6; m++) {
        const dataRef = subMonths(hoje, m);
        const vencimento = new Date(dataRef.getFullYear(), dataRef.getMonth(), 10);

        let estaPaga = true;
        if (statusSocio === StatusSocio.INADIMPLENTE && m < 2)
          estaPaga = false;

        let estatusFatura = StatusFatura.ABERTA;

        if (estaPaga) {
          estatusFatura = StatusFatura.PAGA;
        } else if (vencimento < hoje) {
          estatusFatura = StatusFatura.ATRASADA;
        }

        const fatura = await prisma.fatura.create({
          data: {
            assinaturaId: assinatura.id,
            competencia: `${dataRef.getFullYear()}-${(dataRef.getMonth() + 1)
              .toString()
              .padStart(2, "0")}`,
            valor: plano.valor,
            status: estatusFatura,
            vencimentoEm: vencimento,
            pagoEm: estaPaga ? vencimento : null,
            metodo: estaPaga
              ? metodosPagamento[
              Math.floor(Math.random() * metodosPagamento.length)
              ]
              : MetodoPagamento.BOLETO,
          },
        });

        // Criar PagamentoSocio se foi pago
        if (estaPaga) {
          await prisma.pagamentoSocio.create({
            data: {
              torcedorId: torcedor.id,
              faturaId: fatura.id,
              valor: plano.valor,
              descricao: `Mensalidade Sócio - Ref ${dataRef.getMonth() + 1}/${dataRef.getFullYear()}`,
              status: "PAGO",
              dataVencimento: vencimento,
              pagoEm: vencimento,
              metodo: metodosPagamento[
                Math.floor(Math.random() * metodosPagamento.length)
              ],
            },
          });
        }
      }
    }

    // === COMPRA DE INGRESSOS ===
    const chanceIrNoJogo = ehSocio ? 0.8 : 0.3;

    for (const jogoData of jogosCriados) {
      if (Math.random() > chanceIrNoJogo) continue;

      if (ehSocio && statusSocio === StatusSocio.INADIMPLENTE) continue;

      const { lote } = jogoData.lotes[
        Math.floor(Math.random() * jogoData.lotes.length)
      ];

      // Criar Pedido
      const pedido = await prisma.pedido.create({
        data: {
          torcedorId: torcedor.id,
          status: StatusPedido.PAGO,
          criadoEm: jogoData.passado ? jogoData.data : hoje,
        },
      });

      // Criar ItemPedido
      const itemPedido = await prisma.itemPedido.create({
        data: {
          pedidoId: pedido.id,
          loteId: lote.id,
          valorUnitario: lote.precoUnitario,
        },
      });

      // Criar Ingresso
      const ingresso = await prisma.ingresso.create({
        data: {
          itemPedidoId: itemPedido.id,
          qrCode: faker.string.uuid(),
          status: jogoData.passado ? StatusIngresso.USADO : StatusIngresso.VALIDO,
          usadoEm: jogoData.passado ? jogoData.data : null,
        },
      });

      // Criar PagamentoIngresso
      await prisma.pagamentoIngresso.create({
        data: {
          pedidoId: pedido.id,
          total: lote.precoUnitario,
          status: "APROVADO",
          provider: "PIX",
        },
      });

      // === CHECKIN SE JOGO JÁ PASSOU ===
      if (jogoData.passado) {
        await prisma.checkin.create({
          data: {
            ingressoId: ingresso.id,
            feitoEm: jogoData.data,
            local: `Catraca ${Math.floor(Math.random() * 9) + 1}`,
          },
        });
      }
    }
  }

  // === ESTATÍSTICAS FINAIS ===
  const stats = await Promise.all([
    prisma.torcedor.count(),
    prisma.assinatura.count(),
    prisma.fatura.count(),
    prisma.pagamentoSocio.count(),
    prisma.pedido.count(),
    prisma.ingresso.count(),
    prisma.checkin.count(),
  ]);

  console.log("✅ SEED FINALIZADO COM SUCESSO!");
  console.log(`📊 Torcedores: ${stats[0]}`);
  console.log(`💼 Assinaturas: ${stats[1]}`);
  console.log(`📋 Faturas: ${stats[2]}`);
  console.log(`💰 Pagamentos Sócio: ${stats[3]}`);
  console.log(`🎫 Pedidos de Ingresso: ${stats[4]}`);
  console.log(`🎟️ Ingressos: ${stats[5]}`);
  console.log(`✅ Checkins: ${stats[6]}`);
}



main()
  .catch((e) => {
    console.error("❌ Erro na seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

