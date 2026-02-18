import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type { Customer } from '@/types';
import { useForm } from '@inertiajs/react';
import { FormEvent, useState, useEffect } from 'react';
import ReactSelect from 'react-select';
import { Plus, X } from 'lucide-react';
import { useAddressData, type SelectOption } from '@/hooks/use-address-data';
import { Head } from '@inertiajs/react';
import InputAmount from '@/components/ui/input-amount';
import { useFormatters } from '@/hooks/use-formatters';

type ContactPerson = {
    name: string;
    email: string;
    phone: string;
};

type Props = {
    customer: Customer;
};

export default function Edit({ customer }: Props) {
    const { countries, getStates, getCities } = useAddressData();

    const { data, setData, put, processing, errors } = useForm({
        name: customer.name,
        country: customer.country || '',
        state_province: customer.state_province || '',
        city: customer.city || '',
        suburb_barangay: customer.suburb_barangay || '',
        postal_code: customer.postal_code || '',
        address_line_1: customer.address_line_1 || '',
        address_line_2: customer.address_line_2 || '',
        payment_terms: customer.payment_terms || '',
        contact_persons: customer.contact_persons || [],
        credit_amount: customer.credit_amount.toString(),
        status: customer.status,
    });

    const [contactPersons, setContactPersons] = useState<ContactPerson[]>(
        customer.contact_persons && customer.contact_persons.length > 0
            ? customer.contact_persons
            : [{ name: '', email: '', phone: '' }]
    );

    // Address state management
    const [states, setStates] = useState<SelectOption[]>([]);
    const [cities, setCities] = useState<SelectOption[]>([]);
    const [selectedCountry, setSelectedCountry] = useState<string>('');
    const [selectedState, setSelectedState] = useState<string>('');

    // Initialize address dropdowns on mount
    useEffect(() => {
        if (customer.country) {
            const country = countries.find((c) => c.label === customer.country);
            if (country) {
                setSelectedCountry(country.value);
                const stateList = getStates(country.value);
                setStates(stateList);

                if (customer.state_province) {
                    const state = stateList.find((s) => s.label === customer.state_province);
                    if (state) {
                        setSelectedState(state.value);
                        setCities(getCities(country.value, state.value));
                    }
                }
            }
        }
    }, []);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const validContacts = contactPersons.filter(
            (c) => c.name && c.email && c.phone
        );
        setData('contact_persons', validContacts);
        put(`/customers/${customer.id}`);
    };

    const handleCountryChange = (option: SelectOption | null) => {
        const countryCode = option?.value || '';
        setSelectedCountry(countryCode);
        setData('country', option?.label || '');

        setSelectedState('');
        setData('state_province', '');
        setData('city', '');
        setData('suburb_barangay', '');
        setData('postal_code', '');

        setStates(countryCode ? getStates(countryCode) : []);
        setCities([]);
    };

    const handleStateChange = (option: SelectOption | null) => {
        const stateCode = option?.value || '';
        setSelectedState(stateCode);
        setData('state_province', option?.label || '');

        setData('city', '');
        setData('suburb_barangay', '');
        setData('postal_code', '');

        setCities(selectedCountry && stateCode ? getCities(selectedCountry, stateCode) : []);
    };

    const handleCityChange = (option: SelectOption | null) => {
        setData('city', option?.value || '');
    };

    const addContactPerson = () => {
        setContactPersons([...contactPersons, { name: '', email: '', phone: '' }]);
    };

    const removeContactPerson = (index: number) => {
        const updated = contactPersons.filter((_, i) => i !== index);
        setContactPersons(updated);
    };

    const updateContactPerson = (index: number, field: keyof ContactPerson, value: string) => {
        const updated = [...contactPersons];
        updated[index][field] = value;
        setContactPersons(updated);
    };

    const { currency } = useFormatters();

    return (
        <>
            <Head title="Edit Customer" />
            <div className="mx-auto max-w-4xl space-y-6 p-4">
                <div>
                    <h1 className="text-2xl font-semibold">Edit Customer</h1>
                    <p className="text-sm text-muted-foreground">Update customer information</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4 rounded-lg border p-4">
                        <h3 className="font-semibold">Basic Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Code</Label>
                                <Input value={customer.code} disabled className="bg-muted" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                />
                                {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="payment_terms">Payment Terms</Label>
                                <Input
                                    id="payment_terms"
                                    value={data.payment_terms}
                                    onChange={(e) => setData('payment_terms', e.target.value)}
                                    placeholder="Net 30"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="credit_amount">Credit Amount ({currency.symbol})</Label>
                                <InputAmount
                                    value={data.credit_amount}
                                    onValueChange={(val) => setData('credit_amount', String(val ?? 0))}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select value={data.status} onValueChange={(value: 'active' | 'inactive') => setData('status', value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Address Information */}
                    <div className="space-y-4 rounded-lg border p-4">
                        <h3 className="font-semibold">Address Information</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="country">Country</Label>
                                <ReactSelect
                                    id="country"
                                    options={countries}
                                    value={countries.find((c) => c.label === data.country) || null}
                                    onChange={handleCountryChange}
                                    isClearable
                                    isSearchable
                                    placeholder="Select or search..."
                                    className="react-select-container"
                                    classNamePrefix="react-select"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="state_province">State/Province</Label>
                                <ReactSelect
                                    id="state_province"
                                    options={states}
                                    value={states.find((s) => s.label === data.state_province) || null}
                                    onChange={handleStateChange}
                                    isClearable
                                    isSearchable
                                    isDisabled={!selectedCountry}
                                    placeholder={selectedCountry ? "Select or search..." : "Select country first"}
                                    className="react-select-container"
                                    classNamePrefix="react-select"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="city">City</Label>
                                <ReactSelect
                                    id="city"
                                    options={cities}
                                    value={cities.find((c) => c.value === data.city) || null}
                                    onChange={handleCityChange}
                                    isClearable
                                    isSearchable
                                    isDisabled={!selectedState}
                                    placeholder={selectedState ? "Select or search..." : "Select state/province first"}
                                    className="react-select-container"
                                    classNamePrefix="react-select"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="suburb_barangay">Suburb/Barangay</Label>
                                <Input
                                    id="suburb_barangay"
                                    value={data.suburb_barangay}
                                    onChange={(e) => setData('suburb_barangay', e.target.value)}
                                    placeholder="Enter suburb or barangay"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="postal_code">Postal Code</Label>
                                <Input
                                    id="postal_code"
                                    value={data.postal_code}
                                    onChange={(e) => setData('postal_code', e.target.value)}
                                    placeholder="Enter postal code"
                                />
                            </div>

                            <div className="col-span-3 space-y-2">
                                <Label htmlFor="address_line_1">Address Line 1</Label>
                                <Input
                                    id="address_line_1"
                                    value={data.address_line_1}
                                    onChange={(e) => setData('address_line_1', e.target.value)}
                                    placeholder="Street address"
                                />
                            </div>

                            <div className="col-span-3 space-y-2">
                                <Label htmlFor="address_line_2">Address Line 2</Label>
                                <Input
                                    id="address_line_2"
                                    value={data.address_line_2}
                                    onChange={(e) => setData('address_line_2', e.target.value)}
                                    placeholder="Apartment, suite, unit, building, floor, etc."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Contact Persons */}
                    <div className="space-y-4 rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold">Contact Persons</h3>
                            <Button type="button" variant="outline" size="sm" onClick={addContactPerson}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Contact
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {contactPersons.map((contact, index) => (
                                <div key={index} className="grid grid-cols-12 gap-3 rounded-md border p-3">
                                    <div className="col-span-4 space-y-2">
                                        <Label htmlFor={`contact_name_${index}`}>Name</Label>
                                        <Input
                                            id={`contact_name_${index}`}
                                            value={contact.name}
                                            onChange={(e) => updateContactPerson(index, 'name', e.target.value)}
                                            placeholder="Full name"
                                        />
                                    </div>
                                    <div className="col-span-3 space-y-2">
                                        <Label htmlFor={`contact_email_${index}`}>Email</Label>
                                        <Input
                                            id={`contact_email_${index}`}
                                            type="email"
                                            value={contact.email}
                                            onChange={(e) => updateContactPerson(index, 'email', e.target.value)}
                                            placeholder="email@example.com"
                                        />
                                    </div>
                                    <div className="col-span-3 space-y-2">
                                        <Label htmlFor={`contact_phone_${index}`}>Phone</Label>
                                        <Input
                                            id={`contact_phone_${index}`}
                                            value={contact.phone}
                                            onChange={(e) => updateContactPerson(index, 'phone', e.target.value)}
                                            placeholder="+63 912 345 6789"
                                        />
                                    </div>
                                    <div className="col-span-2 flex items-end">
                                        {contactPersons.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeContactPerson(index)}
                                            >
                                                <X className="h-4 w-4 text-red-600" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button type="submit" disabled={processing}>
                            Update Customer
                        </Button>
                        <Button type="button" variant="outline" onClick={() => window.history.back()}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

Edit.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Customers', href: '/customers' },
            { title: 'Edit', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
