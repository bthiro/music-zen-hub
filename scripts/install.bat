@echo off
setlocal enabledelayedexpansion

:: 🚀 Script de Instalação Automática - Professor Musical
:: Para sistemas Windows

echo.
echo 🎵 Iniciando instalação do Professor Musical...
echo ==================================================
echo.

:: Função para log colorido (limitado no CMD)
goto :main

:log_info
echo [INFO] %~1
goto :eof

:log_success
echo [SUCCESS] %~1
goto :eof

:log_warning
echo [WARNING] %~1
goto :eof

:log_error
echo [ERROR] %~1
goto :eof

:check_node
call :log_info "Verificando Node.js..."
node --version >nul 2>&1
if %errorlevel% neq 0 (
    call :log_error "Node.js não encontrado!"
    echo Por favor, instale o Node.js: https://nodejs.org/
    echo Versão recomendada: 18 ou superior
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    call :log_success "Node.js encontrado: !NODE_VERSION!"
)
goto :eof

:check_package_manager
call :log_info "Verificando gerenciador de pacotes..."

:: Verificar Bun primeiro
bun --version >nul 2>&1
if %errorlevel% equ 0 (
    set PACKAGE_MANAGER=bun
    call :log_success "Bun encontrado - usando Bun"
    goto :eof
)

:: Verificar Yarn
yarn --version >nul 2>&1
if %errorlevel% equ 0 (
    set PACKAGE_MANAGER=yarn
    call :log_success "Yarn encontrado - usando Yarn"
    goto :eof
)

:: Verificar NPM
npm --version >nul 2>&1
if %errorlevel% equ 0 (
    set PACKAGE_MANAGER=npm
    call :log_success "NPM encontrado - usando NPM"
    goto :eof
)

call :log_error "Nenhum gerenciador de pacotes encontrado!"
exit /b 1

:install_dependencies
call :log_info "Instalando dependências..."

if "%PACKAGE_MANAGER%"=="bun" (
    bun install
) else if "%PACKAGE_MANAGER%"=="yarn" (
    yarn install
) else if "%PACKAGE_MANAGER%"=="npm" (
    npm install
)

if %errorlevel% equ 0 (
    call :log_success "Dependências instaladas com sucesso!"
) else (
    call :log_error "Erro ao instalar dependências"
    exit /b 1
)
goto :eof

:check_supabase_cli
call :log_info "Verificando Supabase CLI..."
supabase --version >nul 2>&1
if %errorlevel% neq 0 (
    call :log_warning "Supabase CLI não encontrado"
    call :log_info "Instalando Supabase CLI via NPM..."
    npm install -g supabase
    if !errorlevel! equ 0 (
        call :log_success "Supabase CLI instalado!"
    ) else (
        call :log_warning "Falha ao instalar Supabase CLI automaticamente"
        echo Instale manualmente: https://supabase.com/docs/guides/cli
    )
) else (
    call :log_success "Supabase CLI encontrado"
)
goto :eof

:create_env_file
call :log_info "Configurando arquivo de ambiente..."

if not exist ".env.local" (
    (
        echo # 🔧 Configurações do Supabase
        echo # Substitua pelos valores do seu projeto
        echo VITE_SUPABASE_URL=https://hnftxautmxviwrfuaosu.supabase.co
        echo VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuZnR4YXV0bXh2aXdyZnVhb3N1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMTg1MDksImV4cCI6MjA2OTU5NDUwOX0.oBxH287kos3h2FXuP8jdr-IMjGW_QWf_VVxMEe4cjks
        echo.
        echo # 🔧 Google OAuth (Opcional^)
        echo # Configure após criar projeto no Google Cloud Console
        echo VITE_GOOGLE_CLIENT_ID=
        echo.
        echo # 🔧 Configurações de Desenvolvimento
        echo VITE_APP_URL=http://localhost:8080
    ) > .env.local
    call :log_success "Arquivo .env.local criado!"
    call :log_warning "⚠️  IMPORTANTE: Configure as variáveis de ambiente em .env.local"
) else (
    call :log_info "Arquivo .env.local já existe"
)
goto :eof

:setup_git
call :log_info "Verificando Git..."
if exist ".git" (
    call :log_success "Repositório Git encontrado"
) else (
    git --version >nul 2>&1
    if !errorlevel! equ 0 (
        call :log_info "Inicializando repositório Git..."
        git init
        git add .
        git commit -m "Initial commit - Professor Musical setup"
        call :log_success "Repositório Git inicializado!"
    ) else (
        call :log_warning "Git não encontrado - pule esta etapa se não precisar"
    )
)
goto :eof

:test_installation
call :log_info "Testando instalação..."

%PACKAGE_MANAGER% run dev --help >nul 2>&1
if %errorlevel% equ 0 (
    call :log_success "Comando de desenvolvimento configurado!"
) else (
    call :log_warning "Comando de desenvolvimento pode não estar funcionando"
)
goto :eof

:show_next_steps
echo.
echo 🎉 INSTALAÇÃO CONCLUÍDA!
echo ==================================================
echo.
echo 📋 PRÓXIMOS PASSOS:
echo.
echo 1. 📝 Configure o Supabase:
echo    - Acesse: https://supabase.com/
echo    - Crie um novo projeto
echo    - Configure as variáveis em .env.local
echo.
echo 2. 🔧 Configure Google OAuth (opcional^):
echo    - Siga o tutorial em TUTORIAL_COMPLETO_INSTALACAO.md
echo.
echo 3. 🚀 Execute o projeto:
echo    %PACKAGE_MANAGER% run dev
echo.
echo 4. 🌐 Acesse:
echo    http://localhost:8080
echo.
echo 📖 Documentação completa:
echo    - TUTORIAL_COMPLETO_INSTALACAO.md
echo    - CONFIGURACAO_SISTEMA.md
echo.
echo 🆘 Problemas? Verifique os logs acima ou consulte a documentação.
echo.
goto :eof

:main
call :log_info "Iniciando verificações..."

call :check_node
if %errorlevel% neq 0 exit /b 1

call :check_package_manager
if %errorlevel% neq 0 exit /b 1

call :check_supabase_cli
call :install_dependencies
if %errorlevel% neq 0 exit /b 1

call :create_env_file
call :setup_git
call :test_installation
call :show_next_steps

echo.
echo [SUCCESS] Script de instalação finalizado!
echo ==================================================
echo.
pause