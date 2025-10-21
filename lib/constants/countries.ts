type Country = {
  code: string
  name: string
}

const fallbackCountries: Country[] = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "GB", name: "United Kingdom" },
  { code: "AU", name: "Australia" },
  { code: "NZ", name: "New Zealand" },
  { code: "IN", name: "India" },
  { code: "SG", name: "Singapore" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "BR", name: "Brazil" },
]

function buildCountries(): Country[] {
  if (typeof Intl === "undefined" || typeof Intl.DisplayNames === "undefined") {
    return fallbackCountries
  }

  try {
    const displayNames = new Intl.DisplayNames(["en"], { type: "region" })
    const codes =
      typeof (Intl as typeof Intl & { supportedValuesOf?: (key: string) => string[] }).supportedValuesOf === "function"
        ? (Intl as typeof Intl & { supportedValuesOf: (key: string) => string[] })
            .supportedValuesOf("region")
            .filter((code) => /^[A-Z]{2}$/.test(code))
        : []

    if (!codes.length) {
      return fallbackCountries
    }

    return codes
      .map((code) => ({ code, name: displayNames.of(code) ?? code }))
      .sort((a, b) => a.name.localeCompare(b.name))
  } catch (error) {
    console.warn("Failed to build country list", error)
    return fallbackCountries
  }
}

export const COUNTRIES = buildCountries()

export function getCountryName(code?: string | null) {
  if (!code) return ""
  const match = COUNTRIES.find((country) => country.code === code)
  return match?.name ?? code
}

