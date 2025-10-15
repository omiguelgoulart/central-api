import { PrismaClient, Periodicidade, StatusSocio, StatusAssinatura, StatusFatura, MetodoPagamento } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando o seeding do banco de dados...');

  // --- 1. ADMIN DE TESTE ---
  const adminTest = await prisma.admin.upsert({
    where: { email: 'admin@clube.com' },
    update: {},
    create: {
      nome: 'Administrador Principal',
      email: 'admin@clube.com',
      // NOTA: Use uma senha real e segura em produção. Aqui é apenas para teste.
      senha: 'senha123', 
    },
  });
  console.log(`Admin de teste criado: ${adminTest.id}`);

  // --- 2. PLANOS ---
  const planosData = [
    { nome: 'Torcedor', valor: 19.90, periodicidade: Periodicidade.MENSAL, descricao: 'Plano de entrada para acesso a conteúdo e benefícios digitais exclusivos.', isFeatured: false, ordem: 1 },
    { nome: 'Arquibancada', valor: 39.90, periodicidade: Periodicidade.MENSAL, descricao: 'Nível intermediário com descontos maiores e acesso antecipado a ingressos.', isFeatured: false, ordem: 2 },
    { nome: 'Cadeira', valor: 69.90, periodicidade: Periodicidade.MENSAL, descricao: 'O plano mais popular, oferece prioridade na compra de ingressos e experiências VIP limitadas.', isFeatured: true, badgeLabel: 'Mais Popular', ordem: 3 },
    { nome: 'Camarote', valor: 129.90, periodicidade: Periodicidade.MENSAL, descricao: 'Plano premium focado na experiência de jogo, incluindo ingresso garantido em casa.', isFeatured: false, ordem: 4 },
    { nome: 'Conselheiro', valor: 249.90, periodicidade: Periodicidade.MENSAL, descricao: 'O nível mais alto de associação, oferecendo experiências exclusivas com a diretoria e participação em decisões.', isFeatured: false, ordem: 5 },
  ];

  const planosMap = new Map<string, any>();

  for (const data of planosData) {
    const plano = await prisma.plano.upsert({
      where: { nome: data.nome },
      update: data,
      create: data,
    });
    planosMap.set(data.nome, plano);
    // console.log(`Plano criado: ${plano.nome}`);
  }

  // --- 3. BENEFÍCIOS ---

  // Função auxiliar para obter o ID do plano
  const getPlanoId = (nome: string) => planosMap.get(nome)?.id;

  const beneficiosData = [
    // Torcedor
    { titulo: 'Cartelinha digital de sócio', slug: 'cartao-digital', planoNome: 'Torcedor', ordem: 1 },
    { titulo: '5% de desconto na loja oficial', slug: 'desconto-5-loja', planoNome: 'Torcedor', ordem: 2, observacao: 'Percentual de desconto exclusivo' },
    { titulo: 'Newsletters semanal com notícias', slug: 'newsletter-semanal', planoNome: 'Torcedor', ordem: 3 },
    { titulo: 'Acesso ao app exclusivo', slug: 'acesso-app-exclusivo', planoNome: 'Torcedor', ordem: 4 },
    { titulo: 'Wallpapers e conteúdo digital', slug: 'conteudo-digital', planoNome: 'Torcedor', ordem: 5 },
    
    // Arquibancada
    { titulo: 'Todos os benefícios Torcedor', slug: 'beneficios-torcedor', planoNome: 'Arquibancada', ordem: 1, observacao: 'Inclui todos os benefícios do plano anterior.' },
    { titulo: '10% de desconto na loja oficial', slug: 'desconto-10-loja', planoNome: 'Arquibancada', ordem: 2 },
    { titulo: 'Acesso antecipado a ingressos', slug: 'acesso-antecipado-ingressos', planoNome: 'Arquibancada', ordem: 3 },
    { titulo: 'Sorteios mensais de produtos', slug: 'sorteios-mensais', planoNome: 'Arquibancada', ordem: 4 },
    { titulo: 'Participação em eventos do clube', slug: 'eventos-clube', planoNome: 'Arquibancada', ordem: 5 },

    // Cadeira
    { titulo: 'Todos os benefícios Arquibancada', slug: 'beneficios-arquibancada', planoNome: 'Cadeira', ordem: 1 },
    { titulo: '15% de desconto na loja oficial', slug: 'desconto-15-loja', planoNome: 'Cadeira', ordem: 2 },
    { titulo: 'Prioridade na compra de ingressos', slug: 'prioridade-compra-ingressos', planoNome: 'Cadeira', ordem: 3, destaque: true },
    { titulo: 'Conteúdo exclusivo dos treinos', slug: 'conteudo-exclusivo-treinos', planoNome: 'Cadeira', ordem: 4 },
    { titulo: 'Acesso a eventos VIP', slug: 'acesso-eventos-vip', planoNome: 'Cadeira', ordem: 5 },
    { titulo: 'Visita ao centro de treinamento', slug: 'visita-ct', planoNome: 'Cadeira', ordem: 6 },
    { titulo: 'Meet & Greet com jogadores (sorteio)', slug: 'meet-greet', planoNome: 'Cadeira', ordem: 7 },

    // Camarote
    { titulo: 'Todos os benefícios Cadeira', slug: 'beneficios-cadeira', planoNome: 'Camarote', ordem: 1 },
    { titulo: '20% de desconto na loja oficial', slug: 'desconto-20-loja', planoNome: 'Camarote', ordem: 2 },
    { titulo: 'Ingresso garantido para jogos em casa', slug: 'ingresso-garantido-casa', planoNome: 'Camarote', ordem: 3, destaque: true },
    { titulo: 'Kit premium de boas-vindas', slug: 'kit-boas-vindas', planoNome: 'Camarote', ordem: 4 },
    { titulo: 'Acesso ilimitado a eventos VIP', slug: 'acesso-ilimitado-vip', planoNome: 'Camarote', ordem: 5 },
    { titulo: 'Tour exclusivo pelo estádio', slug: 'tour-exclusivo-estadio', planoNome: 'Camarote', ordem: 6 },
    { titulo: 'Encontro com ídolos do clube', slug: 'encontro-idolos', planoNome: 'Camarote', ordem: 7 },
    { titulo: 'Convite para coletivas de imprensa', slug: 'convite-coletivas', planoNome: 'Camarote', ordem: 8 },

    // Conselheiro
    { titulo: 'Todos os benefícios Camarote', slug: 'beneficios-camarote-conselheiro', planoNome: 'Conselheiro', ordem: 1 }, // Slug alterado para não conflitar com o de cima
    { titulo: '25% de desconto na loja oficial', slug: 'desconto-25-loja', planoNome: 'Conselheiro', ordem: 2, destaque: true },
    { titulo: 'Ingresso garantido para todos os jogos', slug: 'ingresso-garantido-todos', planoNome: 'Conselheiro', ordem: 3, destaque: true },
    { titulo: 'Acesso ao camarote presidencial', slug: 'acesso-camarote-presidencial', planoNome: 'Conselheiro', ordem: 4 },
    { titulo: 'Kit premium anual exclusivo', slug: 'kit-premium-anual', planoNome: 'Conselheiro', ordem: 5 },
    { titulo: 'Jantar com diretoria e comissão técnica', slug: 'jantar-diretoria', planoNome: 'Conselheiro', ordem: 6 },
    { titulo: 'Participação em decisões do clube', slug: 'participacao-decisoes', planoNome: 'Conselheiro', ordem: 7 },
    { titulo: 'Nome no mural de honra do estádio', slug: 'nome-mural-estadio', planoNome: 'Conselheiro', ordem: 8 },
    { titulo: 'Experiência VIP em jogos especiais', slug: 'experiencia-vip-jogos-especiais', planoNome: 'Conselheiro', ordem: 9 },
  ];

  for (const data of beneficiosData) {
    const planoId = getPlanoId(data.planoNome);
    
    // Remove 'planoNome' antes de enviar para o Prisma
    const { planoNome, ...restOfData } = data; 
    
    if (planoId) {
      await prisma.beneficio.upsert({
        where: { slug: data.slug },
        update: { ...restOfData, planoId: planoId },
        create: {
          ...restOfData,
          planoId: planoId,
          destaque: data.destaque ?? false,
        },
      });
    }
  }
  
  // --- 4. TORCEDORES DE TESTE ---
  const planoTorcedorId = getPlanoId('Torcedor');
  const planoCadeiraId = getPlanoId('Cadeira');
  
  const torcedorAtivo = await prisma.torcedor.upsert({
    where: { email: 'ativo@teste.com' },
    update: { planoId: planoCadeiraId, status: StatusSocio.ATIVO },
    create: {
      nome: 'Maria Ativa',
      email: 'ativo@teste.com',
      senha: '123',
      matricula: '0001',
      cpf: '111.111.111-11',
      dataNasc: new Date('1990-05-15'),
      planoId: planoCadeiraId,
      status: StatusSocio.ATIVO,
    },
  });
  console.log(`Torcedor de teste ATIVO criado: ${torcedorAtivo.id}`);
  
  const torcedorInadimplente = await prisma.torcedor.upsert({
    where: { email: 'inadimplente@teste.com' },
    update: { planoId: planoTorcedorId, status: StatusSocio.INADIMPLENTE },
    create: {
      nome: 'João Inadimplente',
      email: 'inadimplente@teste.com',
      senha: '123',
      matricula: '0002',
      cpf: '222.222.222-22',
      dataNasc: new Date('1985-11-20'),
      planoId: planoTorcedorId,
      status: StatusSocio.INADIMPLENTE,
    },
  });
  console.log(`Torcedor de teste INADIMPLENTE criado: ${torcedorInadimplente.id}`);

  // --- 5. ASSINATURA DE TESTE ---
  const dataInicio = new Date('2025-10-01');
  const proximaCobranca = new Date('2025-11-01');
  const dataExpiracao = new Date('2026-10-01');

  const assinaturaAtiva = await prisma.assinatura.upsert({
    where: { id: 'assinatura-ativa-teste' },
    update: { torcedorId: torcedorAtivo.id, planoId: planoCadeiraId },
    create: {
      id: 'assinatura-ativa-teste',
      torcedorId: torcedorAtivo.id,
      planoId: planoCadeiraId,
      status: StatusAssinatura.ATIVA,
      inicioEm: dataInicio,
      expiraEm: dataExpiracao,
      proximaCobrancaEm: proximaCobranca,
    },
  });
  console.log(`Assinatura de teste criada: ${assinaturaAtiva.id}`);

  // --- 6. FATURA E PAGAMENTO DE TESTE ---
  const faturaValor = planosMap.get('Cadeira')?.valor ?? 69.90;

  const faturaPaga = await prisma.fatura.upsert({
    where: { referencia: 'FAT-202509-001' },
    update: { status: StatusFatura.PAGA, valor: faturaValor },
    create: {
      assinaturaId: assinaturaAtiva.id,
      competencia: '2025-09',
      valor: faturaValor,
      status: StatusFatura.PAGA,
      vencimentoEm: new Date('2025-09-10'),
      pagoEm: new Date('2025-09-08'),
      referencia: 'FAT-202509-001',
      metodo: MetodoPagamento.PIX,
    },
  });
  console.log(`Fatura paga de teste criada: ${faturaPaga.id}`);

  await prisma.pagamento.upsert({
    where: { id: 'pgto-202509-001' },
    update: { faturaId: faturaPaga.id },
    create: {
      id: 'pgto-202509-001',
      socioId: torcedorAtivo.id,
      faturaId: faturaPaga.id,
      valor: faturaValor,
      status: 'PAGO',
      dataVencimento: new Date('2025-09-10'),
      pagoEm: new Date('2025-09-08'),
      metodo: MetodoPagamento.PIX,
      descricao: 'Pagamento de Mensalidade 09/2025',
    },
  });
  console.log('Pagamento de teste criado.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('Seeding concluído com sucesso! 🎉');
  });