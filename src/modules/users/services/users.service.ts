import { UserModel } from "../models/users.model";
import { CreateUsuarioInput, UpdateUsuarioInput } from "../types/users.type";

export class UserService {
    private userModel: UserModel;

    constructor() {
        this.userModel = new UserModel();
    }

    async createUser(data: CreateUsuarioInput) {
        const emailExistente = await this.userModel.getUserByEmail(data.email);
        if (emailExistente) {
            throw new Error('Já existe um usuário com esse email');
        }
        const matriculaExistente = await this.userModel.getUserByMatricula(String(data.matricula));
        if (matriculaExistente) {
            throw new Error('Já existe um usuário com essa matrícula');
        }
        const newUser = await this.userModel.createUser(data);

        return {
            message: 'Usuário criado com sucesso',
            userId: newUser.id
        };
    }

    async getAllUsers() {
        return this.userModel.getAllUsers();
    }

    async getUserById(id: string) {
        const user = await this.userModel.getUserById(id);
        if (!user) {
            throw new Error('Usuário não encontrado');
        }
        return user;
    }

    async deleteUser(id: string) {
        const userExistente = await this.userModel.getUserById(id);
        if (!userExistente) {
            throw new Error('Usuário não encontrado');
        }
        await this.userModel.deleteUser(id);

        return {
            message: 'Usuário deletado com sucesso'
        };
    }

    async updateUser(id: string, data: UpdateUsuarioInput) {
        const userExistente = await this.userModel.getUserById(id);
        if (!userExistente) {
            throw new Error('Usuário não encontrado');
        }
        if (data.email) {
            const emailExistente = await this.userModel.getUserByEmail(data.email);
            if (emailExistente && emailExistente.id !== id) {
                throw new Error('Já existe um usuário com esse email');
            }
        }
        if (data.matricula) {
            const matriculaExistente = await this.userModel.getUserByMatricula(String(data.matricula));
            if (matriculaExistente && matriculaExistente.id !== id) {
                throw new Error('Já existe um usuário com essa matrícula');
            }
        }
        return this.userModel.updateUser(id, data);
    }

    async countUsers() {
        return this.userModel.countUsers();
    }

    async getUserWithDetails(id: string) {
        const user = await this.userModel.getUserById(id);
        if (!user) {
            throw new Error('Usuário não encontrado');
        }
        // Aqui você pode adicionar lógica para buscar dados relacionados, como planos, jogos, etc.
        return user;
    }

    async getUserByEmailToken(emailToken: string) {
        return this.userModel.getUserByEmailToken(emailToken);
    }

    async verifyEmailToken(token: string) {
        const user = await this.userModel.getUserByEmailToken(token);
        if (!user) {
            throw new Error('Token de email inválido');
        }
        await this.userModel.markEmailAsVerified(user.id);
        return { message: 'Email verificado com sucesso' };
    }

    async verifyEmail(id: string) {
        const user = await this.userModel.getUserById(id);
        if (!user) {
            throw new Error('Usuário não encontrado');
        }
        await this.userModel.markEmailAsVerified(id);
        return { message: 'Email verificado com sucesso' };
    }

    async updateEmailToken(id: string, emailToken: string, emailTokenExpiry: Date) {
        const user = await this.userModel.getUserById(id);
        if (!user) {
            throw new Error('Usuário não encontrado');
        }
        return this.userModel.updateEmailToken(id, emailToken, emailTokenExpiry);
    }

    async updatePhotoUrl(id: string, photoUrl: string) {
        const user = await this.userModel.getUserById(id);
        if (!user) {
            throw new Error('Usuário não encontrado');
        }
        return this.userModel.updatePhotoUrl(id, photoUrl);
    }

    async markEmailAsVerified(id: string) {
        const user = await this.userModel.getUserById(id);
        if (!user) {
            throw new Error('Usuário não encontrado');
        }
        return this.userModel.markEmailAsVerified(id);
    }

}


