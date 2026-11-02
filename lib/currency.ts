export interface DestinationCurrency {
  country: string
  currencyCode: string
  currencyName: string
  currencySymbol: string
  exchangeRateInr: number
  exchangeRateUpdatedAt: string
}

const COUNTRY_CURRENCIES: Record<
  string,
  { code: string; name: string; symbol: string }
> = {
  IN: { code: "INR", name: "Indian Rupee", symbol: "₹" },
  US: { code: "USD", name: "US Dollar", symbol: "$" },
  GB: { code: "GBP", name: "British Pound", symbol: "£" },
  FR: { code: "EUR", name: "Euro", symbol: "€" },
  DE: { code: "EUR", name: "Euro", symbol: "€" },
  IT: { code: "EUR", name: "Euro", symbol: "€" },
  ES: { code: "EUR", name: "Euro", symbol: "€" },
  NL: { code: "EUR", name: "Euro", symbol: "€" },
  PT: { code: "EUR", name: "Euro", symbol: "€" },
  IE: { code: "EUR", name: "Euro", symbol: "€" },
  AT: { code: "EUR", name: "Euro", symbol: "€" },
  BE: { code: "EUR", name: "Euro", symbol: "€" },
  GR: { code: "EUR", name: "Euro", symbol: "€" },
  FI: { code: "EUR", name: "Euro", symbol: "€" },
  JP: { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  CN: { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  KR: { code: "KRW", name: "South Korean Won", symbol: "₩" },
  SG: { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
  AU: { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  CA: { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  CH: { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
  AE: { code: "AED", name: "UAE Dirham", symbol: "د.إ" },
  TH: { code: "THB", name: "Thai Baht", symbol: "฿" },
  MY: { code: "MYR", name: "Malaysian Ringgit", symbol: "RM" },
  ID: { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp" },
  LK: { code: "LKR", name: "Sri Lankan Rupee", symbol: "Rs" },
  NP: { code: "NPR", name: "Nepalese Rupee", symbol: "रू" },
  BD: { code: "BDT", name: "Bangladeshi Taka", symbol: "৳" },
  SA: { code: "SAR", name: "Saudi Riyal", symbol: "﷼" },
  QA: { code: "QAR", name: "Qatari Riyal", symbol: "ر.ق" },
  TR: { code: "TRY", name: "Turkish Lira", symbol: "₺" },
  NZ: { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$" },
  ZA: { code: "ZAR", name: "South African Rand", symbol: "R" },
  RU: { code: "RUB", name: "Russian Ruble", symbol: "₽" },
  MX: { code: "MXN", name: "Mexican Peso", symbol: "$" },
  BR: { code: "BRL", name: "Brazilian Real", symbol: "R$" },
  EG: { code: "EGP", name: "Egyptian Pound", symbol: "E£" },
  VN: { code: "VND", name: "Vietnamese Dong", symbol: "₫" },
  KH: { code: "KHR", name: "Cambodian Riel", symbol: "៛" },
  PH: { code: "PHP", name: "Philippine Peso", symbol: "₱" },
  HK: { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$" },
  TW: { code: "TWD", name: "New Taiwan Dollar", symbol: "NT$" },
  SE: { code: "SEK", name: "Swedish Krona", symbol: "kr" },
  NO: { code: "NOK", name: "Norwegian Krone", symbol: "kr" },
  DK: { code: "DKK", name: "Danish Krone", symbol: "kr" },
  PL: { code: "PLN", name: "Polish Zloty", symbol: "zł" },
  CZ: { code: "CZK", name: "Czech Koruna", symbol: "Kč" },
  HU: { code: "HUF", name: "Hungarian Forint", symbol: "Ft" },
}

export async function getDestinationCurrency(
  destination: string
): Promise<DestinationCurrency> {
  const geoResponse = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
      destination
    )}`,
    {
      headers: {
        "User-Agent": "ItineraryAssist/1.0",
      },
      cache: "no-store",
    }
  )

  if (!geoResponse.ok) {
    throw new Error("Unable to identify the destination country.")
  }

  const geoResults = await geoResponse.json()

  if (!Array.isArray(geoResults) || geoResults.length === 0) {
    throw new Error("Destination not found. Please enter a valid city or place.")
  }

  const addressResponse = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${geoResults[0].lat}&lon=${geoResults[0].lon}&zoom=3`,
    {
      headers: {
        "User-Agent": "ItineraryAssist/1.0",
      },
      cache: "no-store",
    }
  )

  if (!addressResponse.ok) {
    throw new Error("Unable to identify the destination country.")
  }

  const addressData = await addressResponse.json()
  const country = addressData.address?.country
  const countryCode = addressData.address?.country_code?.toUpperCase()

  if (!country || !countryCode) {
    throw new Error("Could not determine the destination's country.")
  }

  const currencyInfo = COUNTRY_CURRENCIES[countryCode]

  if (!currencyInfo) {
    throw new Error(
      `Currency information is not configured for ${country}.`
    )
  }

  const rateResponse = await fetch(
    "https://open.er-api.com/v6/latest/INR",
    { cache: "no-store" }
  )

  if (!rateResponse.ok) {
    throw new Error("Unable to retrieve the latest currency exchange rate.")
  }

  const rateData = await rateResponse.json()
  const exchangeRateInr = Number(
    rateData.rates?.[currencyInfo.code]
  )

  if (!Number.isFinite(exchangeRateInr) || exchangeRateInr <= 0) {
    throw new Error("The exchange rate for this currency is unavailable.")
  }

  return {
    country,
    currencyCode: currencyInfo.code,
    currencyName: currencyInfo.name,
    currencySymbol: currencyInfo.symbol,
    exchangeRateInr,
    exchangeRateUpdatedAt:
      rateData.time_last_update_utc || new Date().toISOString(),
  }
}

export function convertInrToLocal(
  amountInr: number,
  exchangeRateInr: number
): number {
  if (
    !Number.isFinite(amountInr) ||
    !Number.isFinite(exchangeRateInr) ||
    amountInr < 0 ||
    exchangeRateInr <= 0
  ) {
    return 0
  }

  return Number((amountInr * exchangeRateInr).toFixed(2))
}