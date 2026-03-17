import { BeneficioModel } from "../models/beneficio.model";
import { CreateBeneficioInput, UpdateBeneficioInput } from "../types/beneficio.type";

export class BeneficioService {
  private beneficioModel: BeneficioModel;

    constructor() {
        this.beneficioModel = new BeneficioModel();
    }

    async createBeneficio(data: CreateBeneficioInput) {
        const slugExistente = await this.beneficioModel.getBeneficioBySlug(data.slug);
        if (slugExistente) {
            throw new Error('Já existe um benefício com esse slug');
        }
        const newBeneficio = await this.beneficioModel.createBeneficio(data);

        return {
            message: 'Benefício criado com sucesso',
            beneficioId: newBeneficio.id
        };
    }

    async getBeneficios() {
        return this.beneficioModel.getBeneficio();
    }

    async getBeneficioById(id: string) {
        const beneficio = await this.beneficioModel.getBeneficioById(id);
        if (!beneficio) {
            throw new Error('Benefício não encontrado');
        }
        return beneficio;
    }

    async deleteBeneficio(id: string) {
        const beneficioExistente = await this.beneficioModel.getBeneficioById(id);
        if (!beneficioExistente) {
            throw new Error('Benefício não encontrado');
        }
        await this.beneficioModel.deleteBeneficio(id);

        return { 
            message: 'Benefício deletado com sucesso' 
        };
    }

    async updateBeneficio(id: string, data: UpdateBeneficioInput) {
        const beneficioExistente = await this.beneficioModel.getBeneficioById(id);
        if (!beneficioExistente) {
            throw new Error('Benefício não encontrado');
        }
        return this.beneficioModel.updateBeneficio(id, data);
    }

}
