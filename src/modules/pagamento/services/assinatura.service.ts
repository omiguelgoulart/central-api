import { sendEmail } from "../../emails/services/email.service";
import { AssinaturaRepository } from "../repositories/assinatura.repository";
import { CreateAssinaturaInput, UpdateAssinaturaInput } from "../types/pagamento.type";

import {
    assinaturaCanceladaTemplate,
} from "../../emails/email-templates/assinatura-cancelada.template";
import {
    assinaturaCriadaTemplate,
} from "../../emails/email-templates/assinatura-criada.template";

export class AssinaturaService {
    constructor(private readonly repository = new AssinaturaRepository()) { }

    async createAssinatura(data: CreateAssinaturaInput) {
        const torcedor = await this.repository.getTorcedorById(data.torcedorId);
        if (!torcedor) throw new Error("Torcedor nao encontrado");

        const plano = await this.repository.getPlanoById(data.planoId);
        if (!plano) throw new Error("Plano nao encontrado");

        const nova = await this.repository.createAssinatura(data);
        const html = assinaturaCriadaTemplate({
            nome: torcedor.nome,
            plano: plano.nome,
            valor: Number(plano.valor),
            periodicidade: plano.periodicidade,
            inicioEm: new Date(data.inicioEm).toLocaleDateString("pt-BR"),
            proximaCobranca: data.proximaCobrancaEm ? new Date(data.proximaCobrancaEm).toLocaleDateString("pt-BR") : undefined,
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
