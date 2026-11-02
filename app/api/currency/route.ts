import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Country code -> currency code
const COUNTRY_CURRENCIES: Record<string, string> = {
  IN: "INR",
  US: "USD",
  GB: "GBP",
  FR: "EUR",
  DE: "EUR",
  IT: "EUR",
  ES: "EUR",
  PT: "EUR",
  NL: "EUR",
  BE: "EUR",
  AT: "EUR",
  IE: "EUR",
  GR: "EUR",
  FI: "EUR",
  JP: "JPY",
  CN: "CNY",
  KR: "KRW",
  SG: "SGD",
  MY: "MYR",
  TH: "THB",
  ID: "IDR",
  VN: "VND",
  PH: "PHP",
  LK: "LKR",
  NP: "NPR",
  BD: "BDT",
  AE: "AED",
  SA: "SAR",
  QA: "QAR",
  OM: "OMR",
  KW: "KWD",
  BH: "BHD",
  AU: "AUD",
  NZ: "NZD",
  CA: "CAD",
  CH: "CHF",
  RU: "RUB",
  TR: "TRY",
  ZA: "ZAR",
  EG: "EGP",
  KE: "KES",
  NG: "NGN",
  BR: "BRL",
  MX: "MXN",
  AR: "ARS",
  CL: "CLP",
  CO: "COP",
  HK: "HKD",
  TW: "TWD",
  SE: "SEK",
  NO: "NOK",
  DK: "DKK",
  PL: "PLN",
  CZ: "CZK",
  HU: "HUF",
  IS: "ISK",
};

export async function GET(request: NextRequest) {
  try {
    const destination = request.nextUrl.searchParams.get("destination");

    if (!destination?.trim()) {
      return NextResponse.json(
        { error: "Please provide a destination." },
        { status: 400 }
      );
    }

    // Step 1: Identify the destination country
    const geoUrl = new URL("https://nominatim.openstreetmap.org/search");
    geoUrl.searchParams.set("q", destination);
    geoUrl.searchParams.set("format", "jsonv2");
    geoUrl.searchParams.set("addressdetails", "1");
    geoUrl.searchParams.set("limit", "1");

    const geoResponse = await fetch(geoUrl.toString(), {
      headers: {
        "User-Agent": "ItineraryAssist/1.0",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });

    if (!geoResponse.ok) {
      throw new Error("Could not identify the destination country.");
    }

    const locations = await geoResponse.json();
    const country = locations?.[0]?.address?.country;
    const countryCode = locations?.[0]?.address?.country_code?.toUpperCase();

    if (!countryCode || !country) {
      return NextResponse.json(
        { error: "Could not identify the country for this destination." },
        { status: 404 }
      );
    }

    // Step 2: Find the country's currency
    const currencyCode = COUNTRY_CURRENCIES[countryCode];

    if (!currencyCode) {
      return NextResponse.json(
        {
          error: `Currency information is not configured for ${country}.`,
        },
        { status: 404 }
      );
    }

    // Step 3: Get currency name and symbol
    const currencyNames = new Intl.DisplayNames(["en"], {
      type: "currency",
    });

    const currencyName = currencyNames.of(currencyCode) || currencyCode;

    const currencySymbol =
      new Intl.NumberFormat("en", {
        style: "currency",
        currency: currencyCode,
      })
        .formatToParts(1)
        .find((part) => part.type === "currency")?.value || currencyCode;

    // Step 4: Get the exchange rate (1 INR -> destination currency)
    const rateResponse = await fetch(
      "https://open.er-api.com/v6/latest/INR",
      {
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!rateResponse.ok) {
      throw new Error("Could not retrieve the latest exchange rate.");
    }

    const rateData = await rateResponse.json();
    const exchangeRate = rateData?.rates?.[currencyCode];

    if (
      rateData?.result !== "success" ||
      typeof exchangeRate !== "number" ||
      !Number.isFinite(exchangeRate)
    ) {
      throw new Error("Exchange rate is unavailable for this currency.");
    }

    return NextResponse.json({
      country,
      currencyCode,
      currencyName,
      currencySymbol,
      exchangeRate,
      updatedAt: rateData.time_last_update_utc || new Date().toISOString(),
    });
  } catch (error) {
    console.error("Currency lookup error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "An unexpected currency lookup error occurred.",
      },
      { status: 500 }
    );
  }
}