import FaturaGerada from "@/modules/emails/email-templates/fatura-gerada.template";
import { render } from "@react-email/render";
import { type ReactElement } from "react";

import { sendEmail } from "../../emails/services/email.service";
import { FaturaRepository } from "../repositories/fatura.repository";
import { CreateFaturaInput, UpdateFaturaInput } from "../types/pagamento.type";

export class FaturaService {
    constructor(private readonly repository = new FaturaRepository()) { }

    async createFatura(data: CreateFaturaInput) {
        const assinatura = await this.repository.getAssinaturaById(data.assinaturaId);
        if (!assinatura) throw new Error("Assinatura nao encontrada");

        const novaFatura = await this.repository.createFatura(data);
        const assinaturaComTorcedor = await this.repository.getAssinaturaComTorcedor(data.assinaturaId);
        if (assinaturaComTorcedor?.torcedor?.email) {
            const template = FaturaGerada({
                nome: assinaturaComTorcedor.torcedor.nome,
                plano: assinaturaComTorcedor.plano.nome,
                competencia: data.competencia,
                valor: Number(data.valor),
                vencimentoEm: data.vencimentoEm.toLocaleDateString("pt-BR"),
            }) as ReactElement;
            const html = await render(template);
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
}
