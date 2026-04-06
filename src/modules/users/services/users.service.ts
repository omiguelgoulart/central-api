import { gerarMatricula } from "../../../utils/matricula";
import { UserRepository } from "../repositories/users.repository";
import { CreateUsuarioInput, UpdateUsuarioInput } from "../types/users.type";

export class UserService {
    constructor(private readonly repository = new UserRepository()) { }

    private async gerarMatriculaUnica() {
        const MAX_TENTATIVAS = 10;

        for (let tentativa = 0; tentativa < MAX_TENTATIVAS; tentativa++) {
            const matricula = gerarMatricula();
            const matriculaExistente = await this.repository.getUserByMatricula(matricula);

            if (!matriculaExistente) {
                return matricula;
            }
        }

        throw new Error('Não foi possível gerar uma matrícula única');
    }

    async createUser(data: CreateUsuarioInput) {
        const emailExistente = await this.repository.getUserByEmail(data.email);
        if (emailExistente) {
            throw new Error('Já existe um usuário com esse email');
        }

        const matricula = await this.gerarMatriculaUnica();
        const newUser = await this.repository.createUser({
            ...data,
            matricula,
        });

        return {
            message: 'Usuário criado com sucesso',
            userId: newUser.id
        };
    }

    async getAllUsers() {
        return this.repository.getAllUsers();
    }

    async getUserByToken(id: string) {
        const user = await this.repository.findById(id);
        if (!user) {
            throw new Error('Usuário não encontrado');
        }
        return user;
    }

    async getUserById(id: string) {
        const user = await this.repository.getUserById(id);
        if (!user) {
            throw new Error('Usuário não encontrado');
        }
        return user;
    }

    async deleteUser(id: string) {
        const userExistente = await this.repository.getUserById(id);
        if (!userExistente) {
            throw new Error('Usuário não encontrado');
        }
        await this.repository.deleteUser(id);

        return {
            message: 'Usuário deletado com sucesso'
        };
    }

    async updateUser(id: string, data: UpdateUsuarioInput) {
        const userExistente = await this.repository.getUserById(id);
        if (!userExistente) {
            throw new Error('Usuário não encontrado');
        }
        if (data.email) {
            const emailExistente = await this.repository.getUserByEmail(data.email);
            if (emailExistente && emailExistente.id !== id) {
                throw new Error('Já existe um usuário com esse email');
            }
        }
        if (data.matricula) {
            const matriculaExistente = await this.repository.getUserByMatricula(String(data.matricula));
            if (matriculaExistente && matriculaExistente.id !== id) {
                throw new Error('Já existe um usuário com essa matrícula');
            }
        }
        return this.repository.updateUser(id, data);
    }

    async countUsers() {
        return this.repository.countUsers();
    }

    async getUserWithDetails(id: string) {
        const user = await this.repository.getUserById(id);
        if (!user) {
            throw new Error('Usuário não encontrado');
        }

        const model = this.repository as unknown as {
            getUserPlans?: (userId: string) => Promise<unknown[]>;
            getUserGames?: (userId: string) => Promise<unknown[]>;
        };

        const [planos, jogos] = await Promise.all([
            model.getUserPlans?.(id) ?? Promise.resolve<unknown[]>([]),
            model.getUserGames?.(id) ?? Promise.resolve<unknown[]>([]),
        ]);

        return {
            ...user,
            planos,
            jogos,
        };
    }

    async getUserByEmailToken(emailToken: string) {
        return this.repository.getUserByEmailToken(emailToken);
    }

    async verifyEmailToken(token: string) {
        const user = await this.repository.getUserByEmailToken(token);
        if (!user) {
            throw new Error('Token de email inválido');
        }
        await this.repository.markEmailAsVerified(user.id);
        return { message: 'Email verificado com sucesso' };
    }

    async verifyEmail(id: string) {
        const user = await this.repository.getUserById(id);
        if (!user) {
            throw new Error('Usuário não encontrado');
        }
        await this.repository.markEmailAsVerified(id);
        return { message: 'Email verificado com sucesso' };
    }

    async updateEmailToken(id: string, emailToken: string, emailTokenExpiry: Date) {
        const user = await this.repository.getUserById(id);
        if (!user) {
            throw new Error('Usuário não encontrado');
        }
        return this.repository.updateEmailToken(id, emailToken, emailTokenExpiry);
    }

    async updatePhotoUrl(id: string, photoUrl: string) {
        const user = await this.repository.getUserById(id);
        if (!user) {
            throw new Error('Usuário não encontrado');
        }
        return this.repository.updatePhotoUrl(id, photoUrl);
    }

    async markEmailAsVerified(id: string) {
        const user = await this.repository.getUserById(id);
        if (!user) {
            throw new Error('Usuário não encontrado');
        }
        return this.repository.markEmailAsVerified(id);
    }

}


