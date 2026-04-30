import { StatusFatura } from "@prisma/client";

import { sendEmail } from "../../emails/services/email.service";
import { AssinaturaRepository } from "../repositories/assinatura.repository";
import { CreateAssinaturaInput, UpdateAssinaturaInput } from "../types/pagamento.type";

import {
    assinaturaCanceladaTemplate,
} from "../../emails/email-templates/assinatura-cancelada.template";
import {
    assinaturaCriadaTemplate,
} from "../../emails/email-templates/assinatura-criada.template";

const MESES = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function gerarFaturasAnuais(valorMensal: number, inicioEm: Date) {
    let mes = inicioEm.getMonth();
    let ano = inicioEm.getFullYear();

    return Array.from({ length: 12 }, () => {
        const competencia = `${MESES[mes]}/${ano}`;
        const vencimentoEm = new Date(ano, mes, 15);
        const entrada = { competencia, valor: valorMensal, status: "ABERTA" as StatusFatura, vencimentoEm };
        mes++;
        if (mes > 11) { mes = 0; ano++; }
        return entrada;
    });
}

export class AssinaturaService {
    constructor(private readonly repository = new AssinaturaRepository()) { }

    async createAssinatura(data: CreateAssinaturaInput) {
        const torcedor = await this.repository.getTorcedorById(data.torcedorId);
        if (!torcedor) throw new Error("Torcedor nao encontrado");

        const plano = await this.repository.getPlanoById(data.planoId);
        if (!plano) throw new Error("Plano nao encontrado");

        const valorMensal = Number(plano.valor);
        const inicioEm = new Date(data.inicioEm);
        const faturas = gerarFaturasAnuais(valorMensal, inicioEm);

        const nova = await this.repository.createAssinatura(data, faturas);
        const html = assinaturaCriadaTemplate({
            nome: torcedor.nome,
            plano: plano.nome,
            valor: valorMensal,
            periodicidade: "ANUAL",
            inicioEm: inicioEm.toLocaleDateString("pt-BR"),
            proximaCobranca: undefined,
        });

        sendEmail({
            to: torcedor.email,
            subject: "Assinatura Ativada!",
            html,
        }).catch((err) => console.error("Erro email assinatura criada:", err));

        return nova;
    }

    async getAllAssinaturas() {
        return this.repository.getAllAssinaturas();
    }

    async getAssinaturaById(id: string) {
        const assinatura = await this.repository.getAssinaturaDetalheById(id);
        if (!assinatura) throw new Error("Assinatura nao encontrada");
        return assinatura;
    }

    async deleteAssinatura(id: string) {
        const assinatura = await this.repository.getAssinaturaById(id);
        if (!assinatura) throw new Error("Assinatura nao encontrada");

        await this.repository.deleteAssinatura(id);
        return { message: "Assinatura deletada com sucesso" };
    }

    async updateAssinatura(id: string, data: UpdateAssinaturaInput) {
        const assinatura = await this.repository.getAssinaturaById(id);
        if (!assinatura) throw new Error("Assinatura nao encontrada");

        await this.repository.updateAssinatura(id, data);

        if (data.status === "CANCELADA") {
            const assinaturaCompleta = await this.repository.getAssinaturaComTorcedor(id);
            if (assinaturaCompleta?.torcedor?.email) {
                const html = assinaturaCanceladaTemplate({
                    nome: assinaturaCompleta.torcedor.nome,
                    plano: assinaturaCompleta.plano.nome,
                    canceladaEm: new Date().toLocaleDateString("pt-BR"),
                    motivo: data.motivoCancelamento ?? undefined,
                });

                sendEmail({
                    to: assinaturaCompleta.torcedor.email,
                    subject: "Assinatura Cancelada",
                    html,
                }).catch((err) => console.error("Erro email assinatura cancelada:", err));
            }
        }

        return { message: "Assinatura atualizada com sucesso" };
    }
}
