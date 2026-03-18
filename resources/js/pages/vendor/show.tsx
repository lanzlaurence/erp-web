import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import type { Vendor } from '@/types';
import { Link } from '@inertiajs/react';
import { Edit, ArrowLeft } from 'lucide-react';
import { usePermissions } from '@/hooks/use-permissions';
import { useFormatters } from '@/hooks/use-formatters';
import { Head } from '@inertiajs/react';
import EntityLogSection from '@/components/ui/entity-log';

type Props = {
    vendor: Vendor;
};

export default function Show({ vendor }: Props) {
    const { hasPermission } = usePermissions();
    const { formatAmount } = useFormatters();

    return (
        <>
            <Head title={`View Vendor`} />
            <div className="mx-auto max-w-7xl space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">{vendor.name}</h1>
                        <p className="text-sm text-muted-foreground">Vendor Details</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/vendors">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </Link>
                        </Button>
                        {hasPermission('vendor-edit') && (
                            <Button size="sm" asChild>
                                <Link href={`/vendors/${vendor.id}/edit`}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Basic Information */}
                <div className="space-y-4 rounded-lg border p-4">
                    <h3 className="font-semibold">Basic Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Code</p>
                            <p className="text-sm">{vendor.code}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Name</p>
                            <p className="text-sm">{vendor.name}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Payment Terms</p>
                            <p className="text-sm">{vendor.payment_terms || '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Credit Amount</p>
                            <p className="text-sm">{formatAmount(Number(vendor.credit_amount))}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Status</p>
                            <Badge variant={vendor.status === 'active' ? 'default' : 'secondary'}>
                                {vendor.status}
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Address Information */}
                <div className="space-y-4 rounded-lg border p-4">
                    <h3 className="font-semibold">Address Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Country</p>
                            <p className="text-sm">{vendor.country || '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">State/Province</p>
                            <p className="text-sm">{vendor.state_province || '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">City</p>
                            <p className="text-sm">{vendor.city || '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Suburb/Barangay</p>
                            <p className="text-sm">{vendor.suburb_barangay || '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Postal Code</p>
                            <p className="text-sm">{vendor.postal_code || '-'}</p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-sm font-medium text-muted-foreground">Address Line 1</p>
                            <p className="text-sm">{vendor.address_line_1 || '-'}</p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-sm font-medium text-muted-foreground">Address Line 2</p>
                            <p className="text-sm">{vendor.address_line_2 || '-'}</p>
                        </div>
                    </div>
                </div>

                {/* Contact Persons */}
                <div className="space-y-4 rounded-lg border p-4">
                    <h3 className="font-semibold">Contact Persons</h3>
                    {vendor.contact_persons && vendor.contact_persons.length > 0 ? (
                        <div className="space-y-3">
                            {vendor.contact_persons.map((contact, index) => (
                                <div key={index} className="rounded-md border p-3">
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Name</p>
                                            <p className="text-sm">{contact.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Email</p>
                                            <p className="text-sm">{contact.email}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Phone</p>
                                            <p className="text-sm">{contact.phone}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">No contact persons added</p>
                    )}
                </div>

                <EntityLogSection logs={vendor.logs ?? []} storageKey="vendor-logs" />
            </div>
        </>
    );
}

Show.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Vendors', href: '/vendors' },
            { title: 'View', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
