import { Country, State, City } from 'country-state-city';
import { useMemo } from 'react';

export type SelectOption = {
    value: string;
    label: string;
};

export function useAddressData() {
    const countries = useMemo(() => {
        return Country.getAllCountries().map((country) => ({
            value: country.isoCode,
            label: country.name,
        }));
    }, []);

    const getStates = (countryCode: string): SelectOption[] => {
        if (!countryCode) return [];
        return State.getStatesOfCountry(countryCode).map((state) => ({
            value: state.isoCode,
            label: state.name,
        }));
    };

    const getCities = (countryCode: string, stateCode: string): SelectOption[] => {
        if (!countryCode || !stateCode) return [];
        return City.getCitiesOfState(countryCode, stateCode).map((city) => ({
            value: city.name,
            label: city.name,
        }));
    };

    const getCountryName = (countryCode: string): string => {
        if (!countryCode) return '';
        const country = Country.getCountryByCode(countryCode);
        return country?.name || countryCode;
    };

    const getStateName = (countryCode: string, stateCode: string): string => {
        if (!countryCode || !stateCode) return '';
        const state = State.getStateByCodeAndCountry(stateCode, countryCode);
        return state?.name || stateCode;
    };

    return {
        countries,
        getStates,
        getCities,
        getCountryName,
        getStateName,
    };
}
