# 🚀 Guia para Subir no GitHub

## Passo a Passo

### 1. Criar o repositório no GitHub

1. Acesse [github.com](https://github.com)
2. Clique em **"New repository"** (ou **"+"** → **"New repository"**)
3. Preencha:
   - **Repository name**: nome-do-seu-projeto
   - **Description**: descrição do projeto (opcional)
   - **Visibility**: Public ou Private (escolha)
   - **NÃO marque** "Initialize this repository with a README" (já temos um)
4. Clique em **"Create repository"**

### 2. Conectar o repositório local ao GitHub

Após criar o repositório, o GitHub mostrará comandos. Use estes comandos:

```bash
# Adicionar o remote (substitua SEU_USUARIO e NOME_DO_REPO)
git remote add origin https://github.com/SEU_USUARIO/NOME_DO_REPO.git

# Ou se preferir SSH:
git remote add origin git@github.com:SEU_USUARIO/NOME_DO_REPO.git

# Verificar se foi adicionado corretamente
git remote -v
```

### 3. Fazer o primeiro push

```bash
# Enviar o código para o GitHub
git push -u origin main
```

Se for a primeira vez usando HTTPS, o GitHub pode pedir autenticação.
Se usar SSH, certifique-se de ter configurado suas chaves SSH.

### 4. Próximos commits

Depois do primeiro push, para enviar novas alterações:

```bash
# Ver o status
git status

# Adicionar arquivos modificados
git add .

# Ou adicionar arquivos específicos
git add arquivo1.js arquivo2.js

# Fazer commit
git commit -m "Descrição das alterações"

# Enviar para o GitHub
git push
```

## 🔐 Autenticação no GitHub

### Opção 1: Personal Access Token (HTTPS)
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token
3. Selecione as permissões necessárias (pelo menos `repo`)
4. Use o token como senha ao fazer push

### Opção 2: SSH Keys (Recomendado)
1. Gerar chave SSH:
```bash
ssh-keygen -t ed25519 -C "seu@email.com"
```

2. Adicionar ao ssh-agent:
```bash
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
```

3. Copiar a chave pública:
```bash
cat ~/.ssh/id_ed25519.pub
```

4. GitHub → Settings → SSH and GPG keys → New SSH key
5. Cole a chave e salve

## 📝 Dicas

- **Commits frequentes**: Faça commits pequenos e frequentes
- **Mensagens claras**: Use mensagens de commit descritivas
- **Branches**: Use branches para features novas (`git checkout -b feature/nome-da-feature`)
- **.gitignore**: Já está configurado para ignorar arquivos desnecessários

## 🆘 Problemas Comuns

### Erro: "remote origin already exists"
```bash
git remote remove origin
git remote add origin URL_DO_SEU_REPO
```

### Erro: "failed to push some refs"
```bash
git pull origin main --rebase
git push
```

### Ver histórico de commits
```bash
git log --oneline
```

