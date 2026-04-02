-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('SUPER_ADMIN', 'OPERACIONAL', 'PORTARIA');

-- CreateEnum
CREATE TYPE "StatusSocio" AS ENUM ('ATIVO', 'INADIMPLENTE', 'CANCELADO');

-- CreateEnum
CREATE TYPE "Periodicidade" AS ENUM ('MENSAL', 'TRIMESTRAL', 'SEMESTRAL', 'ANUAL');

-- CreateEnum
CREATE TYPE "MetodoPagamento" AS ENUM ('BOLETO', 'CARTAO_CREDITO', 'CARTAO_DEBITO', 'DINHEIRO', 'PIX');

-- CreateEnum
CREATE TYPE "StatusAssinatura" AS ENUM ('ATIVA', 'CANCELADA', 'SUSPENSA', 'EXPIRADA');

-- CreateEnum
CREATE TYPE "StatusFatura" AS ENUM ('ABERTA', 'PAGA', 'ATRASADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "StatusPagamentoSocio" AS ENUM ('PENDENTE', 'PAGO', 'ATRASADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "StatusPagamentoIngresso" AS ENUM ('AGUARDANDO', 'APROVADO', 'RECUSADO', 'ESTORNADO');

-- CreateEnum
CREATE TYPE "StatusPedido" AS ENUM ('PENDENTE', 'PAGO', 'CANCELADO', 'EXPIRADO', 'ESTORNADO');

-- CreateEnum
CREATE TYPE "StatusIngresso" AS ENUM ('VALIDO', 'USADO', 'CANCELADO', 'EXPIRADO', 'ESTORNADO');

-- CreateEnum
CREATE TYPE "TipoLote" AS ENUM ('INTEIRA', 'MEIA', 'CORTESIA', 'PROMO');

-- CreateEnum
CREATE TYPE "TipoSetor" AS ENUM ('ARQUIBANCADA', 'CADEIRA', 'CAMAROTE', 'VISITANTE', 'ACESSIVEL');

-- CreateTable
CREATE TABLE "admins" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'OPERACIONAL',
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
    "emailVerificado" BOOLEAN NOT NULL DEFAULT false,
    "emailToken" TEXT,
    "emailTokenExpiraEm" TIMESTAMP(3),
    "senhaToken" TEXT,
    "senhaTokenExpiraEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "torcedores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "planos" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "valor" DECIMAL(10,2) NOT NULL,
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
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "destaque" BOOLEAN NOT NULL DEFAULT false,
    "observacao" TEXT,
    "planoId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "beneficios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assinaturas" (
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
    "moeda" TEXT NOT NULL DEFAULT 'BRL',
    "gatewayClienteId" TEXT,
    "gatewayAssinaturaId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assinaturas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faturas" (
    "id" TEXT NOT NULL,
    "assinaturaId" TEXT NOT NULL,
    "competencia" TEXT NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "status" "StatusFatura" NOT NULL DEFAULT 'ABERTA',
    "vencimentoEm" TIMESTAMP(3) NOT NULL,
    "pagoEm" TIMESTAMP(3),
    "referencia" TEXT,
    "metodo" "MetodoPagamento",
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faturas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagamentos_socio" (
    "id" TEXT NOT NULL,
    "torcedorId" TEXT NOT NULL,
    "faturaId" TEXT,
    "valor" DECIMAL(10,2) NOT NULL,
    "status" "StatusPagamentoSocio" NOT NULL DEFAULT 'PENDENTE',
    "dataVencimento" TIMESTAMP(3) NOT NULL,
    "pagoEm" TIMESTAMP(3),
    "referencia" TEXT,
    "metodo" "MetodoPagamento" NOT NULL,
    "descricao" TEXT,
    "gatewayPaymentId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pagamentos_socio_pkey" PRIMARY KEY ("id")
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
    "slug" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" "TipoSetor" NOT NULL DEFAULT 'ARQUIBANCADA',
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
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jogos_setores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lotes" (
    "id" TEXT NOT NULL,
    "jogoSetorId" TEXT NOT NULL,
    "jogoId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" "TipoLote" NOT NULL DEFAULT 'INTEIRA',
    "quantidade" INTEGER,
    "precoUnitario" DECIMAL(10,2) NOT NULL,
    "inicioVendas" TIMESTAMP(3),
    "fimVendas" TIMESTAMP(3),
    "limitePorCPF" INTEGER,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedidos" (
    "id" TEXT NOT NULL,
    "torcedorId" TEXT NOT NULL,
    "status" "StatusPedido" NOT NULL DEFAULT 'PENDENTE',
    "expiraEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pedidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itens_pedido" (
    "id" TEXT NOT NULL,
    "pedidoId" TEXT NOT NULL,
    "loteId" TEXT NOT NULL,
    "valorUnitario" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "itens_pedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagamentos_ingresso" (
    "id" TEXT NOT NULL,
    "pedidoId" TEXT NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,
    "status" "StatusPagamentoIngresso" NOT NULL DEFAULT 'AGUARDANDO',
    "provider" TEXT NOT NULL,
    "externalId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pagamentos_ingresso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ingressos" (
    "id" TEXT NOT NULL,
    "itemPedidoId" TEXT NOT NULL,
    "qrCode" TEXT NOT NULL,
    "status" "StatusIngresso" NOT NULL DEFAULT 'VALIDO',
    "usadoEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

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

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "torcedores_matricula_key" ON "torcedores"("matricula");

-- CreateIndex
CREATE UNIQUE INDEX "torcedores_email_key" ON "torcedores"("email");

-- CreateIndex
CREATE UNIQUE INDEX "torcedores_cpf_key" ON "torcedores"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "torcedores_emailToken_key" ON "torcedores"("emailToken");

-- CreateIndex
CREATE UNIQUE INDEX "torcedores_senhaToken_key" ON "torcedores"("senhaToken");

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
CREATE INDEX "assinaturas_torcedorId_status_idx" ON "assinaturas"("torcedorId", "status");

-- CreateIndex
CREATE INDEX "assinaturas_planoId_idx" ON "assinaturas"("planoId");

-- CreateIndex
CREATE INDEX "assinaturas_status_proximaCobrancaEm_idx" ON "assinaturas"("status", "proximaCobrancaEm");

-- CreateIndex
CREATE UNIQUE INDEX "faturas_referencia_key" ON "faturas"("referencia");

-- CreateIndex
CREATE INDEX "faturas_assinaturaId_status_vencimentoEm_idx" ON "faturas"("assinaturaId", "status", "vencimentoEm");

-- CreateIndex
CREATE UNIQUE INDEX "pagamentos_socio_referencia_key" ON "pagamentos_socio"("referencia");

-- CreateIndex
CREATE INDEX "pagamentos_socio_torcedorId_idx" ON "pagamentos_socio"("torcedorId");

-- CreateIndex
CREATE INDEX "pagamentos_socio_faturaId_idx" ON "pagamentos_socio"("faturaId");

-- CreateIndex
CREATE INDEX "pagamentos_socio_status_dataVencimento_idx" ON "pagamentos_socio"("status", "dataVencimento");

-- CreateIndex
CREATE INDEX "jogos_data_idx" ON "jogos"("data");

-- CreateIndex
CREATE UNIQUE INDEX "setores_slug_key" ON "setores"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "setores_nome_key" ON "setores"("nome");

-- CreateIndex
CREATE INDEX "jogos_setores_jogoId_idx" ON "jogos_setores"("jogoId");

-- CreateIndex
CREATE UNIQUE INDEX "jogos_setores_jogoId_setorId_key" ON "jogos_setores"("jogoId", "setorId");

-- CreateIndex
CREATE INDEX "lotes_jogoSetorId_idx" ON "lotes"("jogoSetorId");

-- CreateIndex
CREATE INDEX "lotes_jogoId_idx" ON "lotes"("jogoId");

-- CreateIndex
CREATE INDEX "pedidos_torcedorId_idx" ON "pedidos"("torcedorId");

-- CreateIndex
CREATE INDEX "pedidos_status_expiraEm_idx" ON "pedidos"("status", "expiraEm");

-- CreateIndex
CREATE INDEX "itens_pedido_pedidoId_idx" ON "itens_pedido"("pedidoId");

-- CreateIndex
CREATE INDEX "itens_pedido_loteId_idx" ON "itens_pedido"("loteId");

-- CreateIndex
CREATE UNIQUE INDEX "pagamentos_ingresso_pedidoId_key" ON "pagamentos_ingresso"("pedidoId");

-- CreateIndex
CREATE UNIQUE INDEX "ingressos_itemPedidoId_key" ON "ingressos"("itemPedidoId");

-- CreateIndex
CREATE UNIQUE INDEX "ingressos_qrCode_key" ON "ingressos"("qrCode");

-- CreateIndex
CREATE INDEX "ingressos_status_idx" ON "ingressos"("status");

-- CreateIndex
CREATE INDEX "checkins_ingressoId_idx" ON "checkins"("ingressoId");

-- AddForeignKey
ALTER TABLE "beneficios" ADD CONSTRAINT "beneficios_planoId_fkey" FOREIGN KEY ("planoId") REFERENCES "planos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assinaturas" ADD CONSTRAINT "assinaturas_torcedorId_fkey" FOREIGN KEY ("torcedorId") REFERENCES "torcedores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assinaturas" ADD CONSTRAINT "assinaturas_planoId_fkey" FOREIGN KEY ("planoId") REFERENCES "planos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faturas" ADD CONSTRAINT "faturas_assinaturaId_fkey" FOREIGN KEY ("assinaturaId") REFERENCES "assinaturas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagamentos_socio" ADD CONSTRAINT "pagamentos_socio_torcedorId_fkey" FOREIGN KEY ("torcedorId") REFERENCES "torcedores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagamentos_socio" ADD CONSTRAINT "pagamentos_socio_faturaId_fkey" FOREIGN KEY ("faturaId") REFERENCES "faturas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jogos" ADD CONSTRAINT "jogos_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jogos" ADD CONSTRAINT "jogos_atualizadoPorId_fkey" FOREIGN KEY ("atualizadoPorId") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jogos_setores" ADD CONSTRAINT "jogos_setores_jogoId_fkey" FOREIGN KEY ("jogoId") REFERENCES "jogos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jogos_setores" ADD CONSTRAINT "jogos_setores_setorId_fkey" FOREIGN KEY ("setorId") REFERENCES "setores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lotes" ADD CONSTRAINT "lotes_jogoSetorId_fkey" FOREIGN KEY ("jogoSetorId") REFERENCES "jogos_setores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lotes" ADD CONSTRAINT "lotes_jogoId_fkey" FOREIGN KEY ("jogoId") REFERENCES "jogos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_torcedorId_fkey" FOREIGN KEY ("torcedorId") REFERENCES "torcedores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_pedido" ADD CONSTRAINT "itens_pedido_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "pedidos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_pedido" ADD CONSTRAINT "itens_pedido_loteId_fkey" FOREIGN KEY ("loteId") REFERENCES "lotes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagamentos_ingresso" ADD CONSTRAINT "pagamentos_ingresso_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "pedidos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingressos" ADD CONSTRAINT "ingressos_itemPedidoId_fkey" FOREIGN KEY ("itemPedidoId") REFERENCES "itens_pedido"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checkins" ADD CONSTRAINT "checkins_ingressoId_fkey" FOREIGN KEY ("ingressoId") REFERENCES "ingressos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
