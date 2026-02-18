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
import { useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import ReactSelect from 'react-select';
import { Plus, X } from 'lucide-react';
import { useAddressData, type SelectOption } from '@/hooks/use-address-data';
import { Head } from '@inertiajs/react';
import InputAmount from '@/components/ui/input-amount';
import { useFormatters } from '@/hooks/use-formatters';
import InputPhone from '@/components/ui/input-phone';

type ContactPerson = {
    name: string;
    email: string;
    phone: string;
};

export default function Create() {
    const { countries, getStates, getCities } = useAddressData();

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        country: '',
        state_province: '',
        city: '',
        suburb_barangay: '',
        postal_code: '',
        address_line_1: '',
        address_line_2: '',
        payment_terms: '',
        contact_persons: [] as ContactPerson[],
        credit_amount: '0',
        status: 'active' as 'active' | 'inactive',
    });

    const [contactPersons, setContactPersons] = useState<ContactPerson[]>([
        { name: '', email: '', phone: '' },
    ]);

    // Address state management
    const [states, setStates] = useState<SelectOption[]>([]);
    const [cities, setCities] = useState<SelectOption[]>([]);
    const [selectedCountry, setSelectedCountry] = useState<string>('');
    const [selectedState, setSelectedState] = useState<string>('');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const validContacts = contactPersons.filter(
            (c) => c.name && c.email && c.phone
        );
        setData('contact_persons', validContacts);
        post('/customers');
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
            <Head title="Create Customer" />
            <div className="mx-auto max-w-4xl space-y-6 p-4">
                <div>
                    <h1 className="text-2xl font-semibold">Create Customer</h1>
                    <p className="text-sm text-muted-foreground">Add a new customer</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4 rounded-lg border p-4">
                        <h3 className="font-semibold">Basic Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 space-y-2">
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
                                        <InputPhone
                                            id={`contact_phone_${index}`}
                                            value={contact.phone}
                                            onChange={(val) => updateContactPerson(index, 'phone', val)}
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
                            Create Customer
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

Create.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Customers', href: '/customers' },
            { title: 'Create', href: '/customers/create' },
        ]}
    >
        {page}
    </AppLayout>
);
