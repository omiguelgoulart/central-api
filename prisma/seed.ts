import { fakerPT_BR as faker } from '@faker-js/faker'
import {
  PrismaClient,
  Periodicidade,
  StatusSocio,
  StatusAssinatura,
  StatusFatura,
  MetodoPagamento,
  TipoSetor,
  StatusIngresso,
  StatusPedido,
  TipoLote,
  StatusPagamentoSocio,
  StatusPagamentoIngresso
} from '@prisma/client'

const prisma = new PrismaClient()

const subMonths = (date: Date, months: number) => {
  const d = new Date(date)
  d.setMonth(d.getMonth() - months)
  return d
}

async function main() {
  console.log('🔴⚫ INICIANDO SEED DO XAVANTE...')

  console.log('🧹 Limpando dados antigos...')
  await prisma.checkin.deleteMany()
  await prisma.ingresso.deleteMany()
  await prisma.itemPedido.deleteMany()
  await prisma.pagamentoIngresso.deleteMany()
  await prisma.pedido.deleteMany()
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

  await prisma.admin.create({
    data: {
      nome: 'Miguel Goulart',
      email: 'admin@gebrasil.com.br',
      senha: '@Senha123',
      role: 'SUPER_ADMIN',
    }
  })

  console.log('🏟️ Construindo o Bento Freitas...')
  const setoresData = [
    { nome: 'Arquibancada JK (Juscelino)', slug: 'jk', tipo: TipoSetor.ARQUIBANCADA },
    { nome: 'Arquibancada Social', slug: 'social', tipo: TipoSetor.ARQUIBANCADA },
    { nome: 'Arquibancada Norte', slug: 'norte', tipo: TipoSetor.ARQUIBANCADA },
    { nome: 'Arquibancada Sul', slug: 'sul', tipo: TipoSetor.ARQUIBANCADA },
    { nome: 'Cadeiras Cativas', slug: 'cativas', tipo: TipoSetor.CADEIRA },
    { nome: 'Arquibancada Norte (Visitante)', slug: 'norte-visitante', tipo: TipoSetor.VISITANTE },
  ]

  const setoresMap = new Map<string, { id: string; slug: string; nome: string; tipo: TipoSetor }>()
  for (const s of setoresData) {
    const setor = await prisma.setor.create({
      data: { slug: s.slug, nome: s.nome, tipo: s.tipo }
    })
    setoresMap.set(s.nome, setor)
  }

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
          create: p.beneficios.map((b) => ({
            titulo: b,
            slug: faker.helpers.slugify(`${b}-${p.nome}`).toLowerCase(),
            ativo: true
          }))
        }
      }
    })
    planos.push(plano)
  }

  console.log('⚽ Agendando jogos da Série D 2026...')
  const listaJogos = [
    {
      nome: 'Brasil x Azuriz',
      data: new Date('2026-04-05T15:30:00-03:00'),
      adv: 'Azuriz',
      passado: false,
      local: 'Estádio Bento Freitas',
      mandoBrasil: true,
    },
    {
      nome: 'Blumenau x Brasil',
      data: new Date('2026-04-12T16:00:00-03:00'),
      adv: 'Blumenau',
      passado: false,
      local: 'Estádio Ervin Blaese',
      mandoBrasil: false,
    },
    {
      nome: 'Brasil x São Joseense',
      data: new Date('2026-04-19T16:00:00-03:00'),
      adv: 'São Joseense',
      passado: false,
      local: 'Estádio Bento Freitas',
      mandoBrasil: true,
    },
    {
      nome: 'São José x Brasil',
      data: new Date('2026-04-26T16:00:00-03:00'),
      adv: 'São José',
      passado: false,
      local: 'Estádio Passo d’Areia',
      mandoBrasil: false,
    },
    {
      nome: 'Brasil x Marcílio Dias',
      data: new Date('2026-05-02T16:00:00-03:00'),
      adv: 'Marcílio Dias',
      passado: false,
      local: 'Estádio Bento Freitas',
      mandoBrasil: true,
    },
  ]

  const jogosCriados: Array<{
    id: string
    nome: string
    data: Date
    local: string
    descricao: string | null
    criadoPorId: string | null
    atualizadoPorId: string | null
    criadoEm: Date
    atualizadoEm: Date
    lotes: Array<{
      lote: {
        id: string
        nome: string
        jogoId: string
        jogoSetorId: string
        precoUnitario: number
        quantidade: number
        inicioVendas: Date
        fimVendas: Date | null
        limitePorCPF: number | null
        tipo: TipoLote
        criadoEm: Date
        atualizadoEm: Date
      }
      setorObj: {
        id: string
        slug: string
        nome: string
        tipo: TipoSetor
      }
      jogoSetor: {
        id: string
        jogoId: string
        setorId: string
        capacidade: number
        aberto: boolean
        criadoEm: Date
        atualizadoEm: Date
      }
    }>
    passado: boolean
  }> = []

  for (const j of listaJogos) {
    const jogo = await prisma.jogo.create({
      data: {
        nome: j.nome,
        data: j.data,
        local: j.local,
        descricao: `Partida da Série D contra ${j.adv}`,
      }
    })

    const lotesDoJogo = []

    for (const [nomeSetor, setorObj] of setoresMap) {
      let capacidade = 4000
      if (nomeSetor.includes('Cadeira')) capacidade = 1500
      if (nomeSetor.includes('Social')) capacidade = 2000
      if (nomeSetor.includes('Visitante')) capacidade = 1000
      if (nomeSetor.includes('Sul') || nomeSetor.includes('Norte')) capacidade = 2500

      const jogoSetor = await prisma.jogoSetor.create({
        data: {
          jogoId: jogo.id,
          setorId: setorObj.id,
          capacidade,
          aberto: true
        }
      })

      let precoBase = 40.00
      if (nomeSetor.includes('Cadeira')) precoBase = 120.00
      if (nomeSetor.includes('Social')) precoBase = 60.00
      if (nomeSetor.includes('Visitante')) precoBase = 50.00

      const lote = await prisma.lote.create({
        data: {
          nome: 'Lote 1 - Antecipado',
          jogoId: jogo.id,
          jogoSetorId: jogoSetor.id,
          precoUnitario: precoBase,
          quantidade: 500,
          inicioVendas: new Date('2026-04-01T08:00:00-03:00'),
          tipo: TipoLote.INTEIRA
        }
      })

      lotesDoJogo.push({ lote, setorObj, jogoSetor })
    }

    jogosCriados.push({ ...jogo, lotes: lotesDoJogo, passado: j.passado })
  }

  console.log('👥 Invasão da torcida Xavante (Gerando 150 torcedores)...')

  const NUM_TORCEDORES = 150
  const metodosPagamento = [
    MetodoPagamento.PIX,
    MetodoPagamento.CARTAO_CREDITO,
    MetodoPagamento.BOLETO
  ]

  const hoje = new Date()

  for (let i = 0; i < NUM_TORCEDORES; i++) {
    const sexo = faker.person.sexType()
    const nome = `${faker.person.firstName(sexo)} ${faker.person.lastName(sexo)}`
    const ehSocio = Math.random() > 0.4

    let statusSocio: StatusSocio | null = ehSocio ? StatusSocio.ATIVO : null
    if (ehSocio && Math.random() > 0.8) statusSocio = StatusSocio.INADIMPLENTE

    const torcedor = await prisma.torcedor.create({
      data: {
        nome,
        email: faker.internet.email({
          firstName: nome.split(' ')[0],
          lastName: nome.split(' ')[1]
        }),
        senha: '123',
        matricula: faker.string.numeric(6),
        cpf: faker.number.int({ min: 10000000000, max: 99999999999 }).toString(),
        telefone: faker.phone.number(),
        dataNascimento: faker.date.birthdate({ min: 16, max: 70, mode: 'age' }),
        enderecoCidade: 'Pelotas',
        enderecoUF: 'RS',
        statusSocio: ehSocio ? statusSocio : null,
      }
    })

    if (ehSocio) {
      const plano = planos[Math.floor(Math.random() * planos.length)]

      const assinatura = await prisma.assinatura.create({
        data: {
          torcedorId: torcedor.id,
          planoId: plano.id,
          status: statusSocio === StatusSocio.INADIMPLENTE
            ? StatusAssinatura.SUSPENSA
            : StatusAssinatura.ATIVA,
          inicioEm: subMonths(hoje, 8),
          valorAtual: plano.valor,
          periodicidade: plano.periodicidade,
          proximaCobrancaEm: new Date(hoje.getFullYear(), hoje.getMonth() + 1, 10)
        }
      })

      for (let m = 0; m < 6; m++) {
        const dataRef = subMonths(hoje, m)
        const vencimento = new Date(dataRef.getFullYear(), dataRef.getMonth(), 10)

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

          await prisma.pagamentoSocio.create({
            data: {
              torcedorId: torcedor.id,
              faturaId: fatura.id,
              valor: plano.valor,
              status: StatusPagamentoSocio.PAGO,
              dataVencimento: vencimento,
              pagoEm: vencimento,
              metodo: metodosPagamento[Math.floor(Math.random() * metodosPagamento.length)],
              descricao: `Mensalidade Sócio - Ref ${dataRef.getMonth() + 1}/${dataRef.getFullYear()}`
            }
          })
        } else {
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

    const chanceIrNoJogo = ehSocio ? 0.8 : 0.3

    for (const jogoData of jogosCriados) {
      if (Math.random() > chanceIrNoJogo) continue
      if (ehSocio && statusSocio === StatusSocio.INADIMPLENTE) continue

      const { lote, setorObj } = jogoData.lotes[Math.floor(Math.random() * jogoData.lotes.length)]

      const pedido = await prisma.pedido.create({
        data: {
          torcedorId: torcedor.id,
          status: StatusPedido.PAGO,
          criadoEm: jogoData.passado ? jogoData.data : new Date(),
        }
      })

      const itemPedido = await prisma.itemPedido.create({
        data: {
          pedidoId: pedido.id,
          loteId: lote.id,
          valorUnitario: lote.precoUnitario,
        }
      })

      const ingresso = await prisma.ingresso.create({
        data: {
          itemPedidoId: itemPedido.id,
          qrCode: faker.string.uuid(),
          status: jogoData.passado ? StatusIngresso.USADO : StatusIngresso.VALIDO,
          usadoEm: jogoData.passado ? jogoData.data : null,
        }
      })

      await prisma.pagamentoIngresso.create({
        data: {
          pedidoId: pedido.id,
          total: lote.precoUnitario,
          status: StatusPagamentoIngresso.APROVADO,
          provider: 'ASAAS',
          externalId: faker.string.alphanumeric(16)
        }
      })

      if (jogoData.passado) {
        await prisma.checkin.create({
          data: {
            ingressoId: ingresso.id,
            feitoEm: jogoData.data,
            local: `Catraca ${faker.number.int({ min: 1, max: 9 })} - ${setorObj.nome}`
          }
        })
      }
    }
  }

  console.log('✅ SEED FINALIZADO COM SUCESSO!')
  console.log(`📊 Total de Torcedores: ${await prisma.torcedor.count()}`)
  console.log(`🎫 Total de Ingressos: ${await prisma.ingresso.count()}`)
  console.log(`💳 Total de PagamentosIngresso: ${await prisma.pagamentoIngresso.count()}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })