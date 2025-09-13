// Portuguese translations for the application
export const TRANSLATIONS = {
  // Common
  common: {
    loading: 'Carregando...',
    saving: 'Salvando...',
    save: 'Salvar',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    delete: 'Excluir',
    edit: 'Editar',
    create: 'Criar',
    update: 'Atualizar',
    search: 'Buscar',
    filter: 'Filtrar',
    clear: 'Limpar',
    success: 'Sucesso',
    error: 'Erro',
    warning: 'Aviso',
    info: 'Informação',
    yes: 'Sim',
    no: 'Não',
    ok: 'OK',
    close: 'Fechar',
    back: 'Voltar',
    next: 'Próximo',
    previous: 'Anterior',
    finish: 'Finalizar',
    continue: 'Continuar',
    skip: 'Pular',
    retry: 'Tentar novamente',
    refresh: 'Atualizar',
    download: 'Baixar',
    upload: 'Enviar',
    copy: 'Copiar',
    paste: 'Colar',
    cut: 'Recortar',
    select: 'Selecionar',
    selectAll: 'Selecionar tudo',
    deselect: 'Desmarcar',
    expand: 'Expandir',
    collapse: 'Recolher',
    show: 'Mostrar',
    hide: 'Ocultar',
    enable: 'Habilitar',
    disable: 'Desabilitar',
    connect: 'Conectar',
    disconnect: 'Desconectar',
    online: 'Online',
    offline: 'Offline',
    active: 'Ativo',
    inactive: 'Inativo',
    available: 'Disponível',
    unavailable: 'Indisponível',
    public: 'Público',
    private: 'Privado',
    required: 'Obrigatório',
    optional: 'Opcional',
    recommended: 'Recomendado',
    preview: 'Visualizar',
    print: 'Imprimir',
    export: 'Exportar',
    import: 'Importar',
    settings: 'Configurações',
    help: 'Ajuda',
    about: 'Sobre',
    version: 'Versão',
    license: 'Licença',
    terms: 'Termos',
    privacy: 'Privacidade'
  },

  // Authentication
  auth: {
    signIn: 'Entrar',
    signUp: 'Criar Conta',
    signOut: 'Sair',
    login: 'Login',
    register: 'Cadastrar',
    email: 'E-mail',
    password: 'Senha',
    confirmPassword: 'Confirmar Senha',
    currentPassword: 'Senha Atual',
    newPassword: 'Nova Senha',
    forgotPassword: 'Esqueci minha senha',
    resetPassword: 'Redefinir Senha',
    changePassword: 'Alterar Senha',
    rememberMe: 'Lembrar-me',
    signInWithGoogle: 'Entrar com Google',
    createAccount: 'Criar uma conta',
    alreadyHaveAccount: 'Já tem uma conta?',
    dontHaveAccount: 'Não tem uma conta?',
    unauthorized: 'Não autorizado',
    sessionExpired: 'Sessão expirada',
    invalidCredentials: 'Credenciais inválidas',
    accountLocked: 'Conta bloqueada',
    tooManyAttempts: 'Muitas tentativas',
    emailNotConfirmed: 'E-mail não confirmado',
    weakPassword: 'Senha muito fraca',
    passwordMismatch: 'Senhas não coincidem',
    emailInUse: 'E-mail já em uso',
    invalidEmail: 'E-mail inválido',
    userNotFound: 'Usuário não encontrado',
    wrongPassword: 'Senha incorreta',
    accountCreated: 'Conta criada com sucesso',
    passwordChanged: 'Senha alterada com sucesso',
    passwordResetSent: 'E-mail de redefinição enviado',
    loginSuccessful: 'Login realizado com sucesso',
    logoutSuccessful: 'Logout realizado com sucesso'
  },

  // Navigation
  navigation: {
    home: 'Início',
    dashboard: 'Dashboard',
    profile: 'Perfil',
    students: 'Alunos',
    classes: 'Aulas',
    payments: 'Pagamentos',
    reports: 'Relatórios',
    settings: 'Configurações',
    tools: 'Ferramentas',
    calendar: 'Agenda',
    integrations: 'Integrações',
    administration: 'Administração',
    professors: 'Professores',
    billing: 'Cobrança',
    subscriptions: 'Assinaturas',
    overview: 'Visão Geral'
  },

  // Forms
  forms: {
    name: 'Nome',
    fullName: 'Nome Completo',
    firstName: 'Primeiro Nome',
    lastName: 'Sobrenome',
    email: 'E-mail',
    phone: 'Telefone',
    address: 'Endereço',
    city: 'Cidade',
    state: 'Estado',
    zipCode: 'CEP',
    country: 'País',
    birthDate: 'Data de Nascimento',
    gender: 'Gênero',
    bio: 'Biografia',
    description: 'Descrição',
    notes: 'Observações',
    value: 'Valor',
    amount: 'Quantia',
    quantity: 'Quantidade',
    price: 'Preço',
    date: 'Data',
    time: 'Hora',
    startDate: 'Data de Início',
    endDate: 'Data de Fim',
    dueDate: 'Data de Vencimento',
    paymentDate: 'Data de Pagamento',
    status: 'Status',
    type: 'Tipo',
    category: 'Categoria',
    subject: 'Assunto',
    message: 'Mensagem',
    title: 'Título',
    specialties: 'Especialidades',
    pixKey: 'Chave PIX',
    billingText: 'Texto de Cobrança',
    paymentMethod: 'Forma de Pagamento',
    selectPlaceholder: 'Selecione uma opção'
  },

  // Validation Messages
  validation: {
    required: 'Este campo é obrigatório',
    invalidEmail: 'E-mail inválido',
    invalidPhone: 'Telefone inválido',
    invalidUrl: 'URL inválida',
    invalidDate: 'Data inválida',
    minLength: 'Mínimo de {min} caracteres',
    maxLength: 'Máximo de {max} caracteres',
    minValue: 'Valor mínimo: {min}',
    maxValue: 'Valor máximo: {max}',
    mustMatch: 'Os campos devem coincidir',
    invalidFormat: 'Formato inválido',
    fileTooLarge: 'Arquivo muito grande (máximo {max})',
    invalidFileType: 'Tipo de arquivo inválido',
    imageRequired: 'Selecione uma imagem',
    passwordTooWeak: 'Senha muito fraca (mínimo 6 caracteres)',
    emailAlreadyExists: 'Este e-mail já está em uso',
    phoneAlreadyExists: 'Este telefone já está em uso'
  },

  // Status
  status: {
    active: 'Ativo',
    inactive: 'Inativo',
    pending: 'Pendente',
    approved: 'Aprovado',
    rejected: 'Rejeitado',
    cancelled: 'Cancelado',
    completed: 'Concluído',
    inProgress: 'Em Andamento',
    scheduled: 'Agendado',
    confirmed: 'Confirmado',
    paid: 'Pago',
    unpaid: 'Não Pago',
    overdue: 'Vencido',
    partial: 'Parcial',
    refunded: 'Reembolsado',
    processing: 'Processando',
    failed: 'Falhou',
    expired: 'Expirado',
    draft: 'Rascunho',
    published: 'Publicado',
    archived: 'Arquivado'
  },

  // Payment Methods
  paymentMethods: {
    pix: 'PIX',
    creditCard: 'Cartão de Crédito',
    debitCard: 'Cartão de Débito',
    cash: 'Dinheiro',
    bankTransfer: 'Transferência Bancária',
    mercadoPago: 'Mercado Pago',
    paypal: 'PayPal',
    billet: 'Boleto',
    financing: 'Financiamento'
  },

  // Messages
  messages: {
    // Success Messages
    profileUpdated: 'Perfil atualizado com sucesso',
    avatarUpdated: 'Avatar atualizado com sucesso',
    passwordChanged: 'Senha alterada com sucesso',
    dataDeleted: 'Dados excluídos com sucesso',
    dataSaved: 'Dados salvos com sucesso',
    emailSent: 'E-mail enviado com sucesso',
    paymentProcessed: 'Pagamento processado com sucesso',
    paymentConfirmed: 'Pagamento confirmado com sucesso',
    integrationConnected: 'Integração conectada com sucesso',
    integrationDisconnected: 'Integração desconectada com sucesso',
    
    // Error Messages
    profileUpdateError: 'Erro ao atualizar perfil',
    avatarUploadError: 'Erro no upload do avatar',
    passwordChangeError: 'Erro ao alterar senha',
    deleteError: 'Erro ao excluir',
    saveError: 'Erro ao salvar',
    loadError: 'Erro ao carregar dados',
    connectionError: 'Erro de conexão',
    serverError: 'Erro interno do servidor',
    unauthorizedError: 'Acesso não autorizado',
    notFoundError: 'Dados não encontrados',
    validationError: 'Erro de validação',
    paymentError: 'Erro no pagamento',
    integrationError: 'Erro na integração',
    
    // Confirmation Messages
    confirmDelete: 'Tem certeza que deseja excluir?',
    confirmCancel: 'Tem certeza que deseja cancelar?',
    confirmLogout: 'Tem certeza que deseja sair?',
    confirmDisconnect: 'Tem certeza que deseja desconectar?',
    unsavedChanges: 'Há alterações não salvas. Deseja continuar?',
    
    // Info Messages
    noDataFound: 'Nenhum dado encontrado',
    emptyList: 'Lista vazia',
    selectItem: 'Selecione um item',
    loadingData: 'Carregando dados...',
    processingRequest: 'Processando solicitação...',
    uploadInProgress: 'Upload em andamento...',
    
    // Placeholder Messages
    searchPlaceholder: 'Digite para buscar...',
    emailPlaceholder: 'seu@email.com',
    phonePlaceholder: '(11) 99999-9999',
    namePlaceholder: 'Digite o nome',
    passwordPlaceholder: 'Digite sua senha',
    messagePlaceholder: 'Digite sua mensagem...',
    notesPlaceholder: 'Adicione suas observações...'
  },

  // Business Logic
  business: {
    students: 'Alunos',
    student: 'Aluno',
    classes: 'Aulas',
    class: 'Aula',
    payments: 'Pagamentos',
    payment: 'Pagamento',
    professors: 'Professores',
    professor: 'Professor',
    schedules: 'Horários',
    schedule: 'Horário',
    instruments: 'Instrumentos',
    instrument: 'Instrumento',
    levels: 'Níveis',
    level: 'Nível',
    beginner: 'Iniciante',
    intermediate: 'Intermediário',
    advanced: 'Avançado',
    monthly: 'Mensal',
    weekly: 'Semanal',
    daily: 'Diário',
    individual: 'Individual',
    group: 'Grupo',
    online: 'Online',
    inPerson: 'Presencial',
    hybrid: 'Híbrido',
    // Dashboard Stats
    totalStudents: 'Total de Alunos',
    monthlyRevenue: 'Receita Mensal',
    receivedPayments: 'Pagamentos Recebidos',
    vsPreviousMonth: 'vs. mês anterior',
    monthlyLessons: 'Aulas no Mês',
    scheduledLessons: 'Aulas Agendadas',
    pendingPayments: 'Pagamentos Pendentes',
    overduePayments: 'Pagamentos Atrasados',
    // More stats
    activeStudents: 'Alunos Ativos',
    inactiveStudents: 'Alunos Inativos',
    suspendedStudents: 'Alunos Suspensos',
    completedLessons: 'Aulas Realizadas',
    cancelledLessons: 'Aulas Canceladas',
    totalRevenue: 'Receita Total',
    averageClassValue: 'Valor Médio por Aula',
    conversionRate: 'Taxa de Conversão'
  }
};

// Helper function to get nested translation with fallback
export function t(key: string, params?: Record<string, any>): string {
  const keys = key.split('.');
  let value: any = TRANSLATIONS;
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  if (typeof value !== 'string') {
    console.warn(`Translation key not found: ${key}`);
    return key;
  }
  
  // Replace parameters in the string
  if (params) {
    return Object.entries(params).reduce(
      (str, [param, val]) => str.replace(`{${param}}`, String(val)),
      value
    );
  }
  
  return value;
}