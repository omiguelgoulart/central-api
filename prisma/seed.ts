import { prisma } from "../src/lib/prisma";

type SeedJogo = {
  nome: string;
  data: Date;
  local: string;
  descricao?: string;
};

type SeedPlano = {
  nome: string;
  descricao?: string;
  valor: number;
  periodicidade: "MENSAL" | "TRIMESTRAL" | "SEMESTRAL" | "ANUAL";
  isFeatured?: boolean;
  badgeLabel?: string;
  ordem: number;
};

type SeedBeneficio = {
  slug: string;
  titulo: string;
  descricao?: string;
  icone?: string;
  ativo?: boolean;
  ordem: number;
  destaque?: boolean;
  observacao?: string;
  planoNome: string;
};

type SeedSetor = {
  slug: string;
  nome: string;
  tipo: "ARQUIBANCADA" | "CADEIRA" | "CAMAROTE" | "VISITANTE" | "ACESSIVEL";
};

type SeedJogoSetor = {
  jogoNome: string;
  setorSlug: string;
  capacidade: number;
  aberto: boolean;
};

const jogosBrasilDePelotas: SeedJogo[] = [
  {
    nome: "Brasil x Caxias",
    data: new Date("2026-04-12T19:00:00.000Z"),
    local: "Estadio Bento Freitas, Pelotas",
    descricao: "Campeonato Brasileiro Serie D 2026",
  },
  {
    nome: "Brasil x Sao Jose-RS",
    data: new Date("2026-04-26T19:00:00.000Z"),
    local: "Estadio Bento Freitas, Pelotas",
    descricao: "Campeonato Brasileiro Serie D 2026",
  },
  {
    nome: "Brasil x Novo Hamburgo",
    data: new Date("2026-05-10T19:00:00.000Z"),
    local: "Estadio Bento Freitas, Pelotas",
    descricao: "Campeonato Brasileiro Serie D 2026",
  },
  {
    nome: "Brasil x Avenida",
    data: new Date("2026-05-24T19:00:00.000Z"),
    local: "Estadio Bento Freitas, Pelotas",
    descricao: "Campeonato Brasileiro Serie D 2026",
  },
  {
    nome: "Brasil x Aimore",
    data: new Date("2026-06-07T19:00:00.000Z"),
    local: "Estadio Bento Freitas, Pelotas",
    descricao: "Campeonato Brasileiro Serie D 2026",
  },
];

const planos: SeedPlano[] = [
  {
    nome: "Xavante",
    descricao: "Plano de entrada para apoiar o Brasil em todos os jogos.",
    valor: 19.9,
    periodicidade: "MENSAL",
    ordem: 1,
  },
  {
    nome: "Rubro Negro",
    descricao: "Mais vantagens em ingressos e prioridade na compra no Bento Freitas.",
    valor: 39.9,
    periodicidade: "MENSAL",
    isFeatured: true,
    badgeLabel: "Mais querido",
    ordem: 2,
  },
  {
    nome: "Bento Freitas",
    descricao: "Plano premium para quem vive o Xavante todos os dias.",
    valor: 69.9,
    periodicidade: "MENSAL",
    badgeLabel: "Experiencia",
    ordem: 3,
  },
];

const beneficios: SeedBeneficio[] = [
  {
    slug: "xavante-desconto-ingresso",
    titulo: "10% de desconto em ingressos no Bento Freitas",
    descricao: "Desconto aplicado na compra de ingressos selecionados.",
    ordem: 1,
    destaque: true,
    planoNome: "Xavante",
  },
  {
    slug: "xavante-carteirinha-digital",
    titulo: "Carteirinha digital rubro-negra",
    descricao: "Acesso rapido no app com QR Code de socio.",
    ordem: 2,
    planoNome: "Xavante",
  },
  {
    slug: "rubro-negro-prioridade-compra",
    titulo: "Prioridade na compra de mandos do Xavante",
    descricao: "Janela antecipada para compra de ingressos.",
    ordem: 1,
    destaque: true,
    planoNome: "Rubro Negro",
  },
  {
    slug: "rubro-negro-desconto-loja",
    titulo: "15% na loja oficial",
    descricao: "Desconto em produtos oficiais participantes.",
    ordem: 2,
    planoNome: "Rubro Negro",
  },
  {
    slug: "bento-freitas-prioridade-maxima",
    titulo: "Prioridade maxima em jogos decisivos",
    descricao: "Abertura exclusiva para classicos e decisoes.",
    ordem: 1,
    destaque: true,
    planoNome: "Bento Freitas",
  },
  {
    slug: "bento-freitas-experiencias-exclusivas",
    titulo: "Experiencias exclusivas no estadio",
    descricao: "Sorteios para visitas, tunel de acesso e eventos do clube.",
    ordem: 2,
    planoNome: "Bento Freitas",
  },
];

const setores: SeedSetor[] = [
  {
    slug: "arquibancada-lobo",
    nome: "Arquibancada Lobo",
    tipo: "ARQUIBANCADA",
  },
  {
    slug: "arquibancada-central",
    nome: "Arquibancada Central",
    tipo: "ARQUIBANCADA",
  },
  {
    slug: "cadeira-coberta",
    nome: "Cadeira Coberta",
    tipo: "CADEIRA",
  },
  {
    slug: "camarote-rubronegro",
    nome: "Camarote Rubro-Negro",
    tipo: "CAMAROTE",
  },
  {
    slug: "visitante",
    nome: "Setor Visitante",
    tipo: "VISITANTE",
  },
  {
    slug: "acessivel",
    nome: "Setor Acessivel",
    tipo: "ACESSIVEL",
  },
];

const jogosSetores: SeedJogoSetor[] = [
  { jogoNome: "Brasil x Caxias", setorSlug: "arquibancada-lobo", capacidade: 4500, aberto: true },
  { jogoNome: "Brasil x Caxias", setorSlug: "arquibancada-central", capacidade: 3200, aberto: true },
  { jogoNome: "Brasil x Caxias", setorSlug: "cadeira-coberta", capacidade: 1400, aberto: true },
  { jogoNome: "Brasil x Caxias", setorSlug: "camarote-rubronegro", capacidade: 280, aberto: true },
  { jogoNome: "Brasil x Caxias", setorSlug: "visitante", capacidade: 1200, aberto: true },
  { jogoNome: "Brasil x Caxias", setorSlug: "acessivel", capacidade: 180, aberto: true },

  { jogoNome: "Brasil x Sao Jose-RS", setorSlug: "arquibancada-lobo", capacidade: 4300, aberto: true },
  { jogoNome: "Brasil x Sao Jose-RS", setorSlug: "arquibancada-central", capacidade: 3000, aberto: true },
  { jogoNome: "Brasil x Sao Jose-RS", setorSlug: "cadeira-coberta", capacidade: 1300, aberto: true },
  { jogoNome: "Brasil x Sao Jose-RS", setorSlug: "camarote-rubronegro", capacidade: 260, aberto: true },
  { jogoNome: "Brasil x Sao Jose-RS", setorSlug: "visitante", capacidade: 1000, aberto: true },
  { jogoNome: "Brasil x Sao Jose-RS", setorSlug: "acessivel", capacidade: 180, aberto: true },

  { jogoNome: "Brasil x Novo Hamburgo", setorSlug: "arquibancada-lobo", capacidade: 4200, aberto: true },
  { jogoNome: "Brasil x Novo Hamburgo", setorSlug: "arquibancada-central", capacidade: 2900, aberto: true },
  { jogoNome: "Brasil x Novo Hamburgo", setorSlug: "cadeira-coberta", capacidade: 1250, aberto: true },
  { jogoNome: "Brasil x Novo Hamburgo", setorSlug: "camarote-rubronegro", capacidade: 250, aberto: true },
  { jogoNome: "Brasil x Novo Hamburgo", setorSlug: "visitante", capacidade: 900, aberto: true },
  { jogoNome: "Brasil x Novo Hamburgo", setorSlug: "acessivel", capacidade: 180, aberto: true },

  { jogoNome: "Brasil x Avenida", setorSlug: "arquibancada-lobo", capacidade: 4100, aberto: true },
  { jogoNome: "Brasil x Avenida", setorSlug: "arquibancada-central", capacidade: 2850, aberto: true },
  { jogoNome: "Brasil x Avenida", setorSlug: "cadeira-coberta", capacidade: 1200, aberto: true },
  { jogoNome: "Brasil x Avenida", setorSlug: "camarote-rubronegro", capacidade: 230, aberto: true },
  { jogoNome: "Brasil x Avenida", setorSlug: "visitante", capacidade: 850, aberto: true },
  { jogoNome: "Brasil x Avenida", setorSlug: "acessivel", capacidade: 180, aberto: true },

  { jogoNome: "Brasil x Aimore", setorSlug: "arquibancada-lobo", capacidade: 4400, aberto: true },
  { jogoNome: "Brasil x Aimore", setorSlug: "arquibancada-central", capacidade: 3100, aberto: true },
  { jogoNome: "Brasil x Aimore", setorSlug: "cadeira-coberta", capacidade: 1350, aberto: true },
  { jogoNome: "Brasil x Aimore", setorSlug: "camarote-rubronegro", capacidade: 270, aberto: true },
  { jogoNome: "Brasil x Aimore", setorSlug: "visitante", capacidade: 1100, aberto: true },
  { jogoNome: "Brasil x Aimore", setorSlug: "acessivel", capacidade: 180, aberto: true },
];

