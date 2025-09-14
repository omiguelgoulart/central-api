# API – Central de Torcedores (PD1)

Back-end do projeto **Central de Torcedores** (PD1). Fornece autenticação, gestão de torcedores/sócios, planos, pagamentos, eventos e ingressos (QR Code).

---



## 📑 Padrão de Commits (Gitmoji)

Usamos **Gitmoji** para padronizar mensagens de commit. Formato recomendado:

```
<emoji> <tipo>: <resumo curto>

# Exemplo
🎉 init: configurações iniciais do projeto
```

### Tabela rápida (mais usados)

| Emoji | Código            | Quando usar                               |
| ----- | ----------------- | ----------------------------------------- |
| 🎉    | `:tada:`          | Primeira versão/commit inicial            |
| ✨     | `:sparkles:`      | Nova funcionalidade (feature)             |
| 🐛    | `:bug:`           | Correção de bug                           |
| ♻️    | `:recycle:`       | Refatoração (sem mudar comportamento)     |
| 🎨    | `:art:`           | Melhorias de estilo/organização do código |
| 🧪    | `:test_tube:`     | Testes (adicionar/ajustar)                |
| 📝    | `:memo:`          | Documentação (README, docs)               |
| 🔧    | `:wrench:`        | Configurações (lint, env, CI, etc.)       |
| 🗃️   | `:card_file_box:` | Migrations/alterações de banco            |
| 🚚    | `:truck:`         | Mover/renomear arquivos/pastas            |
| 🔥    | `:fire:`          | Remover código/arquivos                   |
| 🚀    | `:rocket:`        | Deploy/infra                              |
| 🔒    | `:lock:`          | Correções de segurança                    |
| 📦    | `:package:`       | Adicionar/atualizar dependências          |
| ⬆️    | `:arrow_up:`      | Upgrade de versão                         |
| ⬇️    | `:arrow_down:`    | Downgrade de versão                       |

### Exemplos práticos

```bash
# inicialização
git commit -m "🎉 init: configurações iniciais do projeto (Prisma, .env exemplo)"

# nova rota
git commit -m "✨ feat: cria endpoint POST /auth/login"

# migration do banco
git commit -m "🗃️ chore: adiciona migration de planos e pagamentos"

# documentação
git commit -m "📝 docs: adiciona seção de autenticação no README"
```

> Dica: mantenha o **resumo com até \~72 caracteres** e, se precisar, use o corpo do commit para detalhes.

---

## 📄 Licença

Defina a licença do projeto (ex.: MIT).
