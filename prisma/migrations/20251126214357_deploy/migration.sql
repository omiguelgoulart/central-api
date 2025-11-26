-- CreateEnum
CREATE TYPE "StatusSocio" AS ENUM ('ATIVO', 'INADIMPLENTE', 'CANCELADO');

-- CreateEnum
CREATE TYPE "StatusPagamento" AS ENUM ('PENDENTE', 'PAGO', 'ATRASADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "Periodicidade" AS ENUM ('MENSAL', 'TRIMESTRAL', 'SEMESTRAL', 'ANUAL');

-- CreateEnum
CREATE TYPE "MetodoPagamento" AS ENUM ('BOLETO', 'CARTAO_CREDITO', 'CARTAO_DEBITO', 'DINHEIRO', 'PIX');

-- CreateEnum
CREATE TYPE "StatusAssinatura" AS ENUM ('ATIVA', 'CANCELADA', 'SUSPENSA', 'EXPIRADA');

-- CreateEnum
CREATE TYPE "StatusFatura" AS ENUM ('ABERTA', 'PAGA', 'ATRASADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('SUPER_ADMIN', 'OPERACIONAL', 'PORTARIA');

-- CreateEnum
CREATE TYPE "StatusIngresso" AS ENUM ('PENDENTE', 'VALIDO', 'USADO', 'CANCELADO', 'EXPIRADO', 'ESTORNADO');

-- CreateEnum
CREATE TYPE "TipoLote" AS ENUM ('INTEIRA', 'MEIA', 'CORTESIA', 'PROMO');

-- CreateEnum
CREATE TYPE "TipoSetor" AS ENUM ('ARQUIBANCADA', 'CADEIRA', 'CAMAROTE', 'VISITANTE', 'ACESSIVEL');

-- CreateEnum
CREATE TYPE "StatusPedido" AS ENUM ('RASCUNHO', 'RESERVA_ATIVA', 'PENDENTE_PAGAMENTO', 'PAGO', 'CANCELADO', 'EXPIRADO');

-- CreateEnum
CREATE TYPE "TipoIngresso" AS ENUM ('INTEIRA', 'MEIA');

-- CreateTable
CREATE TABLE "admins" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "role" "AdminRole" DEFAULT 'OPERACIONAL',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "torcedores" (
    "id" TEXT NOT NULL,
    "matricula" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "telefone" TEXT,
    "cpf" TEXT,
    "dataNascimento" TIMESTAMP(3),
    "genero" TEXT,
    "fotoUrl" TEXT,
    "enderecoLogradouro" TEXT,
    "enderecoNumero" TEXT,
    "enderecoBairro" TEXT,
    "enderecoCidade" TEXT,
    "enderecoUF" TEXT,
    "enderecoCEP" TEXT,
    "statusSocio" "StatusSocio",
    "inadimplenteDesde" TIMESTAMP(3),
    "aceitaTermosEm" TIMESTAMP(3),
    "aceitaMarketing" BOOLEAN DEFAULT false,
    "aceitaMarketingEm" TIMESTAMP(3),
    "origemCadastro" TEXT,
    "documentoFrenteUrl" TEXT,
    "documentoVersoUrl" TEXT,
    "gatewayClienteId" TEXT,
    "faceId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "torcedores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "planos" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "valor" DECIMAL(65,30) NOT NULL,
    "periodicidade" "Periodicidade" NOT NULL,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "badgeLabel" TEXT,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "planos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beneficios" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "icone" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "planoId" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "destaque" BOOLEAN NOT NULL DEFAULT false,
    "observacao" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "beneficios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assinatura" (
    "id" TEXT NOT NULL,
    "torcedorId" TEXT NOT NULL,
    "planoId" TEXT NOT NULL,
    "status" "StatusAssinatura" NOT NULL DEFAULT 'ATIVA',
    "inicioEm" TIMESTAMP(3) NOT NULL,
    "expiraEm" TIMESTAMP(3),
    "proximaCobrancaEm" TIMESTAMP(3),
    "canceladaEm" TIMESTAMP(3),
    "motivoCancelamento" TEXT,
    "suspensaEm" TIMESTAMP(3),
    "retomadaEm" TIMESTAMP(3),
    "periodicidade" "Periodicidade" NOT NULL DEFAULT 'MENSAL',
    "valorAtual" DECIMAL(10,2),
    "moeda" TEXT DEFAULT 'BRL',
    "gatewayClienteId" TEXT,
    "gatewayAssinaturaId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Assinatura_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fatura" (
    "id" TEXT NOT NULL,
    "assinaturaId" TEXT NOT NULL,
    "competencia" TEXT NOT NULL,
    "valor" DECIMAL(65,30) NOT NULL,
    "status" "StatusFatura" NOT NULL DEFAULT 'ABERTA',
    "vencimentoEm" TIMESTAMP(3) NOT NULL,
    "pagoEm" TIMESTAMP(3),
    "referencia" TEXT,
    "metodo" "MetodoPagamento",
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Fatura_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagamentos" (
    "id" TEXT NOT NULL,
    "torcedorId" TEXT NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "status" "StatusPagamento" NOT NULL DEFAULT 'PENDENTE',
    "dataVencimento" TIMESTAMP(3) NOT NULL,
    "pagoEm" TIMESTAMP(3),
    "referencia" TEXT,
    "metodo" "MetodoPagamento" NOT NULL,
    "descricao" TEXT,
    "faturaId" TEXT,
    "gatewayPaymentId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pagamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jogos" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "local" TEXT NOT NULL DEFAULT 'Bento Freitas',
    "descricao" TEXT,
    "criadoPorId" TEXT,
    "atualizadoPorId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jogos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "setores" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "capacidade" INTEGER NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "setores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jogos_setores" (
    "id" TEXT NOT NULL,
    "jogoId" TEXT NOT NULL,
    "setorId" TEXT NOT NULL,
    "capacidade" INTEGER NOT NULL,
    "aberto" BOOLEAN NOT NULL DEFAULT true,
    "tipo" "TipoSetor" NOT NULL DEFAULT 'ARQUIBANCADA',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jogos_setores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lotes" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" "TipoLote" NOT NULL DEFAULT 'INTEIRA',
    "quantidade" INTEGER,
    "precoUnitario" DECIMAL(10,2) NOT NULL,
    "inicioVendas" TIMESTAMP(3),
    "fimVendas" TIMESTAMP(3),
    "limitePorCPF" INTEGER,
    "jogoId" TEXT NOT NULL,
    "jogoSetorId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ingressos" (
    "id" TEXT NOT NULL,
    "torcedorId" TEXT,
    "jogoId" TEXT NOT NULL,
    "loteId" TEXT,
    "qrCode" TEXT NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "status" "StatusIngresso" NOT NULL DEFAULT 'VALIDO',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usadoEm" TIMESTAMP(3),
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    "pagamentoId" TEXT,

    CONSTRAINT "ingressos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checkins" (
    "id" TEXT NOT NULL,
    "ingressoId" TEXT NOT NULL,
    "feitoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "feitoPor" TEXT,
    "local" TEXT,

    CONSTRAINT "checkins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pedido" (
    "id" TEXT NOT NULL,
    "torcedorId" TEXT NOT NULL,
    "status" "StatusPedido" NOT NULL DEFAULT 'RASCUNHO',
    "total" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    "expiraEm" TIMESTAMP(3),
    "pagamentoId" TEXT,

    CONSTRAINT "Pedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemPedido" (
    "id" TEXT NOT NULL,
    "pedidoId" TEXT NOT NULL,
    "setorId" TEXT NOT NULL,
    "tipo" "TipoIngresso" NOT NULL,
    "preco" DECIMAL(65,30) NOT NULL,
    "nomeTitular" TEXT,
    "torcedorCpf" TEXT,

    CONSTRAINT "ItemPedido_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "torcedores_matricula_key" ON "torcedores"("matricula");

-- CreateIndex
CREATE UNIQUE INDEX "torcedores_email_key" ON "torcedores"("email");

-- CreateIndex
CREATE UNIQUE INDEX "torcedores_cpf_key" ON "torcedores"("cpf");

-- CreateIndex
CREATE INDEX "torcedores_statusSocio_idx" ON "torcedores"("statusSocio");

-- CreateIndex
CREATE INDEX "torcedores_cpf_idx" ON "torcedores"("cpf");

-- CreateIndex
CREATE INDEX "torcedores_email_idx" ON "torcedores"("email");

-- CreateIndex
CREATE UNIQUE INDEX "planos_nome_key" ON "planos"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "beneficios_slug_key" ON "beneficios"("slug");

-- CreateIndex
CREATE INDEX "beneficios_planoId_idx" ON "beneficios"("planoId");

-- CreateIndex
CREATE INDEX "Assinatura_torcedorId_status_idx" ON "Assinatura"("torcedorId", "status");

-- CreateIndex
CREATE INDEX "Assinatura_planoId_idx" ON "Assinatura"("planoId");

-- CreateIndex
CREATE INDEX "Assinatura_status_proximaCobrancaEm_idx" ON "Assinatura"("status", "proximaCobrancaEm");

-- CreateIndex
CREATE INDEX "Assinatura_torcedorId_planoId_status_idx" ON "Assinatura"("torcedorId", "planoId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Fatura_referencia_key" ON "Fatura"("referencia");

-- CreateIndex
CREATE INDEX "Fatura_assinaturaId_status_vencimentoEm_competencia_idx" ON "Fatura"("assinaturaId", "status", "vencimentoEm", "competencia");

-- CreateIndex
CREATE UNIQUE INDEX "pagamentos_referencia_key" ON "pagamentos"("referencia");

-- CreateIndex
CREATE INDEX "pagamentos_torcedorId_idx" ON "pagamentos"("torcedorId");

-- CreateIndex
CREATE INDEX "pagamentos_faturaId_idx" ON "pagamentos"("faturaId");

-- CreateIndex
CREATE INDEX "pagamentos_status_dataVencimento_metodo_idx" ON "pagamentos"("status", "dataVencimento", "metodo");

-- CreateIndex
CREATE INDEX "jogos_data_idx" ON "jogos"("data");

-- CreateIndex
CREATE UNIQUE INDEX "setores_nome_key" ON "setores"("nome");

-- CreateIndex
CREATE INDEX "jogos_setores_jogoId_setorId_idx" ON "jogos_setores"("jogoId", "setorId");

-- CreateIndex
CREATE UNIQUE INDEX "jogos_setores_jogoId_setorId_key" ON "jogos_setores"("jogoId", "setorId");

-- CreateIndex
CREATE INDEX "lotes_jogoId_nome_idx" ON "lotes"("jogoId", "nome");

-- CreateIndex
CREATE INDEX "lotes_jogoSetorId_idx" ON "lotes"("jogoSetorId");

-- CreateIndex
CREATE UNIQUE INDEX "ingressos_qrCode_key" ON "ingressos"("qrCode");

-- CreateIndex
CREATE INDEX "ingressos_jogoId_status_loteId_idx" ON "ingressos"("jogoId", "status", "loteId");

-- CreateIndex
CREATE INDEX "checkins_ingressoId_idx" ON "checkins"("ingressoId");

-- AddForeignKey
ALTER TABLE "beneficios" ADD CONSTRAINT "beneficios_planoId_fkey" FOREIGN KEY ("planoId") REFERENCES "planos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assinatura" ADD CONSTRAINT "Assinatura_torcedorId_fkey" FOREIGN KEY ("torcedorId") REFERENCES "torcedores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assinatura" ADD CONSTRAINT "Assinatura_planoId_fkey" FOREIGN KEY ("planoId") REFERENCES "planos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fatura" ADD CONSTRAINT "Fatura_assinaturaId_fkey" FOREIGN KEY ("assinaturaId") REFERENCES "Assinatura"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagamentos" ADD CONSTRAINT "pagamentos_torcedorId_fkey" FOREIGN KEY ("torcedorId") REFERENCES "torcedores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagamentos" ADD CONSTRAINT "pagamentos_faturaId_fkey" FOREIGN KEY ("faturaId") REFERENCES "Fatura"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jogos" ADD CONSTRAINT "jogos_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jogos" ADD CONSTRAINT "jogos_atualizadoPorId_fkey" FOREIGN KEY ("atualizadoPorId") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jogos_setores" ADD CONSTRAINT "jogos_setores_jogoId_fkey" FOREIGN KEY ("jogoId") REFERENCES "jogos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jogos_setores" ADD CONSTRAINT "jogos_setores_setorId_fkey" FOREIGN KEY ("setorId") REFERENCES "setores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lotes" ADD CONSTRAINT "lotes_jogoId_fkey" FOREIGN KEY ("jogoId") REFERENCES "jogos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lotes" ADD CONSTRAINT "lotes_jogoSetorId_fkey" FOREIGN KEY ("jogoSetorId") REFERENCES "jogos_setores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingressos" ADD CONSTRAINT "ingressos_torcedorId_fkey" FOREIGN KEY ("torcedorId") REFERENCES "torcedores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingressos" ADD CONSTRAINT "ingressos_jogoId_fkey" FOREIGN KEY ("jogoId") REFERENCES "jogos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingressos" ADD CONSTRAINT "ingressos_loteId_fkey" FOREIGN KEY ("loteId") REFERENCES "lotes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingressos" ADD CONSTRAINT "ingressos_pagamentoId_fkey" FOREIGN KEY ("pagamentoId") REFERENCES "pagamentos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checkins" ADD CONSTRAINT "checkins_ingressoId_fkey" FOREIGN KEY ("ingressoId") REFERENCES "ingressos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_torcedorId_fkey" FOREIGN KEY ("torcedorId") REFERENCES "torcedores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_pagamentoId_fkey" FOREIGN KEY ("pagamentoId") REFERENCES "pagamentos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemPedido" ADD CONSTRAINT "ItemPedido_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemPedido" ADD CONSTRAINT "ItemPedido_setorId_fkey" FOREIGN KEY ("setorId") REFERENCES "setores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
