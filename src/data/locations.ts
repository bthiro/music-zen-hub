// Sistema de localização com fusos horários
export interface Country {
  code: string;
  name: string;
  timezone: string;
  states?: State[];
}

export interface State {
  code: string;
  name: string;
  timezone?: string;
  cities: City[];
}

export interface City {
  name: string;
  timezone: string;
  utcOffset: string;
}

export const countries: Country[] = [
  {
    code: 'BR',
    name: 'Brasil',
    timezone: 'America/Sao_Paulo',
    states: [
      {
        code: 'AC',
        name: 'Acre',
        timezone: 'America/Rio_Branco',
        cities: [
          { name: 'Rio Branco', timezone: 'America/Rio_Branco', utcOffset: 'UTC-5' },
          { name: 'Cruzeiro do Sul', timezone: 'America/Rio_Branco', utcOffset: 'UTC-5' },
          { name: 'Sena Madureira', timezone: 'America/Rio_Branco', utcOffset: 'UTC-5' }
        ]
      },
      {
        code: 'AL',
        name: 'Alagoas',
        cities: [
          { name: 'Maceió', timezone: 'America/Sao_Paulo', utcOffset: 'UTC-3' },
          { name: 'Arapiraca', timezone: 'America/Sao_Paulo', utcOffset: 'UTC-3' },
          { name: 'Palmeira dos Índios', timezone: 'America/Sao_Paulo', utcOffset: 'UTC-3' }
        ]
      },
      {
        code: 'AP',
        name: 'Amapá',
        cities: [
          { name: 'Macapá', timezone: 'America/Sao_Paulo', utcOffset: 'UTC-3' },
          { name: 'Santana', timezone: 'America/Sao_Paulo', utcOffset: 'UTC-3' },
          { name: 'Laranjal do Jari', timezone: 'America/Sao_Paulo', utcOffset: 'UTC-3' }
        ]
      },
      {
        code: 'AM',
        name: 'Amazonas',
        timezone: 'America/Manaus',
        cities: [
          { name: 'Manaus', timezone: 'America/Manaus', utcOffset: 'UTC-4' },
          { name: 'Parintins', timezone: 'America/Manaus', utcOffset: 'UTC-4' },
          { name: 'Itacoatiara', timezone: 'America/Manaus', utcOffset: 'UTC-4' },
          { name: 'Manacapuru', timezone: 'America/Manaus', utcOffset: 'UTC-4' }
        ]
      },
      {
        code: 'BA',
        name: 'Bahia',
        cities: [
          { name: 'Salvador', timezone: 'America/Sao_Paulo', utcOffset: 'UTC-3' },
          { name: 'Feira de Santana', timezone: 'America/Sao_Paulo', utcOffset: 'UTC-3' },
          { name: 'Vitória da Conquista', timezone: 'America/Sao_Paulo', utcOffset: 'UTC-3' },
          { name: 'Camaçari', timezone: 'America/Sao_Paulo', utcOffset: 'UTC-3' }
        ]
      },
      {
        code: 'CE',
        name: 'Ceará',
        cities: [
          { name: 'Fortaleza', timezone: 'America/Fortaleza', utcOffset: 'UTC-3' },
          { name: 'Caucaia', timezone: 'America/Fortaleza', utcOffset: 'UTC-3' },
          { name: 'Juazeiro do Norte', timezone: 'America/Fortaleza', utcOffset: 'UTC-3' },
          { name: 'Maracanaú', timezone: 'America/Fortaleza', utcOffset: 'UTC-3' }
        ]
      },
      {
        code: 'DF',
        name: 'Distrito Federal',
        cities: [
          { name: 'Brasília', timezone: 'America/Sao_Paulo', utcOffset: 'UTC-3' }
        ]
      },
      {
        code: 'ES',
        name: 'Espírito Santo',
        cities: [
          { name: 'Vitória', timezone: 'America/Sao_Paulo', utcOffset: 'UTC-3' },
          { name: 'Vila Velha', timezone: 'America/Sao_Paulo', utcOffset: 'UTC-3' },
          { name: 'Cariacica', timezone: 'America/Sao_Paulo', utcOffset: 'UTC-3' },
          { name: 'Serra', timezone: 'America/Sao_Paulo', utcOffset: 'UTC-3' }
        ]
      },
      {
        code: 'GO',
        name: 'Goiás',
        cities: [
          { name: 'Goiânia', timezone: 'America/Sao_Paulo', utcOffset: 'UTC-3' },
          { name: 'Aparecida de Goiânia', timezone: 'America/Sao_Paulo', utcOffset: 'UTC-3' },
          { name: 'Anápolis', timezone: 'America/Sao_Paulo', utcOffset: 'UTC-3' },
          { name: 'Rio Verde', timezone: 'America/Sao_Paulo', utcOffset: 'UTC-3' }
        ]
      },
      {
        code: 'MA',
        name: 'Maranhão',
        cities: [
          { name: 'São Luís', timezone: 'America/Sao_Paulo', utcOffset: 'UTC-3' },
          { name: 'Imperatriz', timezone: 'America/Sao_Paulo', utcOffset: 'UTC-3' },
          { name: 'Timon', timezone: 'America/Sao_Paulo', utcOffset: 'UTC-3' },
          { name: 'Caxias', timezone: 'America/Sao_Paulo', utcOffset: 'UTC-3' }
        ]
      },
      {
        code: 'MT',
        name: 'Mato Grosso',
        timezone: 'America/Cuiaba',
        cities: [
          { name: 'Cuiabá', timezone: 'America/Cuiaba', utcOffset: 'UTC-4' },
          { name: 'Várzea Grande', timezone: 'America/Cuiaba', utcOffset: 'UTC-4' },
          { name: 'Rondonópolis', timezone: 'America/Cuiaba', utcOffset: 'UTC-4' },
          { name: 'Sinop', timezone: 'America/Cuiaba', utcOffset: 'UTC-4' }
        ]
      },
      {
        code: 'MS',
        name: 'Mato Grosso do Sul',
        timezone: 'America/Campo_Grande',
        cities: [
          { name: 'Campo Grande', timezone: 'America/Campo_Grande', utcOffset: 'UTC-4' },
          { name: 'Dourados', timezone: 'America/Campo_Grande', utcOffset: 'UTC-4' },
          { name: 'Três Lagoas', timezone: 'America/Campo_Grande', utcOffset: 'UTC-4' },
          { name: 'Corumbá', timezone: 'America/Campo_Grande', utcOffset: 'UTC-4' }
        ]
      },
      {
        code: 'MG',
        name: 'Minas Gerais',
        cities: [
          { name: 'Belo Horizonte', timezone: 'America/Sao_Paulo', utcOffset: 'UTC-3' },
          { name: 'Uberlândia', timezone: 'America/Sao_Paulo', utcOffset: 'UTC-3' },
          { name: 'Contagem', timezone: 'America/Sao_Paulo', utcOffset: 'UTC-3' },
          { name: 'Juiz de Fora', timezone: 'America/Sao_Paulo', utcOffset: 'UTC-3' }
        ]
      },
      {
        code: 'PA',
        name: 'Pará',
        timezone: 'America/Belem',
        cities: [
          { name: 'Belém', timezone: 'America/Belem', utcOffset: 'UTC-3' },
          { name: 'Ananindeua', timezone: 'America/Belem', utcOffset: 'UTC-3' },
          { name: 'Santarém', timezone: 'America/Belem', utcOffset: 'UTC-3' },
          { name: 'Marabá', timezone: 'America/Belem', utcOffset: 'UTC-3' }
        ]
      },
      {
        code: 'PB',
        name: 'Paraíba',
        cities: [
          { name: 'João Pessoa', timezone: 'America/Sao_Paulo', utcOffset: 'UTC-3' },
          { name: 'Campina Grande', timezone: 'America/Sao_Paulo', utcOffset: 'UTC-3' },
          { name: 'Santa Rita', timezone: 'America/Sao_Paulo', utcOffset: 'UTC-3' },
          { name: 'Patos', timezone: 'America/Sao_Paulo', utcOffset: 'UTC-3' }
        ]
      },
      {
        code: 'PR',
        name: 'Paraná',
        cities: [
          { name: 'Curitiba', timezone: 'America/Sao_Paulo', utcOffset: 'UTC-3' },
          { name: 'Londrina', timezone: 'America/Sao_Paulo', utcOffset: 'UTC-3' },
          { name: 'Maringá', timezone: 'America/Sao_Paulo', utcOffset: 'UTC-3' },
          { name: 'Ponta Grossa', timezone: 'America/Sao_Paulo', utcOffset: 'UTC-3' }
        ]
      },
      {
        code: 'PE',
        name: 'Pernambuco',
        cities: [
          { name: 'Recife', timezone: 'America/Recife', utcOffset: 'UTC-3' },
          { name: 'Jaboatão dos Guararapes', timezone: 'America/Recife', utcOffset: 'UTC-3' },
          { name: 'Olinda', timezone: 'America/Recife', utcOffset: 'UTC-3' },
          { name: 'Paulista', timezone: 'America/Recife', utcOffset: 'UTC-3' }
        ]
      },
      {
        code: 'PI',
        name: 'Piauí',
        cities: [
          { name: 'Teresina', timezone: 'America/Sao_Paulo', utcOffset: 'UTC-3' },
          { name: 'Parnaíba', timezone: 'America/Sao_Paulo', utcOffset: 'UTC-3' },
          { name: 'Picos', timezone: 'America/Sao_Paulo', utcOffset: 'UTC-3' },
          { name: 'Piripiri', timezone: 'America/Sao_Paulo', utcOffset: 'UTC-3' }
        ]
      },
      {
        code: 'RJ',
        name: 'Rio de Janeiro',
        cities: [
          { name: 'Rio de Janeiro', timezone: 'America/Sao_Paulo', utcOffset: 'UTC-3' },
          { name: 'São Gonçalo', timezone: 'America/Sao_Paulo', utcOffset: 'UTC-3' },
          { name: 'Duque de Caxias', timezone: 'America/Sao_Paulo', utcOffset: 'UTC-3' },
          { name: 'Nova Iguaçu', timezone: 'America/Sao_Paulo', utcOffset: 'UTC-3' }
        ]
      },
      {
        code: 'RN',
        name: 'Rio Grande do Norte',
        cities: [
          { name: 'Natal', timezone: 'America/Sao_Paulo', utcOffset: 'UTC-3' },
          { name: 'Mossoró', timezone: 'America/Sao_Paulo', utcOffset: 'UTC-3' },
          { name: 'Parnamirim', timezone: 'America/Sao_Paulo', utcOffset: 'UTC-3' },
          { name: 'São Gonçalo do Amarante', timezone: 'America/Sao_Paulo', utcOffset: 'UTC-3' }
        ]
      },
      {
        code: 'RS',
        name: 'Rio Grande do Sul',
        cities: [
          { name: 'Porto Alegre', timezone: 'America/Sao_Paulo', utcOffset: 'UTC-3' },
          { name: 'Caxias do Sul', timezone: 'America/Sao_Paulo', utcOffset: 'UTC-3' },
          { name: 'Pelotas', timezone: 'America/Sao_Paulo', utcOffset: 'UTC-3' },
          { name: 'Canoas', timezone: 'America/Sao_Paulo', utcOffset: 'UTC-3' }
        ]
      },
      {
        code: 'RO',
        name: 'Rondônia',
        timezone: 'America/Porto_Velho',
        cities: [
          { name: 'Porto Velho', timezone: 'America/Porto_Velho', utcOffset: 'UTC-4' },
          { name: 'Ji-Paraná', timezone: 'America/Porto_Velho', utcOffset: 'UTC-4' },
          { name: 'Ariquemes', timezone: 'America/Porto_Velho', utcOffset: 'UTC-4' },
          { name: 'Vilhena', timezone: 'America/Porto_Velho', utcOffset: 'UTC-4' }
        ]
      },
      {
        code: 'RR',
        name: 'Roraima',
        timezone: 'America/Boa_Vista',
        cities: [
          { name: 'Boa Vista', timezone: 'America/Boa_Vista', utcOffset: 'UTC-4' },
          { name: 'Rorainópolis', timezone: 'America/Boa_Vista', utcOffset: 'UTC-4' },
          { name: 'Caracaraí', timezone: 'America/Boa_Vista', utcOffset: 'UTC-4' }
        ]
      },
      {
        code: 'SC',
        name: 'Santa Catarina',
        cities: [
          { name: 'Florianópolis', timezone: 'America/Sao_Paulo', utcOffset: 'UTC-3' },
          { name: 'Joinville', timezone: 'America/Sao_Paulo', utcOffset: 'UTC-3' },
          { name: 'Blumenau', timezone: 'America/Sao_Paulo', utcOffset: 'UTC-3' },
          { name: 'São José', timezone: 'America/Sao_Paulo', utcOffset: 'UTC-3' }
        ]
      },
      {
        code: 'SP',
        name: 'São Paulo',
        cities: [
          { name: 'São Paulo', timezone: 'America/Sao_Paulo', utcOffset: 'UTC-3' },
          { name: 'Guarulhos', timezone: 'America/Sao_Paulo', utcOffset: 'UTC-3' },
          { name: 'Campinas', timezone: 'America/Sao_Paulo', utcOffset: 'UTC-3' },
          { name: 'São Bernardo do Campo', timezone: 'America/Sao_Paulo', utcOffset: 'UTC-3' }
        ]
      },
      {
        code: 'SE',
        name: 'Sergipe',
        cities: [
          { name: 'Aracaju', timezone: 'America/Sao_Paulo', utcOffset: 'UTC-3' },
          { name: 'Nossa Senhora do Socorro', timezone: 'America/Sao_Paulo', utcOffset: 'UTC-3' },
          { name: 'Lagarto', timezone: 'America/Sao_Paulo', utcOffset: 'UTC-3' },
          { name: 'Itabaiana', timezone: 'America/Sao_Paulo', utcOffset: 'UTC-3' }
        ]
      },
      {
        code: 'TO',
        name: 'Tocantins',
        cities: [
          { name: 'Palmas', timezone: 'America/Sao_Paulo', utcOffset: 'UTC-3' },
          { name: 'Araguaína', timezone: 'America/Sao_Paulo', utcOffset: 'UTC-3' },
          { name: 'Gurupi', timezone: 'America/Sao_Paulo', utcOffset: 'UTC-3' },
          { name: 'Porto Nacional', timezone: 'America/Sao_Paulo', utcOffset: 'UTC-3' }
        ]
      }
    ]
  },
  {
    code: 'US',
    name: 'Estados Unidos',
    timezone: 'America/New_York',
    states: [
      {
        code: 'NY',
        name: 'Nova York',
        cities: [
          { name: 'Nova York', timezone: 'America/New_York', utcOffset: 'UTC-5' },
          { name: 'Buffalo', timezone: 'America/New_York', utcOffset: 'UTC-5' },
          { name: 'Rochester', timezone: 'America/New_York', utcOffset: 'UTC-5' }
        ]
      },
      {
        code: 'CA',
        name: 'Califórnia',
        cities: [
          { name: 'Los Angeles', timezone: 'America/Los_Angeles', utcOffset: 'UTC-8' },
          { name: 'San Francisco', timezone: 'America/Los_Angeles', utcOffset: 'UTC-8' },
          { name: 'San Diego', timezone: 'America/Los_Angeles', utcOffset: 'UTC-8' }
        ]
      }
    ]
  },
  {
    code: 'PT',
    name: 'Portugal',
    timezone: 'Europe/Lisbon',
    states: [
      {
        code: 'LI',
        name: 'Lisboa',
        cities: [
          { name: 'Lisboa', timezone: 'Europe/Lisbon', utcOffset: 'UTC+0' },
          { name: 'Sintra', timezone: 'Europe/Lisbon', utcOffset: 'UTC+0' },
          { name: 'Cascais', timezone: 'Europe/Lisbon', utcOffset: 'UTC+0' }
        ]
      },
      {
        code: 'PO',
        name: 'Porto',
        cities: [
          { name: 'Porto', timezone: 'Europe/Lisbon', utcOffset: 'UTC+0' },
          { name: 'Vila Nova de Gaia', timezone: 'Europe/Lisbon', utcOffset: 'UTC+0' },
          { name: 'Matosinhos', timezone: 'Europe/Lisbon', utcOffset: 'UTC+0' }
        ]
      }
    ]
  },
  {
    code: 'AR',
    name: 'Argentina',
    timezone: 'America/Argentina/Buenos_Aires',
    states: [
      {
        code: 'BA',
        name: 'Buenos Aires',
        cities: [
          { name: 'Buenos Aires', timezone: 'America/Argentina/Buenos_Aires', utcOffset: 'UTC-3' },
          { name: 'La Plata', timezone: 'America/Argentina/Buenos_Aires', utcOffset: 'UTC-3' },
          { name: 'Mar del Plata', timezone: 'America/Argentina/Buenos_Aires', utcOffset: 'UTC-3' }
        ]
      },
      {
        code: 'CO',
        name: 'Córdoba',
        cities: [
          { name: 'Córdoba', timezone: 'America/Argentina/Cordoba', utcOffset: 'UTC-3' },
          { name: 'Río Cuarto', timezone: 'America/Argentina/Cordoba', utcOffset: 'UTC-3' }
        ]
      }
    ]
  },
  {
    code: 'ES',
    name: 'Espanha',
    timezone: 'Europe/Madrid',
    states: [
      {
        code: 'MD',
        name: 'Madrid',
        cities: [
          { name: 'Madrid', timezone: 'Europe/Madrid', utcOffset: 'UTC+1' },
          { name: 'Alcalá de Henares', timezone: 'Europe/Madrid', utcOffset: 'UTC+1' },
          { name: 'Getafe', timezone: 'Europe/Madrid', utcOffset: 'UTC+1' }
        ]
      },
      {
        code: 'CT',
        name: 'Catalunha',
        cities: [
          { name: 'Barcelona', timezone: 'Europe/Madrid', utcOffset: 'UTC+1' },
          { name: 'Lleida', timezone: 'Europe/Madrid', utcOffset: 'UTC+1' },
          { name: 'Girona', timezone: 'Europe/Madrid', utcOffset: 'UTC+1' }
        ]
      }
    ]
  },
  {
    code: 'IT',
    name: 'Itália',
    timezone: 'Europe/Rome',
    states: [
      {
        code: 'LZ',
        name: 'Lazio',
        cities: [
          { name: 'Roma', timezone: 'Europe/Rome', utcOffset: 'UTC+1' },
          { name: 'Latina', timezone: 'Europe/Rome', utcOffset: 'UTC+1' }
        ]
      },
      {
        code: 'LM',
        name: 'Lombardia',
        cities: [
          { name: 'Milão', timezone: 'Europe/Rome', utcOffset: 'UTC+1' },
          { name: 'Bergamo', timezone: 'Europe/Rome', utcOffset: 'UTC+1' }
        ]
      }
    ]
  },
  {
    code: 'FR',
    name: 'França',
    timezone: 'Europe/Paris',
    states: [
      {
        code: 'IF',
        name: 'Île-de-France',
        cities: [
          { name: 'Paris', timezone: 'Europe/Paris', utcOffset: 'UTC+1' },
          { name: 'Versailles', timezone: 'Europe/Paris', utcOffset: 'UTC+1' }
        ]
      }
    ]
  },
  {
    code: 'MX',
    name: 'México',
    timezone: 'America/Mexico_City',
    states: [
      {
        code: 'DF',
        name: 'Cidade do México',
        cities: [
          { name: 'Cidade do México', timezone: 'America/Mexico_City', utcOffset: 'UTC-6' }
        ]
      }
    ]
  },
  {
    code: 'CL',
    name: 'Chile',
    timezone: 'America/Santiago',
    states: [
      {
        code: 'RM',
        name: 'Região Metropolitana',
        cities: [
          { name: 'Santiago', timezone: 'America/Santiago', utcOffset: 'UTC-3' }
        ]
      }
    ]
  },
  {
    code: 'CO',
    name: 'Colômbia',
    timezone: 'America/Bogota',
    states: [
      {
        code: 'DC',
        name: 'Bogotá',
        cities: [
          { name: 'Bogotá', timezone: 'America/Bogota', utcOffset: 'UTC-5' }
        ]
      }
    ]
  },
  {
    code: 'CA',
    name: 'Canadá',
    timezone: 'America/Toronto',
    states: [
      {
        code: 'ON',
        name: 'Ontário',
        cities: [
          { name: 'Toronto', timezone: 'America/Toronto', utcOffset: 'UTC-5' },
          { name: 'Ottawa', timezone: 'America/Toronto', utcOffset: 'UTC-5' }
        ]
      }
    ]
  }
];

export const getStatesByCountry = (countryCode: string): State[] => {
  const country = countries.find(c => c.code === countryCode);
  return country?.states || [];
};

export const getCitiesByState = (countryCode: string, stateCode: string): City[] => {
  const country = countries.find(c => c.code === countryCode);
  const state = country?.states?.find(s => s.code === stateCode);
  return state?.cities || [];
};

export const getTimezoneInfo = (countryCode: string, stateCode?: string, cityName?: string) => {
  const country = countries.find(c => c.code === countryCode);
  
  if (cityName && stateCode) {
    const state = country?.states?.find(s => s.code === stateCode);
    const city = state?.cities?.find(c => c.name === cityName);
    if (city) {
      return {
        timezone: city.timezone,
        utcOffset: city.utcOffset,
        displayName: `${cityName}, ${state?.name}, ${country?.name}`
      };
    }
  }
  
  if (stateCode) {
    const state = country?.states?.find(s => s.code === stateCode);
    if (state?.timezone) {
      return {
        timezone: state.timezone,
        utcOffset: state.cities[0]?.utcOffset || 'UTC-3',
        displayName: `${state.name}, ${country?.name}`
      };
    }
  }
  
  return {
    timezone: country?.timezone || 'America/Sao_Paulo',
    utcOffset: 'UTC-3',
    displayName: country?.name || 'Brasil'
  };
};

