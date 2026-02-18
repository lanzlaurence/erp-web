// js/lib/currencies.ts
// for fallback/typing only
export type CurrencyOption = {
    value: string;
    label: string;
};

export function buildCurrencyOptions(currencies: { code: string; name: string; symbol: string }[]): CurrencyOption[] {
    return currencies.map((c) => ({
        value: c.code,
        label: `${c.code} — ${c.name} (${c.symbol})`,
    }));
}

export function getCurrencyFromList(
    currencies: { code: string; name: string; symbol: string }[],
    code: string
) {
    return currencies.find((c) => c.code === code) ?? currencies[0];
}
