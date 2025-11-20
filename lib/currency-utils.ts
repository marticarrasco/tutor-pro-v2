export type Currency = "USD" | "EUR"

const EUROZONE_COUNTRIES = [
    "AT", // Austria
    "BE", // Belgium
    "HR", // Croatia
    "CY", // Cyprus
    "EE", // Estonia
    "FI", // Finland
    "FR", // France
    "DE", // Germany
    "GR", // Greece
    "IE", // Ireland
    "IT", // Italy
    "LV", // Latvia
    "LT", // Lithuania
    "LU", // Luxembourg
    "MT", // Malta
    "NL", // Netherlands
    "PT", // Portugal
    "SK", // Slovakia
    "SI", // Slovenia
    "ES", // Spain
]

export function getCurrencyForCountry(countryCode: string): Currency {
    if (countryCode.toUpperCase() === "US") {
        return "USD"
    }
    return "EUR"
}

export async function fetchUserLocation(): Promise<{ country: string; currency: Currency }> {
    try {
        const response = await fetch("https://ipapi.co/json/")
        if (!response.ok) {
            throw new Error("Failed to fetch location")
        }
        const data = await response.json()
        const country = data.country_code || "N/A"
        const currency = getCurrencyForCountry(country)
        return { country, currency }
    } catch (error) {
        console.error("Error fetching location:", error)
        return { country: "N/A", currency: "EUR" }
    }
}