export const convertToBrazilianTime = (localTime: string, localTimezone: string): string => {
  // Converter horário local para horário de Brasília
  const date = new Date(`2000-01-01T${localTime}:00`);
  
  // Simular conversão de fuso horário (implementação simplificada)
  const brazilianTime = new Date(date.getTime());
  
  return brazilianTime.toTimeString().slice(0, 5);
};

export const convertFromBrazilianTime = (brazilianTime: string, targetTimezone: string, targetUtcOffset: string): string => {
  // Converter horário de Brasília para horário local do aluno
  const date = new Date(`2000-01-01T${brazilianTime}:00`);
  
  // Lógica de conversão baseada no UTC offset
  const offsetMap: { [key: string]: number } = {
    'UTC-5': -2, // Acre é UTC-5, Brasília é UTC-3, diferença de -2 horas
    'UTC-4': -1, // Manaus é UTC-4, Brasília é UTC-3, diferença de -1 hora
    'UTC-3': 0,  // Mesmo fuso que Brasília
    'UTC+0': +3, // Portugal é UTC+0, diferença de +3 horas
    'UTC-8': -5  // Los Angeles é UTC-8, diferença de -5 horas
  };
  
  const offsetHours = offsetMap[targetUtcOffset] || 0;
  const convertedDate = new Date(date.getTime() + (offsetHours * 60 * 60 * 1000));
  
  return convertedDate.toTimeString().slice(0, 5);
};