async function removerJogosSelecaoAntigos() {
  const nomesSelecaoAntigos = [
    "Brasil x Equador",
    "Brasil x Paraguai",
    "Brasil x Chile",
    "Brasil x Bolivia",
    "Brasil x Argentina",
  ];

  await prisma.jogo.deleteMany({
    where: {
      nome: {
        in: nomesSelecaoAntigos,
      },
    },
  });
}

async function normalizarPlanosLegados() {
  const renomeacoes: Array<{ de: string; para: string }> = [
    { de: "Fan", para: "Xavante" },
    { de: "Apaixonado", para: "Rubro Negro" },
    { de: "Nacao", para: "Bento Freitas" },
  ];

  for (const item of renomeacoes) {
    const planoAntigo = await prisma.plano.findUnique({
      where: { nome: item.de },
      select: { id: true },
    });

    if (!planoAntigo) {
      continue;
    }

    const planoNovo = await prisma.plano.findUnique({
      where: { nome: item.para },
      select: { id: true },
    });

    if (planoNovo) {
      await prisma.beneficio.updateMany({
        where: { planoId: planoAntigo.id },
        data: { planoId: planoNovo.id },
      });

      await prisma.plano.deleteMany({
        where: {
          id: planoAntigo.id,
          assinaturas: { none: {} },
        },
      });

      continue;
    }

    await prisma.plano.update({
      where: { id: planoAntigo.id },
      data: { nome: item.para },
    });
  }
}

async function removerBeneficiosLegados() {
  const slugsLegados = [
    "fan-desconto-ingresso",
    "fan-carteirinha-digital",
    "apaixonado-prioridade-compra",
    "apaixonado-desconto-loja",
    "nacao-prioridade-maxima",
    "nacao-experiencias-exclusivas",
  ];

  await prisma.beneficio.deleteMany({
    where: {
      slug: {
        in: slugsLegados,
      },
    },
  });
}

async function seedJogosBrasilDePelotas() {
  let criados = 0;

  for (const jogo of jogosBrasilDePelotas) {
    const existente = await prisma.jogo.findFirst({
      where: {
        nome: jogo.nome,
        data: jogo.data,
      },
      select: { id: true },
    });

    if (existente) {
      continue;
    }

    await prisma.jogo.create({
      data: {
        nome: jogo.nome,
        data: jogo.data,
        local: jogo.local,
        descricao: jogo.descricao,
      },
    });

    criados += 1;
  }

  const total = await prisma.jogo.count();
  return { criados, total };
}

async function seedSetores() {
  let processados = 0;

  for (const setor of setores) {
    await prisma.setor.upsert({
      where: { slug: setor.slug },
      update: {
        nome: setor.nome,
        tipo: setor.tipo,
      },
      create: {
        slug: setor.slug,
        nome: setor.nome,
        tipo: setor.tipo,
      },
    });

    processados += 1;
  }

  const total = await prisma.setor.count();
  return { processados, total };
}

async function seedJogosSetores() {
  const jogos = await prisma.jogo.findMany({
    select: { id: true, nome: true },
  });
  const setoresCadastrados = await prisma.setor.findMany({
    select: { id: true, slug: true },
  });

  const jogoIdPorNome = new Map(jogos.map((jogo) => [jogo.nome, jogo.id]));
  const setorIdPorSlug = new Map(setoresCadastrados.map((setor) => [setor.slug, setor.id]));

  let processados = 0;

  for (const jogoSetor of jogosSetores) {
    const jogoId = jogoIdPorNome.get(jogoSetor.jogoNome);
    const setorId = setorIdPorSlug.get(jogoSetor.setorSlug);

    if (!jogoId) {
      throw new Error(`Jogo nao encontrado para jogoSetor: ${jogoSetor.jogoNome}`);
    }
    if (!setorId) {
      throw new Error(`Setor nao encontrado para jogoSetor: ${jogoSetor.setorSlug}`);
    }

    await prisma.jogoSetor.upsert({
      where: {
        jogoId_setorId: {
          jogoId,
          setorId,
        },
      },
      update: {
        capacidade: jogoSetor.capacidade,
        aberto: jogoSetor.aberto,
      },
      create: {
        jogoId,
        setorId,
        capacidade: jogoSetor.capacidade,
        aberto: jogoSetor.aberto,
      },
    });

    processados += 1;
  }

  const total = await prisma.jogoSetor.count();
  return { processados, total };
}

async function seedPlanos() {
  let criados = 0;

  for (const plano of planos) {
    await prisma.plano.upsert({
      where: { nome: plano.nome },
      update: {
        descricao: plano.descricao,
        valor: plano.valor,
        periodicidade: plano.periodicidade,
        isFeatured: plano.isFeatured ?? false,
        badgeLabel: plano.badgeLabel,
        ordem: plano.ordem,
      },
      create: {
        nome: plano.nome,
        descricao: plano.descricao,
        valor: plano.valor,
        periodicidade: plano.periodicidade,
        isFeatured: plano.isFeatured ?? false,
        badgeLabel: plano.badgeLabel,
        ordem: plano.ordem,
      },
    });

    criados += 1;
  }

  const total = await prisma.plano.count();
  return { criados, total };
}

async function seedBeneficios() {
  const planosCadastrados = await prisma.plano.findMany({
    select: { id: true, nome: true },
  });

  const planoIdPorNome = new Map(planosCadastrados.map((plano) => [plano.nome, plano.id]));

  let criados = 0;

  for (const beneficio of beneficios) {
    const planoId = planoIdPorNome.get(beneficio.planoNome);

    if (!planoId) {
      throw new Error(`Plano nao encontrado para o beneficio: ${beneficio.planoNome}`);
    }

    await prisma.beneficio.upsert({
      where: { slug: beneficio.slug },
      update: {
        titulo: beneficio.titulo,
        descricao: beneficio.descricao,
        icone: beneficio.icone,
        ativo: beneficio.ativo ?? true,
        ordem: beneficio.ordem,
        destaque: beneficio.destaque ?? false,
        observacao: beneficio.observacao,
        planoId,
      },
      create: {
        slug: beneficio.slug,
        titulo: beneficio.titulo,
        descricao: beneficio.descricao,
        icone: beneficio.icone,
        ativo: beneficio.ativo ?? true,
        ordem: beneficio.ordem,
        destaque: beneficio.destaque ?? false,
        observacao: beneficio.observacao,
        planoId,
      },
    });

    criados += 1;
  }

  const total = await prisma.beneficio.count();
  return { criados, total };
}

async function main() {
  await removerJogosSelecaoAntigos();
  await normalizarPlanosLegados();
  await removerBeneficiosLegados();
  const jogos = await seedJogosBrasilDePelotas();
  const setoresSeed = await seedSetores();
  const jogosSetoresSeed = await seedJogosSetores();
  const planosSeed = await seedPlanos();
  const beneficiosSeed = await seedBeneficios();

  console.log(
    [
      `Jogos: ${jogos.criados} criado(s), total ${jogos.total}`,
      `Setores: ${setoresSeed.processados} processado(s), total ${setoresSeed.total}`,
      `JogosSetores: ${jogosSetoresSeed.processados} processado(s), total ${jogosSetoresSeed.total}`,
      `Planos: ${planosSeed.criados} processado(s), total ${planosSeed.total}`,
      `Beneficios: ${beneficiosSeed.criados} processado(s), total ${beneficiosSeed.total}`,
    ].join(" | "),
  );
}

main()
  .catch((error) => {
    console.error("Erro ao executar seed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

