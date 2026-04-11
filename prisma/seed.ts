import { randomUUID } from 'crypto'

import { TipoSetor, TipoLote, StatusPedido, StatusIngresso, StatusPagamentoIngresso, AdminRole, StatusSocio, Periodicidade, StatusAssinatura, StatusFatura, StatusPagamentoSocio, MetodoPagamento } from '@prisma/client'

import { prisma } from '../src/lib/prisma'

// ─── helpers ──────────────────────────────────────────────────────────────────

function qrCode() {
  return `GEB-${randomUUID().replace(/-/g, '').toUpperCase().slice(0, 16)}`
}

function matricula(n: number) {
  return `GEB${String(n).padStart(6, '0')}`
}

// ─── seed ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱  Limpando banco...')

  await prisma.checkin.deleteMany()
  await prisma.ingresso.deleteMany()
  await prisma.itemPedido.deleteMany()
  await prisma.pagamentoIngresso.deleteMany()
  await prisma.pedido.deleteMany()
  await prisma.lote.deleteMany()
  await prisma.jogoSetor.deleteMany()
  await prisma.jogo.deleteMany()
  await prisma.setor.deleteMany()
  await prisma.pagamentoSocio.deleteMany()
  await prisma.fatura.deleteMany()
  await prisma.assinatura.deleteMany()
  await prisma.beneficio.deleteMany()
  await prisma.plano.deleteMany()
  await prisma.torcedor.deleteMany()
  await prisma.admin.deleteMany()

  console.log('✅  Banco limpo.')

  // ── ADMINS ─────────────────────────────────────────────────────────────────

  console.log('👤  Criando admins...')

  const adminSuper = await prisma.admin.create({
    data: {
      nome: 'Miguel Goulart',
      email: 'miguel@geb.com.br',
      senha: '$Miguel1_hash_super_admin',
      role: AdminRole.SUPER_ADMIN,
    },
  })

  const adminOp = await prisma.admin.create({
    data: {
      nome: 'Camila Souza',
      email: 'camila@geb.com.br',
      senha: '$Camila1_hash_operacional',
      role: AdminRole.OPERACIONAL,
    },
  })

  await prisma.admin.create({
    data: {
      nome: 'João Porteiro',
      email: 'portaria@geb.com.br',
      senha: 'Portaria1_hash_portaria',
      role: AdminRole.PORTARIA,
    },
  })


  // ── PLANOS ────────────────────────────────────────────────────────────────

  console.log('📋  Criando planos...')

  const planoBasico = await prisma.plano.create({
    data: {
      nome: 'Sócio Torcedor',
      descricao: 'Plano de entrada para o fiel torcedor do Brasil de Pelotas.',
      valor: 29.9,
      periodicidade: Periodicidade.MENSAL,
      isFeatured: false,
      ordem: 1,
      beneficios: {
        create: [
          { slug: 'desconto-ingresso-basico', titulo: 'Desconto de 20% em ingressos', ordem: 1 },
          { slug: 'prioridade-compra-basico', titulo: 'Prioridade na compra de ingressos', ordem: 2 },
          { slug: 'carteirinha-basico', titulo: 'Carteirinha digital de sócio', ordem: 3 },
        ],
      },
    },
  })

  const planoPremium = await prisma.plano.create({
    data: {
      nome: 'Sócio Campeão',
      descricao: 'O plano completo para quem vive o Brasil de Pelotas.',
      valor: 59.9,
      periodicidade: Periodicidade.MENSAL,
      isFeatured: true,
      badgeLabel: 'Mais popular',
      ordem: 2,
      beneficios: {
        create: [
          { slug: 'desconto-ingresso-premium', titulo: 'Desconto de 40% em ingressos', ordem: 1, destaque: true },
          { slug: 'ingresso-cortesia', titulo: '1 ingresso cortesia por mês', ordem: 2, destaque: true },
          { slug: 'prioridade-premium', titulo: 'Prioridade máxima na compra', ordem: 3 },
          { slug: 'carteirinha-premium', titulo: 'Carteirinha física + digital', ordem: 4 },
          { slug: 'desconto-loja', titulo: '15% na loja oficial', ordem: 5 },
        ],
      },
    },
  })

  const planoAnual = await prisma.plano.create({
    data: {
      nome: 'Sócio Anual Ouro',
      descricao: 'Plano anual com o melhor custo-benefício.',
      valor: 599,
      periodicidade: Periodicidade.ANUAL,
      isFeatured: false,
      badgeLabel: 'Economia de 2 meses',
      ordem: 3,
      beneficios: {
        create: [
          { slug: 'todos-beneficios-premium', titulo: 'Todos os benefícios do Campeão', ordem: 1, destaque: true },
          { slug: 'ingresso-cortesia-anual', titulo: '2 ingressos cortesia por mês', ordem: 2, destaque: true },
          { slug: 'acesso-camarote', titulo: 'Acesso ao camarote 1x/mês', ordem: 3 },
        ],
      },
    },
  })

  // ── SETORES ───────────────────────────────────────────────────────────────

  console.log('🏟️  Criando setores...')

  const setores = await Promise.all([
    prisma.setor.create({
      data: { slug: 'jk', nome: 'Arquibancada JK (Juscelino)', tipo: TipoSetor.ARQUIBANCADA },
    }),
    prisma.setor.create({
      data: { slug: 'social', nome: 'Arquibancada Social', tipo: TipoSetor.ARQUIBANCADA },
    }),
    prisma.setor.create({
      data: { slug: 'norte', nome: 'Arquibancada Norte', tipo: TipoSetor.ARQUIBANCADA },
    }),
    prisma.setor.create({
      data: { slug: 'sul', nome: 'Arquibancada Sul', tipo: TipoSetor.ARQUIBANCADA },
    }),
    prisma.setor.create({
      data: { slug: 'cativas', nome: 'Cadeiras Cativas', tipo: TipoSetor.CADEIRA },
    }),
    prisma.setor.create({
      data: { slug: 'norte-visitante', nome: 'Arquibancada Norte (Visitante)', tipo: TipoSetor.VISITANTE },
    }),
  ])

  const [setorJk, setorSocial, setorNorte, setorSul, setorCativas, setorNorteVisitante] = setores

  // ── TORCEDORES ────────────────────────────────────────────────────────────

  console.log('👥  Criando torcedores...')

  const torcedores = await Promise.all([
    // Sócio ativo - plano básico
    prisma.torcedor.create({
      data: {
        matricula: matricula(1),
        nome: 'Carlos Eduardo Moreira',
        email: 'carlos.moreira@email.com',
        senha: '$2b$10$dummy',
        cpf: '111.222.333-44',
        telefone: '(53) 98111-2233',
        dataNascimento: new Date('1985-03-15'),
        genero: 'M',
        enderecoCidade: 'Pelotas',
        enderecoUF: 'RS',
        statusSocio: StatusSocio.ATIVO,
        emailVerificado: true,
        aceitaTermosEm: new Date('2024-01-10'),
        origemCadastro: 'web',
      },
    }),
    // Sócio ativo - plano premium
    prisma.torcedor.create({
      data: {
        matricula: matricula(2),
        nome: 'Fernanda Lima Costa',
        email: 'fernanda.costa@email.com',
        senha: '$2b$10$dummy',
        cpf: '222.333.444-55',
        telefone: '(53) 98222-3344',
        dataNascimento: new Date('1992-07-22'),
        genero: 'F',
        enderecoCidade: 'Pelotas',
        enderecoUF: 'RS',
        statusSocio: StatusSocio.ATIVO,
        emailVerificado: true,
        aceitaTermosEm: new Date('2023-08-01'),
        aceitaMarketing: true,
        origemCadastro: 'app',
      },
    }),
    // Sócio inadimplente
    prisma.torcedor.create({
      data: {
        matricula: matricula(3),
        nome: 'Paulo Roberto Dias',
        email: 'paulo.dias@email.com',
        senha: '$2b$10$dummy',
        cpf: '333.444.555-66',
        telefone: '(53) 98333-4455',
        dataNascimento: new Date('1978-11-30'),
        genero: 'M',
        enderecoCidade: 'Pelotas',
        enderecoUF: 'RS',
        statusSocio: StatusSocio.INADIMPLENTE,
        inadimplenteDesde: new Date('2025-02-01'),
        emailVerificado: true,
        aceitaTermosEm: new Date('2024-03-15'),
      },
    }),
    // Torcedor sem assinatura (compra ingressos avulsos)
    prisma.torcedor.create({
      data: {
        matricula: matricula(4),
        nome: 'Juliana Ferreira Santos',
        email: 'juliana.santos@email.com',
        senha: '$2b$10$dummy',
        cpf: '444.555.666-77',
        telefone: '(53) 98444-5566',
        dataNascimento: new Date('2000-05-10'),
        genero: 'F',
        enderecoCidade: 'Rio Grande',
        enderecoUF: 'RS',
        emailVerificado: true,
        aceitaTermosEm: new Date('2025-01-20'),
        origemCadastro: 'web',
      },
    }),
    // Sócio anual ativo
    prisma.torcedor.create({
      data: {
        matricula: matricula(5),
        nome: 'Marcelo Andrade Pereira',
        email: 'marcelo.pereira@email.com',
        senha: '$2b$10$dummy',
        cpf: '555.666.777-88',
        telefone: '(53) 98555-6677',
        dataNascimento: new Date('1970-09-05'),
        genero: 'M',
        enderecoCidade: 'Pelotas',
        enderecoUF: 'RS',
        statusSocio: StatusSocio.ATIVO,
        emailVerificado: true,
        aceitaTermosEm: new Date('2023-01-01'),
        aceitaMarketing: true,
        origemCadastro: 'web',
      },
    }),
  ])

  const [t1, t2, t3, t4, t5] = torcedores

  // ── ASSINATURAS ───────────────────────────────────────────────────────────

  console.log('📝  Criando assinaturas...')

  const assinaturaT1 = await prisma.assinatura.create({
    data: {
      torcedorId: t1.id,
      planoId: planoBasico.id,
      status: StatusAssinatura.ATIVA,
      inicioEm: new Date('2024-01-10'),
      proximaCobrancaEm: new Date('2026-05-10'),
      periodicidade: Periodicidade.MENSAL,
      valorAtual: 29.9,
    },
  })

  await prisma.assinatura.create({
    data: {
      torcedorId: t2.id,
      planoId: planoPremium.id,
      status: StatusAssinatura.ATIVA,
      inicioEm: new Date('2023-08-01'),
      proximaCobrancaEm: new Date('2026-05-01'),
      periodicidade: Periodicidade.MENSAL,
      valorAtual: 59.9,
    },
  })

  const assinaturaT3 = await prisma.assinatura.create({
    data: {
      torcedorId: t3.id,
      planoId: planoBasico.id,
      status: StatusAssinatura.SUSPENSA,
      inicioEm: new Date('2024-03-15'),
      suspensaEm: new Date('2025-02-01'),
      periodicidade: Periodicidade.MENSAL,
      valorAtual: 29.9,
    },
  })

  await prisma.assinatura.create({
    data: {
      torcedorId: t5.id,
      planoId: planoAnual.id,
      status: StatusAssinatura.ATIVA,
      inicioEm: new Date('2025-01-01'),
      expiraEm: new Date('2026-01-01'),
      proximaCobrancaEm: new Date('2027-01-01'),
      periodicidade: Periodicidade.ANUAL,
      valorAtual: 599,
    },
  })

  // Faturas e pagamentos de sócio
  const faturaT1 = await prisma.fatura.create({
    data: {
      assinaturaId: assinaturaT1.id,
      competencia: '2026-04',
      valor: 29.9,
      status: StatusFatura.PAGA,
      vencimentoEm: new Date('2026-04-10'),
      pagoEm: new Date('2026-04-08'),
      referencia: 'FAT-T1-202604',
      metodo: MetodoPagamento.PIX,
    },
  })

  await prisma.pagamentoSocio.create({
    data: {
      torcedorId: t1.id,
      faturaId: faturaT1.id,
      valor: 29.9,
      status: StatusPagamentoSocio.PAGO,
      dataVencimento: new Date('2026-04-10'),
      pagoEm: new Date('2026-04-08'),
      referencia: 'PAG-T1-202604',
      metodo: MetodoPagamento.PIX,
      descricao: 'Mensalidade abril/2026 - Sócio Torcedor',
    },
  })

  // Fatura aberta (próxima)
  await prisma.fatura.create({
    data: {
      assinaturaId: assinaturaT1.id,
      competencia: '2026-05',
      valor: 29.9,
      status: StatusFatura.ABERTA,
      vencimentoEm: new Date('2026-05-10'),
      referencia: 'FAT-T1-202605',
    },
  })

  // Fatura atrasada (inadimplente)
  const faturaT3 = await prisma.fatura.create({
    data: {
      assinaturaId: assinaturaT3.id,
      competencia: '2026-02',
      valor: 29.9,
      status: StatusFatura.ATRASADA,
      vencimentoEm: new Date('2026-02-15'),
      referencia: 'FAT-T3-202602',
    },
  })

  await prisma.pagamentoSocio.create({
    data: {
      torcedorId: t3.id,
      faturaId: faturaT3.id,
      valor: 29.9,
      status: StatusPagamentoSocio.ATRASADO,
      dataVencimento: new Date('2026-02-15'),
      referencia: 'PAG-T3-202602',
      metodo: MetodoPagamento.BOLETO,
      descricao: 'Mensalidade fevereiro/2026 - Sócio Torcedor',
    },
  })

  // ── JOGOS ─────────────────────────────────────────────────────────────────

  console.log('⚽  Criando jogos...')

  type GameInput = {
    nome: string
    data: Date
    local?: string
    descricao?: string
    criadoPorId: string
    atualizadoPorId: string
  }

  const jogosData: GameInput[] = [
    // ─ Passados ─────────────────────────────────────────────────────────────
    {
      nome: 'GEB x Caxias do Sul – Série C',
      data: new Date('2026-02-15T16:00:00-03:00'),
      descricao: 'Rodada de abertura do Campeonato Gaúcho de 2026.',
      criadoPorId: adminOp.id,
      atualizadoPorId: adminOp.id,
    },
    {
      nome: 'GEB x São José-RS – Gauchão',
      data: new Date('2026-02-28T19:00:00-03:00'),
      descricao: 'Segundo jogo da fase de grupos do Gauchão 2026.',
      criadoPorId: adminOp.id,
      atualizadoPorId: adminOp.id,
    },
    {
      nome: 'GEB x Pelotas FC – Clássico Pelotense',
      data: new Date('2026-03-08T17:00:00-03:00'),
      descricao: 'O grande clássico de Pelotas, válido pelo Gauchão 2026.',
      criadoPorId: adminSuper.id,
      atualizadoPorId: adminSuper.id,
    },
    {
      nome: 'GEB x Novo Hamburgo – Gauchão',
      data: new Date('2026-03-22T16:00:00-03:00'),
      descricao: 'Confronto pela quarta rodada do Gauchão 2026.',
      criadoPorId: adminOp.id,
      atualizadoPorId: adminOp.id,
    },
    {
      nome: 'GEB x Ypiranga – Fase Final Gauchão',
      data: new Date('2026-04-05T17:00:00-03:00'),
      descricao: 'Jogo de ida da fase semifinal do Gauchão 2026.',
      criadoPorId: adminSuper.id,
      atualizadoPorId: adminSuper.id,
    },
    // ─ Próximos ─────────────────────────────────────────────────────────────
    {
      nome: 'GEB x Pelotas FC – Série C Brasileira',
      data: new Date('2026-04-19T17:00:00-03:00'),
      descricao: 'Rodada de abertura da Série C do Brasileirão 2026. Clássico Pelotense.',
      criadoPorId: adminSuper.id,
      atualizadoPorId: adminSuper.id,
    },
    {
      nome: 'GEB x ABC-RN – Série C',
      data: new Date('2026-04-26T16:00:00-03:00'),
      descricao: 'Segundo confronto da Série C 2026 no Bento Freitas.',
      criadoPorId: adminOp.id,
      atualizadoPorId: adminOp.id,
    },
    {
      nome: 'GEB x Remo-PA – Série C',
      data: new Date('2026-05-10T16:00:00-03:00'),
      descricao: 'Confronto com o Leão Azul pela terceira rodada da Série C.',
      criadoPorId: adminOp.id,
      atualizadoPorId: adminOp.id,
    },
    {
      nome: 'GEB x CSA-AL – Série C',
      data: new Date('2026-05-24T19:00:00-03:00'),
      descricao: 'Jogo noturno pela quarta rodada da Série C 2026.',
      criadoPorId: adminOp.id,
      atualizadoPorId: adminOp.id,
    },
    {
      nome: 'GEB x Ferroviária-SP – Série C',
      data: new Date('2026-06-07T16:00:00-03:00'),
      descricao: 'Confronto com a Locomotiva pela quinta rodada da Série C.',
      criadoPorId: adminOp.id,
      atualizadoPorId: adminOp.id,
    },
  ]

  const jogos = []

  for (const jogoData of jogosData) {
    const jogo = await prisma.jogo.create({ data: jogoData })
    jogos.push(jogo)
  }

  // ── JOGOS x SETORES + LOTES ────────────────────────────────────────────────

  console.log('🎟️  Criando jogos-setores e lotes...')

  type JogoSetorConfig = {
    setorId: string
    capacidade: number
    precoInteira: number
    precoMeia: number
    nomeInteira?: string
    nomeMeia?: string
  }

  async function criarJogoSetoresELotes(jogoId: string, isPast: boolean) {
    const configs: JogoSetorConfig[] = [
      {
        setorId: setorJk.id,
        capacidade: 4000,
        precoInteira: 40,
        precoMeia: 20,
        nomeInteira: 'Inteira JK',
        nomeMeia: 'Meia JK',
      },
      {
        setorId: setorSocial.id,
        capacidade: 2000,
        precoInteira: 45,
        precoMeia: 22.5,
        nomeInteira: 'Inteira Social',
        nomeMeia: 'Meia Social',
      },
      {
        setorId: setorNorte.id,
        capacidade: 2500,
        precoInteira: 40,
        precoMeia: 20,
        nomeInteira: 'Inteira Norte',
        nomeMeia: 'Meia Norte',
      },
      {
        setorId: setorSul.id,
        capacidade: 2500,
        precoInteira: 40,
        precoMeia: 20,
        nomeInteira: 'Inteira Sul',
        nomeMeia: 'Meia Sul',
      },
      {
        setorId: setorCativas.id,
        capacidade: 1500,
        precoInteira: 70,
        precoMeia: 35,
        nomeInteira: 'Inteira Cativas',
        nomeMeia: 'Meia Cativas',
      },
      {
        setorId: setorNorteVisitante.id,
        capacidade: 1000,
        precoInteira: 40,
        precoMeia: 20,
        nomeInteira: 'Visitante Inteira',
        nomeMeia: 'Visitante Meia',
      },
    ]

    const jogoData = await prisma.jogo.findUniqueOrThrow({ where: { id: jogoId }, select: { data: true } })
    const dataJogo = jogoData.data

    for (const cfg of configs) {
      const js = await prisma.jogoSetor.create({
        data: {
          jogoId,
          setorId: cfg.setorId,
          capacidade: cfg.capacidade,
          aberto: true,
        },
      })

      // Lote inteira
      await prisma.lote.create({
        data: {
          jogoSetorId: js.id,
          jogoId,
          nome: cfg.nomeInteira ?? 'Inteira',
          tipo: TipoLote.INTEIRA,
          quantidade: Math.floor(cfg.capacidade * 0.7),
          precoUnitario: cfg.precoInteira,
          inicioVendas: isPast ? new Date(dataJogo.getTime() - 7 * 24 * 60 * 60 * 1000) : new Date(),
          fimVendas: dataJogo,
          limitePorCPF: 4,
        },
      })

      // Lote meia
      await prisma.lote.create({
        data: {
          jogoSetorId: js.id,
          jogoId,
          nome: cfg.nomeMeia ?? 'Meia',
          tipo: TipoLote.MEIA,
          quantidade: Math.floor(cfg.capacidade * 0.25),
          precoUnitario: cfg.precoMeia,
          inicioVendas: isPast ? new Date(dataJogo.getTime() - 7 * 24 * 60 * 60 * 1000) : new Date(),
          fimVendas: dataJogo,
          limitePorCPF: 2,
        },
      })

    }
  }

  // 5 passados + 5 próximos
  for (let i = 0; i < 5; i++) await criarJogoSetoresELotes(jogos[i].id, true)
  for (let i = 5; i < 10; i++) await criarJogoSetoresELotes(jogos[i].id, false)

  // ── PEDIDOS E INGRESSOS (jogos passados) ──────────────────────────────────

  console.log('🎫  Criando pedidos e ingressos...')

  async function criarPedidoCompleto(
    torcedorId: string,
    jogoId: string,
    qtd: number,
    tipoLote: TipoLote,
    statusPedido: StatusPedido,
    statusPagamento: StatusPagamentoIngresso,
    statusIngresso: StatusIngresso,
  ) {
    // Busca primeiro lote do tipo certo para o jogo
    const lote = await prisma.lote.findFirst({
      where: { jogoId, tipo: tipoLote },
    })
    if (!lote) return

    const valorTotal = Number(lote.precoUnitario) * qtd

    const pedido = await prisma.pedido.create({
      data: {
        torcedorId,
        status: statusPedido,
        itens: {
          create: Array.from({ length: qtd }, () => ({
            loteId: lote.id,
            valorUnitario: lote.precoUnitario,
          })),
        },
      },
      include: { itens: true },
    })

    if (valorTotal > 0) {
      await prisma.pagamentoIngresso.create({
        data: {
          pedidoId: pedido.id,
          total: valorTotal,
          status: statusPagamento,
          provider: 'pagar.me',
          externalId: `pm_${randomUUID().replace(/-/g, '').slice(0, 16)}`,
        },
      })
    }

    if (statusPedido === StatusPedido.PAGO) {
      for (const item of pedido.itens) {
        const ingresso = await prisma.ingresso.create({
          data: {
            itemPedidoId: item.id,
            qrCode: qrCode(),
            status: statusIngresso,
            usadoEm: statusIngresso === StatusIngresso.USADO ? new Date() : null,
          },
        })

        if (statusIngresso === StatusIngresso.USADO) {
          await prisma.checkin.create({
            data: {
              ingressoId: ingresso.id,
              feitoPor: 'portaria@geb.com.br',
              local: 'Entrada Principal – Bento Freitas',
            },
          })
        }
      }
    }

    return pedido
  }

  // Jogo 1 (passado) – clássico contra Caxias
  const jogo1 = jogos[0]
  await criarPedidoCompleto(t1.id, jogo1.id, 2, TipoLote.INTEIRA, StatusPedido.PAGO, StatusPagamentoIngresso.APROVADO, StatusIngresso.USADO)
  await criarPedidoCompleto(t2.id, jogo1.id, 1, TipoLote.MEIA, StatusPedido.PAGO, StatusPagamentoIngresso.APROVADO, StatusIngresso.USADO)
  await criarPedidoCompleto(t4.id, jogo1.id, 2, TipoLote.INTEIRA, StatusPedido.PAGO, StatusPagamentoIngresso.APROVADO, StatusIngresso.USADO)

  // Jogo 2 (passado)
  const jogo2 = jogos[1]
  await criarPedidoCompleto(t1.id, jogo2.id, 2, TipoLote.INTEIRA, StatusPedido.PAGO, StatusPagamentoIngresso.APROVADO, StatusIngresso.USADO)
  await criarPedidoCompleto(t5.id, jogo2.id, 2, TipoLote.MEIA, StatusPedido.PAGO, StatusPagamentoIngresso.APROVADO, StatusIngresso.USADO)

  // Jogo 3 – Clássico Pelotense (passado, mais movimento)
  const jogo3 = jogos[2]
  await criarPedidoCompleto(t1.id, jogo3.id, 2, TipoLote.INTEIRA, StatusPedido.PAGO, StatusPagamentoIngresso.APROVADO, StatusIngresso.USADO)
  await criarPedidoCompleto(t2.id, jogo3.id, 2, TipoLote.MEIA, StatusPedido.PAGO, StatusPagamentoIngresso.APROVADO, StatusIngresso.USADO)
  await criarPedidoCompleto(t3.id, jogo3.id, 1, TipoLote.INTEIRA, StatusPedido.PAGO, StatusPagamentoIngresso.APROVADO, StatusIngresso.USADO)
  await criarPedidoCompleto(t4.id, jogo3.id, 3, TipoLote.INTEIRA, StatusPedido.PAGO, StatusPagamentoIngresso.APROVADO, StatusIngresso.VALIDO) // não foi
  await criarPedidoCompleto(t5.id, jogo3.id, 1, TipoLote.MEIA, StatusPedido.PAGO, StatusPagamentoIngresso.APROVADO, StatusIngresso.USADO)

  // Jogo 4
  const jogo4 = jogos[3]
  await criarPedidoCompleto(t2.id, jogo4.id, 1, TipoLote.INTEIRA, StatusPedido.PAGO, StatusPagamentoIngresso.APROVADO, StatusIngresso.USADO)
  await criarPedidoCompleto(t5.id, jogo4.id, 2, TipoLote.INTEIRA, StatusPedido.PAGO, StatusPagamentoIngresso.APROVADO, StatusIngresso.USADO)
  // Pedido cancelado (estorno)
  await criarPedidoCompleto(t4.id, jogo4.id, 1, TipoLote.MEIA, StatusPedido.CANCELADO, StatusPagamentoIngresso.ESTORNADO, StatusIngresso.CANCELADO)

  // Jogo 5 – semifinal
  const jogo5 = jogos[4]
  await criarPedidoCompleto(t1.id, jogo5.id, 2, TipoLote.INTEIRA, StatusPedido.PAGO, StatusPagamentoIngresso.APROVADO, StatusIngresso.USADO)
  await criarPedidoCompleto(t2.id, jogo5.id, 2, TipoLote.MEIA, StatusPedido.PAGO, StatusPagamentoIngresso.APROVADO, StatusIngresso.USADO)
  await criarPedidoCompleto(t5.id, jogo5.id, 1, TipoLote.INTEIRA, StatusPedido.PAGO, StatusPagamentoIngresso.APROVADO, StatusIngresso.USADO)

  // ── PEDIDOS PARA JOGOS FUTUROS ─────────────────────────────────────────────

  // Clássico Pelotense – Série C (jogo 6, próximo) – já com vendas
  const jogo6 = jogos[5]
  await criarPedidoCompleto(t1.id, jogo6.id, 2, TipoLote.INTEIRA, StatusPedido.PAGO, StatusPagamentoIngresso.APROVADO, StatusIngresso.VALIDO)
  await criarPedidoCompleto(t2.id, jogo6.id, 2, TipoLote.MEIA, StatusPedido.PAGO, StatusPagamentoIngresso.APROVADO, StatusIngresso.VALIDO)
  await criarPedidoCompleto(t5.id, jogo6.id, 2, TipoLote.INTEIRA, StatusPedido.PAGO, StatusPagamentoIngresso.APROVADO, StatusIngresso.VALIDO)
  // Pedido pendente (aguardando pagamento)
  await criarPedidoCompleto(t4.id, jogo6.id, 1, TipoLote.INTEIRA, StatusPedido.PENDENTE, StatusPagamentoIngresso.AGUARDANDO, StatusIngresso.VALIDO)

  // Jogo 7 – ABC-RN
  const jogo7 = jogos[6]
  await criarPedidoCompleto(t1.id, jogo7.id, 1, TipoLote.INTEIRA, StatusPedido.PAGO, StatusPagamentoIngresso.APROVADO, StatusIngresso.VALIDO)
  await criarPedidoCompleto(t2.id, jogo7.id, 1, TipoLote.MEIA, StatusPedido.PAGO, StatusPagamentoIngresso.APROVADO, StatusIngresso.VALIDO)

  console.log(`
✅  Seed concluído com sucesso!

📊  Resumo:
  • 3 admins (super, operacional, portaria)
  • 3 planos (básico, premium, anual)
  • 5 torcedores (2 sócios ativos, 1 inadimplente, 1 avulso, 1 anual)
  • 10 jogos (5 passados + 5 próximos) – GEB no Bento Freitas
  • 6 setores por jogo, cada um com lotes de inteira e meia
  • Pedidos, ingressos e checkins variados para os jogos passados
  • Vendas abertas para os 2 primeiros jogos futuros
  `)
}

main()
  .catch(e => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })