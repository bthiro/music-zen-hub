#!/usr/bin/env node

/**
 * 🔧 Script de Configuração de Ambiente - Professor Musical
 * Configura automaticamente as variáveis de ambiente necessárias
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Cores para terminal
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

// Função para logs coloridos
const log = {
    info: (msg) => console.log(`${colors.blue}[INFO]${colors.reset} ${msg}`),
    success: (msg) => console.log(`${colors.green}[SUCCESS]${colors.reset} ${msg}`),
    warning: (msg) => console.log(`${colors.yellow}[WARNING]${colors.reset} ${msg}`),
    error: (msg) => console.log(`${colors.red}[ERROR]${colors.reset} ${msg}`),
    header: (msg) => console.log(`${colors.magenta}${colors.bright}${msg}${colors.reset}`),
};

// Interface para input do usuário
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Função para fazer pergunta
const question = (query) => {
    return new Promise((resolve) => {
        rl.question(query, resolve);
    });
};

// Configurações necessárias
const configs = [
    {
        key: 'VITE_SUPABASE_URL',
        name: 'URL do Supabase',
        description: 'URL do seu projeto Supabase (ex: https://xxx.supabase.co)',
        required: true,
        default: 'https://hnftxautmxviwrfuaosu.supabase.co',
        validate: (value) => value.startsWith('https://') && value.includes('.supabase.co')
    },
    {
        key: 'VITE_SUPABASE_ANON_KEY',
        name: 'Chave Anônima do Supabase',
        description: 'Chave pública do Supabase (começa com eyJ)',
        required: true,
        default: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuZnR4YXV0bXh2aXdyZnVhb3N1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMTg1MDksImV4cCI6MjA2OTU5NDUwOX0.oBxH287kos3h2FXuP8jdr-IMjGW_QWf_VVxMEe4cjks',
        validate: (value) => value.startsWith('eyJ')
    },
    {
        key: 'VITE_GOOGLE_CLIENT_ID',
        name: 'Google Client ID',
        description: 'ID do cliente OAuth Google (termina com .googleusercontent.com)',
        required: false,
        validate: (value) => !value || value.endsWith('.googleusercontent.com')
    },
    {
        key: 'VITE_APP_URL',
        name: 'URL da Aplicação',
        description: 'URL onde a aplicação será executada',
        required: true,
        default: 'http://localhost:8080',
        validate: (value) => value.startsWith('http')
    }
];

// Função principal
async function main() {
    console.clear();
    log.header('🔧 CONFIGURAÇÃO DE AMBIENTE - PROFESSOR MUSICAL');
    console.log('='.repeat(60));
    console.log();

    log.info('Este script irá configurar as variáveis de ambiente necessárias.');
    log.info('Pressione ENTER para usar valores padrão quando disponível.');
    console.log();

    // Verificar se já existe arquivo .env
    const envPath = path.join(process.cwd(), '.env.local');
    let existingEnv = {};
    
    if (fs.existsSync(envPath)) {
        log.warning('Arquivo .env.local já existe!');
        const overwrite = await question('Deseja sobrescrever? (s/N): ');
        
        if (overwrite.toLowerCase() !== 's') {
            log.info('Operação cancelada.');
            rl.close();
            return;
        }

        // Ler configurações existentes
        const existingContent = fs.readFileSync(envPath, 'utf8');
        existingContent.split('\n').forEach(line => {
            if (line.includes('=') && !line.startsWith('#')) {
                const [key, ...valueParts] = line.split('=');
                existingEnv[key.trim()] = valueParts.join('=').trim();
            }
        });
    }

    console.log();
    log.info('📝 Configurando variáveis...');
    console.log();

    // Coletar configurações
    const newEnv = {};
    
    for (const config of configs) {
        const existingValue = existingEnv[config.key];
        const defaultValue = config.default || existingValue || '';
        
        let prompt = `${config.name}`;
        if (config.required) {
            prompt += ' (obrigatório)';
        }
        if (defaultValue) {
            prompt += ` [${defaultValue}]`;
        }
        prompt += ': ';

        while (true) {
            const value = await question(prompt);
            const finalValue = value.trim() || defaultValue;

            // Validar se obrigatório
            if (config.required && !finalValue) {
                log.error('Este campo é obrigatório!');
                continue;
            }

            // Validar formato se fornecido
            if (finalValue && config.validate && !config.validate(finalValue)) {
                log.error('Formato inválido! ' + config.description);
                continue;
            }

            newEnv[config.key] = finalValue;
            if (finalValue) {
                log.success(`✓ ${config.name} configurado`);
            } else {
                log.info(`○ ${config.name} deixado vazio (opcional)`);
            }
            break;
        }
        console.log();
    }

    // Gerar arquivo .env
    console.log();
    log.info('📄 Gerando arquivo .env.local...');

    const envContent = `# 🔧 Configurações do Professor Musical
# Gerado automaticamente em ${new Date().toLocaleString()}

# ================================
# 🗄️ SUPABASE (OBRIGATÓRIO)
# ================================
VITE_SUPABASE_URL=${newEnv.VITE_SUPABASE_URL}
VITE_SUPABASE_ANON_KEY=${newEnv.VITE_SUPABASE_ANON_KEY}

# ================================
# 🔐 GOOGLE OAUTH (OPCIONAL)
# ================================
VITE_GOOGLE_CLIENT_ID=${newEnv.VITE_GOOGLE_CLIENT_ID || ''}

# ================================
# 🌐 CONFIGURAÇÕES DA APLICAÇÃO
# ================================
VITE_APP_URL=${newEnv.VITE_APP_URL}

# ================================
# 📝 NOTAS DE CONFIGURAÇÃO
# ================================
# 1. Para habilitar Google OAuth:
#    - Configure um projeto no Google Cloud Console
#    - Adicione o VITE_GOOGLE_CLIENT_ID acima
#    - Configure as URLs de redirect no Google Console
#
# 2. Para pagamentos e WhatsApp:
#    - Configure os secrets no Supabase Dashboard
#    - Veja TUTORIAL_COMPLETO_INSTALACAO.md para detalhes
#
# 3. URLs importantes:
#    - Supabase Dashboard: https://supabase.com/dashboard
#    - Google Cloud Console: https://console.cloud.google.com
#    - Documentação: ./TUTORIAL_COMPLETO_INSTALACAO.md
`;

    try {
        fs.writeFileSync(envPath, envContent);
        log.success('Arquivo .env.local criado com sucesso!');
    } catch (error) {
        log.error('Erro ao criar arquivo: ' + error.message);
        rl.close();
        return;
    }

    // Verificar configuração
    console.log();
    log.info('🔍 Verificando configuração...');

    const issues = [];
    if (!newEnv.VITE_SUPABASE_URL || !newEnv.VITE_SUPABASE_URL.includes('.supabase.co')) {
        issues.push('URL do Supabase inválida');
    }
    if (!newEnv.VITE_SUPABASE_ANON_KEY || !newEnv.VITE_SUPABASE_ANON_KEY.startsWith('eyJ')) {
        issues.push('Chave do Supabase inválida');
    }

    if (issues.length > 0) {
        log.warning('⚠️  Problemas encontrados:');
        issues.forEach(issue => console.log(`   - ${issue}`));
        console.log();
        log.info('Você pode corrigir estes problemas editando .env.local manualmente.');
    } else {
        log.success('✅ Configuração válida!');
    }

    // Próximos passos
    console.log();
    log.header('🎉 CONFIGURAÇÃO CONCLUÍDA!');
    console.log('='.repeat(60));
    console.log();
    log.info('📋 PRÓXIMOS PASSOS:');
    console.log();
    console.log('1. 🚀 Execute a aplicação:');
    console.log('   npm run dev   (ou yarn dev / bun dev)');
    console.log();
    console.log('2. 🌐 Acesse no navegador:');
    console.log(`   ${newEnv.VITE_APP_URL}`);
    console.log();
    console.log('3. 📖 Consulte a documentação:');
    console.log('   - TUTORIAL_COMPLETO_INSTALACAO.md');
    console.log('   - CONFIGURACAO_SISTEMA.md');
    console.log();
    
    if (!newEnv.VITE_GOOGLE_CLIENT_ID) {
        log.warning('💡 Para habilitar login com Google:');
        console.log('   - Siga as instruções em TUTORIAL_COMPLETO_INSTALACAO.md');
        console.log('   - Configure o Google Cloud Console');
        console.log('   - Execute este script novamente');
        console.log();
    }

    log.success('Setup concluído! Boa sorte com o Professor Musical! 🎵');
    
    rl.close();
}

// Executar script
main().catch(error => {
    log.error('Erro inesperado: ' + error.message);
    rl.close();
    process.exit(1);
});