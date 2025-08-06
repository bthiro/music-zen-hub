import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Função para formatar data
export function formatarData(data: string | Date): string {
  const date = typeof data === 'string' ? new Date(data) : data;
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

// Função para formatar data e hora
export function formatarDataHora(dataHora: string | Date): string {
  const date = typeof dataHora === 'string' ? new Date(dataHora) : dataHora;
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Função para formatar data completa
export function formatarDataCompleta(dataHora: string | Date): string {
  const date = typeof dataHora === 'string' ? new Date(dataHora) : dataHora;
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
