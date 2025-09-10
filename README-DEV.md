# Guia de Desenvolvimento Local - ClassPro

## Alterações Implementadas

### ✅ 1. Persistência dos Dados no Supabase

**Problema Resolvido**: A aplicação agora salva todos os dados diretamente no banco Supabase, eliminando o uso de dados fictícios que eram resetados a cada reinício.

**Alterações**:
- Criado `src/hooks/useAlunos.ts` - Hook para operações CRUD de alunos
- Criado `src/hooks/useAulas.ts` - Hook para operações CRUD de aulas  
- Criado `src/hooks/usePagamentos.ts` - Hook para operações CRUD de pagamentos
- Atualizado `src/contexts/AppContext.tsx` - Agora usa os hooks ao invés de dados locais

**Resultado**: Todas as alterações (criar/editar/excluir alunos, agendar aulas, etc.) são persistidas no Supabase automaticamente.

### ✅ 2. Tema Escuro (Dark Mode)

**Implementado**:
- Criado `src/contexts/ThemeContext.tsx` - Gerenciamento do tema
- Criado `src/components/ThemeToggle.tsx` - Botão para alternar tema
- Adicionado toggle no header da aplicação
- Tema é salvo no localStorage automaticamente
- Suporte a modo automático (baseado na preferência do sistema)

**Como usar**: Clique no ícone de sol/lua no canto superior direito para alternar entre claro, escuro e automático.

### ✅ 3. Script de Desenvolvimento Rápido

**Arquivos Criados**:
- `scripts/dev-start.bat` (Windows)
- `scripts/dev-start.sh` (Linux/macOS)

**Funcionalidades**:
- ✅ Abre automaticamente o navegador na URL da aplicação
- ✅ Executa `npm run dev` 
- ✅ Interface amigável com título personalizado
- ✅ Compatível com Windows, Linux e macOS

## Como Usar o Script de Desenvolvimento

### Windows
```bash
# Navegue até o diretório do projeto
cd path/to/classpro

# Execute o script
scripts/dev-start.bat
```

### Linux/macOS
```bash
# Navegue até o diretório do projeto
cd path/to/classpro

# Torne o script executável (apenas na primeira vez)
chmod +x scripts/dev-start.sh

# Execute o script
./scripts/dev-start.sh
```

### Criando Atalho no Desktop (Windows)

1. Clique com botão direito na área de trabalho
2. Novo → Atalho
3. No campo localização, digite:
   ```
   cmd /c "cd /d C:\caminho\para\seu\projeto && scripts\dev-start.bat"
   ```
4. Nome do atalho: "ClassPro Dev Server"
5. Personalize o ícone se desejar

### Criando Atalho no Desktop (Linux)

Crie um arquivo `.desktop`:

```bash
# Crie o arquivo
nano ~/Desktop/classpro-dev.desktop

# Conteúdo do arquivo:
[Desktop Entry]
Version=1.0
Type=Application
Name=ClassPro Dev Server
Comment=Inicia o servidor de desenvolvimento do ClassPro
Exec=/caminho/para/seu/projeto/scripts/dev-start.sh
Icon=/caminho/para/algum/icone.png
Terminal=true
StartupNotify=false
```

## Verificação da Configuração

### Banco de Dados
- ✅ Dados agora são carregados do Supabase
- ✅ Todas as operações CRUD funcionam
- ✅ Sem mais reset de dados fictícios

### Tema Escuro
- ✅ Toggle disponível no header
- ✅ Três opções: Claro, Escuro, Sistema
- ✅ Preferência salva no navegador

### Script de Desenvolvimento
- ✅ Abre browser automaticamente
- ✅ Inicia servidor de desenvolvimento
- ✅ Interface amigável

## Próximos Passos Recomendados

1. **Configure autenticação**: A aplicação está preparada para funcionar com usuários autenticados
2. **Teste as operações**: Crie alguns alunos e aulas para verificar a persistência
3. **Personalize o tema**: Ajuste as cores no arquivo `src/index.css` se necessário

## Suporte Técnico

Se encontrar problemas:

1. **Dados não persistem**: Verifique se está logado e se o Supabase está configurado
2. **Tema não funciona**: Limpe o cache do navegador
3. **Script não abre browser**: Verifique se o caminho está correto e se tem permissões

---

**Desenvolvido com**: React + TypeScript + Tailwind CSS + Supabase