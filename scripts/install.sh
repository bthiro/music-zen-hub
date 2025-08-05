#!/bin/bash

# 🚀 Script de Instalação Automática - Professor Musical
# Para sistemas Linux/Mac

echo "🎵 Iniciando instalação do Professor Musical..."
echo "=================================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para logs coloridos
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se Node.js está instalado
check_node() {
    log_info "Verificando Node.js..."
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        log_success "Node.js encontrado: $NODE_VERSION"
        
        # Verificar se a versão é >= 18
        NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
        if [ "$NODE_MAJOR" -lt 18 ]; then
            log_error "Node.js versão 18+ é necessário. Versão atual: $NODE_VERSION"
            log_info "Por favor, atualize o Node.js: https://nodejs.org/"
            exit 1
        fi
    else
        log_error "Node.js não encontrado!"
        log_info "Instale o Node.js: https://nodejs.org/"
        exit 1
    fi
}

# Verificar se npm/yarn está disponível
check_package_manager() {
    log_info "Verificando gerenciador de pacotes..."
    if command -v bun &> /dev/null; then
        PACKAGE_MANAGER="bun"
        log_success "Bun encontrado - usando Bun"
    elif command -v yarn &> /dev/null; then
        PACKAGE_MANAGER="yarn"
        log_success "Yarn encontrado - usando Yarn"
    elif command -v npm &> /dev/null; then
        PACKAGE_MANAGER="npm"
        log_success "NPM encontrado - usando NPM"
    else
        log_error "Nenhum gerenciador de pacotes encontrado!"
        exit 1
    fi
}

# Instalar dependências
install_dependencies() {
    log_info "Instalando dependências..."
    
    case $PACKAGE_MANAGER in
        "bun")
            bun install
            ;;
        "yarn")
            yarn install
            ;;
        "npm")
            npm install
            ;;
    esac
    
    if [ $? -eq 0 ]; then
        log_success "Dependências instaladas com sucesso!"
    else
        log_error "Erro ao instalar dependências"
        exit 1
    fi
}

# Verificar se Supabase CLI está instalado
check_supabase_cli() {
    log_info "Verificando Supabase CLI..."
    if command -v supabase &> /dev/null; then
        log_success "Supabase CLI encontrado"
    else
        log_warning "Supabase CLI não encontrado"
        log_info "Instalando Supabase CLI..."
        
        if command -v brew &> /dev/null; then
            brew install supabase/tap/supabase
        else
            # Install via npm
            npm install -g supabase
        fi
        
        if [ $? -eq 0 ]; then
            log_success "Supabase CLI instalado!"
        else
            log_warning "Falha ao instalar Supabase CLI automaticamente"
            log_info "Instale manualmente: https://supabase.com/docs/guides/cli"
        fi
    fi
}

# Criar arquivo de ambiente se não existir
create_env_file() {
    log_info "Configurando arquivo de ambiente..."
    
    if [ ! -f ".env.local" ]; then
        cat > .env.local << 'EOF'
# 🔧 Configurações do Supabase
# Substitua pelos valores do seu projeto
VITE_SUPABASE_URL=https://hnftxautmxviwrfuaosu.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuZnR4YXV0bXh2aXdyZnVhb3N1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMTg1MDksImV4cCI6MjA2OTU5NDUwOX0.oBxH287kos3h2FXuP8jdr-IMjGW_QWf_VVxMEe4cjks

# 🔧 Google OAuth (Opcional)
# Configure após criar projeto no Google Cloud Console
VITE_GOOGLE_CLIENT_ID=

# 🔧 Configurações de Desenvolvimento
VITE_APP_URL=http://localhost:8080
EOF
        log_success "Arquivo .env.local criado!"
        log_warning "⚠️  IMPORTANTE: Configure as variáveis de ambiente em .env.local"
    else
        log_info "Arquivo .env.local já existe"
    fi
}

# Verificar se o projeto está em um repositório Git
setup_git() {
    log_info "Verificando Git..."
    if [ -d ".git" ]; then
        log_success "Repositório Git encontrado"
    else
        log_info "Inicializando repositório Git..."
        git init
        git add .
        git commit -m "Initial commit - Professor Musical setup"
        log_success "Repositório Git inicializado!"
    fi
}

# Criar scripts package.json se necessário
setup_scripts() {
    log_info "Verificando scripts do package.json..."
    
    # Verificar se setup:env existe
    if ! grep -q "setup:env" package.json; then
        log_info "Adicionando script setup:env ao package.json..."
        # Aqui você pode usar jq se disponível, ou instruir manualmente
        log_warning "Adicione manualmente ao package.json:"
        echo '"setup:env": "node scripts/setup-env.js"'
    fi
}

# Função para testar a instalação
test_installation() {
    log_info "Testando instalação..."
    
    # Verificar se consegue importar módulos principais
    if $PACKAGE_MANAGER run dev --help &> /dev/null; then
        log_success "Comando de desenvolvimento configurado!"
    else
        log_warning "Comando de desenvolvimento pode não estar funcionando"
    fi
}

# Mostrar próximos passos
show_next_steps() {
    echo ""
    echo "🎉 INSTALAÇÃO CONCLUÍDA!"
    echo "=================================================="
    echo ""
    echo "📋 PRÓXIMOS PASSOS:"
    echo ""
    echo "1. 📝 Configure o Supabase:"
    echo "   - Acesse: https://supabase.com/"
    echo "   - Crie um novo projeto"
    echo "   - Configure as variáveis em .env.local"
    echo ""
    echo "2. 🔧 Configure Google OAuth (opcional):"
    echo "   - Siga o tutorial em TUTORIAL_COMPLETO_INSTALACAO.md"
    echo ""
    echo "3. 🚀 Execute o projeto:"
    echo "   $PACKAGE_MANAGER run dev"
    echo ""
    echo "4. 🌐 Acesse:"
    echo "   http://localhost:8080"
    echo ""
    echo "📖 Documentação completa:"
    echo "   - TUTORIAL_COMPLETO_INSTALACAO.md"
    echo "   - CONFIGURACAO_SISTEMA.md"
    echo ""
    echo "🆘 Problemas? Verifique os logs acima ou consulte a documentação."
}

# Função principal
main() {
    echo ""
    log_info "Iniciando verificações..."
    
    # Executar verificações e instalação
    check_node
    check_package_manager
    check_supabase_cli
    install_dependencies
    create_env_file
    setup_git
    setup_scripts
    test_installation
    
    # Mostrar próximos passos
    show_next_steps
}

# Executar função principal
main

echo ""
log_success "Script de instalação finalizado!"
echo "=================================================="