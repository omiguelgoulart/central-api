import { prisma } from "../src/lib/prisma";
import { Periodicidade, StatusSocio, StatusAssinatura, StatusFatura, MetodoPagamento, TipoSetor, StatusIngresso, StatusPedido, TipoLote, StatusPagamentoSocio } from '@prisma/client'
import { fakerPT_BR as faker } from '@faker-js/faker'

// Utilitário para datas
const subMonths = (date: Date, months: number) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() - months);
  return d;
}

async function main() {
  console.log('🔴⚫ INICIANDO SEED DO XAVANTE...')

  // 1. LIMPEZA DO BANCO
  console.log('🧹 Limpando dados antigos...')
  await prisma.checkin.deleteMany()
  await prisma.ingresso.deleteMany()
  await prisma.itemPedido.deleteMany()
  await prisma.pedido.deleteMany()
  await prisma.pagamentoIngresso.deleteMany()
  await prisma.pagamentoSocio.deleteMany()
  await prisma.fatura.deleteMany()
  await prisma.assinatura.deleteMany()
  await prisma.beneficio.deleteMany()
  await prisma.lote.deleteMany()
  await prisma.jogoSetor.deleteMany()
  await prisma.jogo.deleteMany()
  await prisma.setor.deleteMany()
  await prisma.plano.deleteMany()
  await prisma.torcedor.deleteMany()
  await prisma.admin.deleteMany()

  // 2. ADMIN
  await prisma.admin.create({
    data: {
      nome: 'Miguel Goulart',
      email: 'admin@gebrasil.com.br',
      senha: '@Senha123', // Senha hash ficticia
      role: 'SUPER_ADMIN',
    }
  })

  // 3. SETORES (BENTO FREITAS)
  console.log('🏟️  Construindo o Bento Freitas...')
  const setoresData = [
    {
      nome: "Arquibancada JK (Juscelino)",
      slug: "jk",
      tipo: TipoSetor.ARQUIBANCADA,
    },
    {
      nome: "Arquibancada Social",
      slug: "social",
      tipo: TipoSetor.ARQUIBANCADA,
    },
    {
      nome: "Arquibancada Norte",
      slug: "norte",
      tipo: TipoSetor.ARQUIBANCADA,
    },
    {
      nome: "Arquibancada Sul",
      slug: "sul",
      tipo: TipoSetor.ARQUIBANCADA,
    },
    {
      nome: "Cadeiras Cativas",
      slug: "cativas",
      tipo: TipoSetor.CADEIRA,
    },
    {
      nome: "Arquibancada Norte (Visitante)",
      slug: "norte-visitante",
      tipo: TipoSetor.VISITANTE,
    },
  ];

  const setoresMap = new Map()
  for (const s of setoresData) {
    const setor = await prisma.setor.create({ data: { slug: s.slug, nome: s.nome } })
    setoresMap.set(s.nome, setor)
  }

  // 4. PLANOS DE SÓCIO
  console.log('💳 Criando planos de sócio...')
  const planosData = [
    {
      nome: 'Sócio Xavante Popular',
      valor: 49.90,
      periodicidade: Periodicidade.MENSAL,
      beneficios: ['Acesso Arquibancada Norte', 'Carteirinha Digital']
    },
    {
      nome: 'Sócio Coração Xavante',
      valor: 89.90,
      periodicidade: Periodicidade.MENSAL,
      beneficios: ['Acesso Total Arquibancadas', 'Camisa Oficial 2025', 'Desconto Rede Parceiros']
    },
    {
      nome: 'Sócio Avante (Cadeira)',
      valor: 159.90,
      periodicidade: Periodicidade.MENSAL,
      beneficios: ['Cadeira Cativa Garantida', 'Acesso VIP', 'Estacionamento', 'Kit Boas-vindas']
    },
    {
      nome: 'Sócio Torcedor Vitalício',
      valor: 999.90,
      periodicidade: Periodicidade.ANUAL,
      beneficios: ['Cadeira Cativa Vitalícia', 'Acesso VIP + Lounge', 'Estacionamento Premium', 'Camisa Autografada', 'Visita ao Clube']
    },
    {
      nome: 'Sócio Estudante Xavante',
      valor: 29.90,
      periodicidade: Periodicidade.MENSAL,
      beneficios: ['Acesso Arquibancada Norte', 'Carteirinha Digital', 'Desconto em Lojas Parceiras']
    },
    {
      nome: 'Sócio Xavante Social',
      valor: 9.90,
      periodicidade: Periodicidade.MENSAL,
      beneficios: ['Acesso a Eventos Exclusivos', 'Descontos em Produtos Oficiais', 'Carteirinha Digital']
    }
  ]

  const planos = []
  for (const p of planosData) {
    const plano = await prisma.plano.create({
      data: {
        nome: p.nome,
        valor: p.valor,
        periodicidade: p.periodicidade,
        beneficios: {
          create: p.beneficios.map(b => ({
            titulo: b,
            slug: faker.helpers.slugify(b + '-' + p.nome).toLowerCase(),
            ativo: true
          }))
        }
      }
    })
    planos.push(plano)
  }

  // 5. CALENDÁRIO DE JOGOS (Passado e Futuro)
  console.log('⚽ Agendando jogos do Gauchão e Série D...')
  const hoje = new Date()

  const listaJogos = [
    // Jogos Passados (Terão checkins e status USADO)
    { nome: 'Brasil x São Luiz', data: subMonths(hoje, 2), adv: 'São Luiz', passado: true },
    { nome: 'Brasil x Ypiranga', data: subMonths(hoje, 1), adv: 'Ypiranga', passado: true },
    { nome: 'Brasil x Novo Hamburgo', data: new Date(hoje.getTime() - 86400000 * 7), adv: 'Novo Hamburgo', passado: true }, // 7 dias atrás

    // Jogos Futuros (Venda aberta)
    { nome: 'Brasil x Pelotas (BRA-PEL)', data: new Date(hoje.getTime() + 86400000 * 3), adv: 'Pelotas', passado: false, classico: true },
    { nome: 'Brasil x Internacional', data: new Date(hoje.getTime() + 86400000 * 10), adv: 'Internacional', passado: false },
    { nome: 'Brasil x Caxias', data: new Date(hoje.getTime() + 86400000 * 17), adv: 'Caxias', passado: false },
  ]

  const jogosCriados = []

  for (const j of listaJogos) {
    const jogo = await prisma.jogo.create({
      data: {
        nome: j.nome,
        data: j.data,
        local: 'Estádio Bento Freitas',
        descricao: j.classico ? 'O maior clássico do interior!' : `Rodada do campeonato contra ${j.adv}`,
      }
    })

    // Criar Lotes e Setores para o jogo
    const lotesDoJogo = []
    for (const [nomeSetor, setorObj] of setoresMap) {
      const jogoSetor = await prisma.jogoSetor.create({
        data: {
          jogoId: jogo.id,
          setorId: setorObj.id,
          capacidade: nomeSetor === "Arquibancada Norte (Visitante)" ? 1000 : 2500,
        }
      })

      // Preço dinâmico (mais caro no clássico)
      let precoBase = 40.00
      if (nomeSetor.includes('Cadeira')) precoBase = 120.00
      if (j.classico) precoBase *= 1.5

      const lote = await prisma.lote.create({
        data: {
          nome: 'Lote 1 - Antecipado',
          jogoId: jogo.id,
          jogoSetorId: jogoSetor.id,
          precoUnitario: precoBase,
          quantidade: 500,
          inicioVendas: subMonths(hoje, 3), // Vendas começaram 3 meses atrás
          tipo: TipoLote.INTEIRA
        }
      })
      lotesDoJogo.push({ lote, setorObj, jogoSetor })
    }

    jogosCriados.push({ ...jogo, lotes: lotesDoJogo, passado: j.passado })
  }

  // 6. POPULAÇÃO DE TORCEDORES (A parte pesada)
  console.log('👥 Invasão da torcida Xavante (Gerando 50 torcedores)...')

  const NUM_TORCEDORES = 50
  const metodosPagamento = [MetodoPagamento.PIX, MetodoPagamento.CARTAO_CREDITO, MetodoPagamento.BOLETO]

  for (let i = 0; i < NUM_TORCEDORES; i++) {
    const sexo = faker.person.sexType()
    const nome = faker.person.firstName(sexo) + ' ' + faker.person.lastName(sexo)
    const ehSocio = Math.random() > 0.4 // 60% são sócios

    // Status do sócio (alguns inadimplentes)
    let statusSocio: StatusSocio | null = ehSocio ? StatusSocio.ATIVO : null
    if (ehSocio && Math.random() > 0.8) statusSocio = StatusSocio.INADIMPLENTE

    const torcedor = await prisma.torcedor.create({
      data: {
        nome,
        email: faker.internet.email({ firstName: nome.split(' ')[0], lastName: nome.split(' ')[1] }),
        senha: '123',
        matricula: ehSocio ? faker.string.numeric(6) : faker.string.numeric(8), // sócios tem matrícula menor rs
        cpf: faker.number.int({ min: 10000000000, max: 99999999999 }).toString(),
        telefone: faker.phone.number(),
        dataNascimento: faker.date.birthdate({ min: 16, max: 70, mode: 'age' }),
        enderecoCidade: 'Pelotas',
        enderecoUF: 'RS',
        statusSocio: ehSocio ? statusSocio : null,
        criadoEm: faker.date.past({ years: 2 })
      }
    })

    // === SE FOR SÓCIO: GERAR ASSINATURA E HISTÓRICO DE FATURAS ===
    if (ehSocio) {
      const plano = planos[Math.floor(Math.random() * planos.length)]

      const assinatura = await prisma.assinatura.create({
        data: {
          torcedorId: torcedor.id,
          planoId: plano.id,
          status: statusSocio === StatusSocio.INADIMPLENTE ? StatusAssinatura.SUSPENSA : StatusAssinatura.ATIVA,
          inicioEm: subMonths(hoje, 8), // Sócio há 8 meses
          valorAtual: plano.valor,
          periodicidade: Periodicidade.MENSAL,
          proximaCobrancaEm: new Date(hoje.getFullYear(), hoje.getMonth() + 1, 10)
        }
      })

      // Gerar faturas dos últimos 6 meses
      for (let m = 0; m < 6; m++) {
        const dataRef = subMonths(hoje, m)
        const vencimento = new Date(dataRef.getFullYear(), dataRef.getMonth(), 10)

        // Lógica de pagamento:
        // Se o sócio é INADIMPLENTE, ele não pagou as últimas 2 faturas (m=0 e m=1)
        let estaPaga = true
        if (statusSocio === StatusSocio.INADIMPLENTE && m < 2) estaPaga = false

        if (estaPaga) {
          const fatura = await prisma.fatura.create({
            data: {
              assinaturaId: assinatura.id,
              competencia: `${dataRef.getFullYear()}-${(dataRef.getMonth() + 1).toString().padStart(2, '0')}`,
              valor: plano.valor,
              status: StatusFatura.PAGA,
              vencimentoEm: vencimento,
              pagoEm: vencimento,
              metodo: metodosPagamento[Math.floor(Math.random() * metodosPagamento.length)],
            }
          })

          // Criar pagamento socio associado
          await prisma.pagamentoSocio.create({
            data: {
              faturaId: fatura.id,
              torcedorId: torcedor.id,
              valor: plano.valor,
              status: StatusPagamentoSocio.PAGO,
              dataVencimento: vencimento,
              pagoEm: vencimento,
              metodo: metodosPagamento[Math.floor(Math.random() * metodosPagamento.length)],
              descricao: `Mensalidade Sócio - Ref ${dataRef.getMonth() + 1}/${dataRef.getFullYear()}`
            }
          })
        } else {
          // Fatura em aberto/atrasada
          await prisma.fatura.create({
            data: {
              assinaturaId: assinatura.id,
              competencia: `${dataRef.getFullYear()}-${(dataRef.getMonth() + 1).toString().padStart(2, '0')}`,
              valor: plano.valor,
              status: vencimento < hoje ? StatusFatura.ATRASADA : StatusFatura.ABERTA,
              vencimentoEm: vencimento,
              metodo: MetodoPagamento.BOLETO
            }
          })
        }
      }
    }

    // === COMPRA DE INGRESSOS (PARA SÓCIOS E NÃO SÓCIOS) ===
    // Sócio vai em 80% dos jogos, não sócio vai em 30%
    const chanceIrNoJogo = ehSocio ? 0.8 : 0.3

    for (const jogoData of jogosCriados) {
      if (Math.random() > chanceIrNoJogo) continue; // Pulou esse jogo

      // Se for sócio inadimplente, não compra ingresso
      if (ehSocio && statusSocio === StatusSocio.INADIMPLENTE) continue;

      // Escolher um lote aleatório do jogo
      const { lote } = jogoData.lotes[Math.floor(Math.random() * jogoData.lotes.length)]

      // Criar Pedido
      const pedido = await prisma.pedido.create({
        data: {
          torcedorId: torcedor.id,
          status: StatusPedido.PAGO,
          criadoEm: jogoData.passado ? subMonths(jogoData.data, 0) : new Date(),
        }
      })

      // Criar ItemPedido
      const itemPedido = await prisma.itemPedido.create({
        data: {
          pedidoId: pedido.id,
          loteId: lote.id,
          valorUnitario: lote.precoUnitario,
        }
      })

      // Criar Ingresso
      const ingresso = await prisma.ingresso.create({
        data: {
          itemPedidoId: itemPedido.id,
          qrCode: faker.string.uuid(),
          status: jogoData.passado ? StatusIngresso.USADO : StatusIngresso.VALIDO,
          usadoEm: jogoData.passado ? jogoData.data : null,
        }
      })

      // === SE O JOGO JÁ PASSOU, FAZ O CHECKIN NA CATRACA ===
      if (jogoData.passado) {
        await prisma.checkin.create({
          data: {
            ingressoId: ingresso.id,
            feitoEm: jogoData.data,
            local: `Catraca 0${faker.number.int({ min: 1, max: 9 })}`
          }
        })
      }
    }
  }

  console.log('✅ SEED FINALIZADO COM SUCESSO!')
  console.log(`📊 Total de Torcedores: ${await prisma.torcedor.count()}`)
  console.log(`🎫 Total de Ingressos: ${await prisma.ingresso.count()}`)
  console.log(`💰 Total de Faturas: ${await prisma.fatura.count()}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

