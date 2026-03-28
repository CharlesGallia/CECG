type ClassValue = string | undefined | null | false | Record<string, boolean>

function cn(...classes: ClassValue[]): string {
  return classes
    .flatMap((cls) => {
      if (!cls) return []
      if (typeof cls === 'string') return [cls]
      return Object.entries(cls)
        .filter(([, val]) => val)
        .map(([key]) => key)
    })
    .join(' ')
}

export default cn
