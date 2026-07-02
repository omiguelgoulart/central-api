import { MetodoPagamento } from "@prisma/client";

import { AsaasService } from "../../asaas/services/asaas.service";
import {
    faturaGeradaTemplate,
} from "../../emails/email-templates/fatura-gerada.template";
import { sendEmail } from "../../emails/services/email.service";
import { FaturaRepository } from "../repositories/fatura.repository";
import { CreateFaturaInput, UpdateFaturaInput } from "../types/pagamento.type";

type MetodoConfirmacao = "PIX" | "BOLETO" | "CARTAO";

export class FaturaService {
    constructor(
        private readonly repository = new FaturaRepository(),
        private readonly asaasService = new AsaasService(),
    ) { }

    async createFatura(data: CreateFaturaInput) {
        const assinatura = await this.repository.getAssinaturaById(data.assinaturaId);
        if (!assinatura) throw new Error("Assinatura nao encontrada");

        const novaFatura = await this.repository.createFatura(data);
        const assinaturaComTorcedor = await this.repository.getAssinaturaComTorcedor(data.assinaturaId);
        if (assinaturaComTorcedor?.torcedor?.email) {
            const html = faturaGeradaTemplate({
                nome: assinaturaComTorcedor.torcedor.nome,
                plano: assinaturaComTorcedor.plano.nome,
                competencia: data.competencia,
                valor: Number(data.valor),
                vencimentoEm: data.vencimentoEm.toLocaleDateString("pt-BR"),
            });
            sendEmail({
                to: assinaturaComTorcedor.torcedor.email,
                subject: `Fatura ${data.competencia} - ${assinaturaComTorcedor.plano.nome}`,
                html,
            }).catch((err) => console.error("Erro email fatura gerada:", err));
        }

        return { message: "Fatura criada com sucesso", faturaId: novaFatura.id };
    }

    async getAllFaturas() {
        return this.repository.getAllFaturas();
    }

    async getFaturaById(id: string) {
        const fatura = await this.repository.getFaturaById(id);
        if (!fatura) throw new Error("Fatura nao encontrada");
        return fatura;
    }

    async deleteFatura(id: string) {
        const fatura = await this.repository.getFaturaById(id);
        if (!fatura) throw new Error("Fatura nao encontrada");
        await this.repository.deleteFatura(id);
        return { message: "Fatura deletada com sucesso" };
    }

    async updateFatura(id: string, data: UpdateFaturaInput) {
        const fatura = await this.repository.getFaturaById(id);
        if (!fatura) throw new Error("Fatura nao encontrada");

        if (data.assinaturaId) {
            const assinatura = await this.repository.getAssinaturaById(data.assinaturaId);
            if (!assinatura) throw new Error("Assinatura nao encontrada");
        }

        const atualizada = await this.repository.updateFatura(id, data);
        return { message: "Fatura atualizada com sucesso", fatura: atualizada };
    }

    async pagarMultiplo(faturaIds: string[], metodo: "PIX" | "BOLETO") {
        if (!faturaIds.length) throw new Error("Nenhuma fatura informada");

        const faturas = await Promise.all(faturaIds.map(id => this.repository.getFaturaParaBoleto(id)));

        for (const fatura of faturas) {
            if (!fatura) throw new Error("Fatura nao encontrada");
            if (fatura.status === "PAGA") throw new Error("Uma das faturas ja esta paga");
            if (fatura.status === "CANCELADA") throw new Error("Uma das faturas esta cancelada");
        }

        const torcedorIds = [...new Set(faturas.map(f => f!.assinatura.torcedor.id))];
        if (torcedorIds.length > 1) throw new Error("Faturas pertencem a torcedores diferentes");

        const primeira = faturas[0]!;
        const torcedor = primeira.assinatura.torcedor;

        let gatewayClienteId = torcedor.gatewayClienteId;
        if (!gatewayClienteId) {
            const cliente = await this.asaasService.criarCliente({
                nome: torcedor.nome,
                email: torcedor.email,
                cpfCnpj: torcedor.cpf ?? undefined,
            });
            const clienteAny = cliente as Record<string, unknown>;
            gatewayClienteId = clienteAny.id as string;
            await this.repository.updateTorcedorGatewayClienteId(torcedor.id, gatewayClienteId);
        }

        const total = faturas.reduce((acc, f) => acc + Number(f!.valor), 0);
        const competencias = faturas.map(f => f!.competencia).join(", ");
        const dueDate = new Date().toISOString().slice(0, 10);

        const pagamento = await this.asaasService.criarPagamento({
            customerId: gatewayClienteId,
            valor: total,
            descricao: `${primeira.assinatura.plano.nome} - ${competencias}`,
            dueDate,
            tipo: metodo,
        });

        if (!pagamento) throw new Error("Pagamento nao retornado pelo Asaas");
        const pagamentoId = pagamento.id;

        for (let i = 0; i < faturas.length; i++) {
            const f = faturas[i]!;
            await this.repository.criarPagamentoSocio({
                torcedorId: torcedor.id,
                faturaId: f.id,
                valor: Number(f.valor),
                status: "PENDENTE",
                dataVencimento: f.vencimentoEm,
                referencia: `${pagamentoId}-${i}`,
                metodo,
                descricao: `${f.assinatura.plano.nome} - ${f.competencia}`,
                gatewayPaymentId: pagamentoId,
            });
        }

        if (metodo === "PIX") {
            const qrCode = await this.asaasService.obterQrCodePix(pagamentoId);
            return {
                paymentId: pagamentoId,
                metodo: "PIX" as const,
                encodedImage: qrCode.encodedImage,
                payload: qrCode.payload,
                expirationDate: qrCode.expirationDate ?? null,
            };
        }

        return {
            paymentId: pagamentoId,
            metodo: "BOLETO" as const,
            bankSlipUrl: pagamento.bankSlipUrl,
            invoiceUrl: pagamento.invoiceUrl,
            dueDate,
        };
    }

    async confirmarPagamento(params: {
        faturaIds: string[];
        torcedorId: string;
        paymentId: string;
        metodo: MetodoConfirmacao;
    }) {
        if (!params.faturaIds.length) throw new Error("Nenhuma fatura informada");
        if (!params.torcedorId) throw new Error("Torcedor nao informado");
        if (!params.paymentId) throw new Error("Pagamento nao informado");

        const faturas = await this.repository.getFaturasParaConfirmacao(params.faturaIds);

        if (faturas.length !== params.faturaIds.length) {
            throw new Error("Fatura nao encontrada");
        }

        for (const fatura of faturas) {
            if (fatura.assinatura.torcedor.id !== params.torcedorId) {
                throw new Error("Fatura nao pertence ao torcedor informado");
            }

            if (fatura.status === "CANCELADA") {
                throw new Error("Fatura cancelada nao pode ser paga");
            }
        }

        const metodo = this.mapMetodoConfirmacao(params.metodo);
        const pagoEm = new Date();

        const resultado = await this.repository.confirmarPagamentoFaturas({
            faturaIds: params.faturaIds,
            torcedorId: params.torcedorId,
            gatewayPaymentId: params.paymentId,
            metodo,
            pagoEm,
        });

        return {
            message: "Pagamento confirmado com sucesso",
            faturasAtualizadas: resultado.count,
            pagoEm,
        };
    }

    async gerarBoleto(faturaId: string) {
        const fatura = await this.repository.getFaturaParaBoleto(faturaId);
        if (!fatura) throw new Error("Fatura nao encontrada");
        if (fatura.status === "PAGA") throw new Error("Fatura ja esta paga");
        if (fatura.status === "CANCELADA") throw new Error("Fatura cancelada nao pode gerar boleto");

        const torcedor = fatura.assinatura.torcedor;
        const planoNome = fatura.assinatura.plano.nome;

        // Se já existe um boleto gerado, devolve os dados do Asaas
        if (fatura.referencia) {
            const existing = await this.asaasService.obterStatusPagamento(fatura.referencia);
            const asaasAny = existing as Record<string, unknown>;
            return {
                paymentId: fatura.referencia,
                bankSlipUrl: asaasAny.bankSlipUrl as string | undefined,
                invoiceUrl: asaasAny.invoiceUrl as string | undefined,
                dueDate: fatura.vencimentoEm.toISOString().slice(0, 10),
            };
        }

        // Garante que o torcedor existe no Asaas
        let gatewayClienteId = torcedor.gatewayClienteId;
        if (!gatewayClienteId) {
            const cliente = await this.asaasService.criarCliente({
                nome: torcedor.nome,
                email: torcedor.email,
                cpfCnpj: torcedor.cpf ?? undefined,
            });
            const clienteAny = cliente as Record<string, unknown>;
            gatewayClienteId = clienteAny.id as string;
            await this.repository.updateTorcedorGatewayClienteId(torcedor.id, gatewayClienteId);
        }

        const dueDate = fatura.vencimentoEm.toISOString().slice(0, 10);
        const boleto = await this.asaasService.criarPagamento({
            customerId: gatewayClienteId,
            valor: Number(fatura.valor),
            descricao: `${planoNome} - ${fatura.competencia}`,
            dueDate,
            tipo: "BOLETO",
        });

        if (!boleto) throw new Error("Boleto nao retornado pelo Asaas");
        const boletoId = boleto.id;

        await this.repository.setReferencia(faturaId, boletoId);
        await this.repository.criarPagamentoSocio({
            torcedorId: torcedor.id,
            faturaId,
            valor: Number(fatura.valor),
            status: "PENDENTE",
            dataVencimento: fatura.vencimentoEm,
            referencia: boletoId,
            metodo: "BOLETO",
            descricao: `${planoNome} - ${fatura.competencia}`,
            gatewayPaymentId: boletoId,
        });

        return {
            paymentId: boletoId,
            bankSlipUrl: boleto.bankSlipUrl,
            invoiceUrl: boleto.invoiceUrl,
            dueDate,
        };
    }

    private mapMetodoConfirmacao(metodo: MetodoConfirmacao): MetodoPagamento {
        switch (metodo) {
            case "PIX":
                return MetodoPagamento.PIX;
            case "BOLETO":
                return MetodoPagamento.BOLETO;
            case "CARTAO":
                return MetodoPagamento.CARTAO_CREDITO;
        }
    }
}
