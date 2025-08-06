import { useState, useEffect } from 'react';
import { MapPin, Cloud, Sun, CloudRain, CloudSnow, Thermometer } from 'lucide-react';

interface WeatherData {
  city: string;
  temperature: number;
  condition: string;
  icon: 'sun' | 'cloud' | 'rain' | 'snow';
  humidity: number;
}

export function WeatherInfo() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [location, setLocation] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLocationAndWeather();
  }, []);

  const getLocationAndWeather = async () => {
    try {
      // Tentar obter localização do usuário
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            // Simulação de dados climáticos baseados na localização
            const weatherData = await simulateWeatherData(latitude, longitude);
            setWeather(weatherData);
            setLocation(weatherData.city);
            setLoading(false);
          },
          () => {
            // Fallback para São Paulo se a geolocalização falhar
            const fallbackWeather = {
              city: 'São Paulo',
              temperature: 24,
              condition: 'Parcialmente nublado',
              icon: 'cloud' as const,
              humidity: 65
            };
            setWeather(fallbackWeather);
            setLocation(fallbackWeather.city);
            setLoading(false);
          }
        );
      } else {
        // Fallback se geolocalização não estiver disponível
        const fallbackWeather = {
          city: 'São Paulo',
          temperature: 24,
          condition: 'Parcialmente nublado',
          icon: 'cloud' as const,
          humidity: 65
        };
        setWeather(fallbackWeather);
        setLocation(fallbackWeather.city);
        setLoading(false);
      }
    } catch (error) {
      console.error('Erro ao obter dados do clima:', error);
      setLoading(false);
    }
  };

  const simulateWeatherData = async (lat: number, lon: number): Promise<WeatherData> => {
    // Simulação baseada na localização (em produção, usar API real)
    const cities = [
      { name: 'São Paulo', lat: -23.5505, lon: -46.6333 },
      { name: 'Rio de Janeiro', lat: -22.9068, lon: -43.1729 },
      { name: 'Brasília', lat: -15.7997, lon: -47.8664 },
      { name: 'Salvador', lat: -12.9714, lon: -38.5014 },
      { name: 'Fortaleza', lat: -3.7319, lon: -38.5267 }
    ];

    // Encontrar cidade mais próxima
    let closestCity = cities[0];
    let minDistance = Math.abs(lat - cities[0].lat) + Math.abs(lon - cities[0].lon);

    cities.forEach(city => {
      const distance = Math.abs(lat - city.lat) + Math.abs(lon - city.lon);
      if (distance < minDistance) {
        minDistance = distance;
        closestCity = city;
      }
    });

    // Dados climáticos simulados
    const conditions = [
      { condition: 'Ensolarado', icon: 'sun' as const, temp: 28 },
      { condition: 'Parcialmente nublado', icon: 'cloud' as const, temp: 24 },
      { condition: 'Chuvisco', icon: 'rain' as const, temp: 20 },
      { condition: 'Nublado', icon: 'cloud' as const, temp: 22 }
    ];

    const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];

    return {
      city: closestCity.name,
      temperature: randomCondition.temp + Math.floor(Math.random() * 6) - 3, // ±3°C
      condition: randomCondition.condition,
      icon: randomCondition.icon,
      humidity: 50 + Math.floor(Math.random() * 30) // 50-80%
    };
  };

  const getWeatherIcon = (icon: string) => {
    switch (icon) {
      case 'sun':
        return <Sun className="h-4 w-4 text-yellow-500" />;
      case 'cloud':
        return <Cloud className="h-4 w-4 text-gray-500" />;
      case 'rain':
        return <CloudRain className="h-4 w-4 text-blue-500" />;
      case 'snow':
        return <CloudSnow className="h-4 w-4 text-blue-300" />;
      default:
        return <Sun className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <div className="animate-pulse">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4 text-sm">
      {weather && (
        <>
          <div className="flex items-center space-x-1">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{weather.city}</span>
          </div>
          
          <div className="flex items-center space-x-1">
            {getWeatherIcon(weather.icon)}
            <span className="text-muted-foreground">{weather.condition}</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Thermometer className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{weather.temperature}°C</span>
          </div>
        </>
      )}
      
      <div className="text-muted-foreground">
        {getCurrentDate()}
      </div>
    </div>
  );
}