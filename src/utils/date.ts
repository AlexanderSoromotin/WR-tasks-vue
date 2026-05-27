export function formatDate(isoString: string | null, locale = 'ru-RU'): string {
  if (!isoString) {
    return '—'
  }

  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(isoString))
}

