
import { prisma } from '../../../lib/prisma';
import { CreateIngressoComPagamentoInput } from '../types/ingresso.type';

export class IngressoSimpleService {
    constructor(private readonly db = prisma) { }

    async criarIngressoComPagamento(
        data: CreateIngressoComPagamentoInput,
        torcedorId: string
    ) {
        const lote = await this.db.lote.findUnique({
            where: { id: data.loteId },
            include: {
                jogo: true,
                jogoSetor: { include: { setor: true } }
            }
        });

        if (!lote) {
            throw new Error('Lote não encontrado');
        }

        const pedido = await this.db.pedido.create({
            data: {
                torcedorId,
                status: 'PAGO',
                itens: {
                    create: {
                        loteId: data.loteId,
                        valorUnitario: lote.precoUnitario
                    }
                }
            },
            include: {
                itens: true
            }
        });

        const itemPedido = pedido.itens[0];
        if (!itemPedido) {
            throw new Error('Erro ao criar item do pedido');
        }

        const qrCode = this.gerarQrCode(itemPedido.id, lote.jogo.id);

        const ingresso = await this.db.ingresso.create({
            data: {
                itemPedidoId: itemPedido.id,
                qrCode,
                status: 'VALIDO'
            },
            include: {
                itemPedido: {
                    include: {
                        lote: {
                            include: {
                                jogo: true,
                                jogoSetor: { include: { setor: true } }
                            }
                        }
                    }
                }
            }
        });

        if (data.pagamentoId) {
            await this.db.pagamentoIngresso.create({
                data: {
                    pedidoId: pedido.id,
                    total: lote.precoUnitario,
                    provider: 'asaas',
                    externalId: data.pagamentoId,
                    status: 'APROVADO'
                }
            });
        }

        return {
            message: 'Ingresso criado com sucesso',
            ingressoId: ingresso.id,
            pedidoId: pedido.id,
            qrCode: ingresso.qrCode,
            ingresso
        };
    }

    private gerarQrCode(itemPedidoId: string, jogoId: string): string {
        const timestamp = Date.now();
        const codigo = `${jogoId.slice(0, 8).toUpperCase()}:${itemPedidoId.slice(0, 8).toUpperCase()}:${timestamp}`;
        return codigo;
    }
}
