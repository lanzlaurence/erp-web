import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import type { Charge } from '@/types';
import { Link } from '@inertiajs/react';
import { Edit, ArrowLeft } from 'lucide-react';
import { usePermissions } from '@/hooks/use-permissions';
import { usePreferences } from '@/hooks/use-preferences';

type Props = {
    charge: Charge;
};

export default function Show({ charge }: Props) {
    const { hasPermission } = usePermissions();
    const { formatDecimal } = usePreferences();

    const getTypeBadge = (type: string) => {
        return type === 'tax' ? (
            <Badge variant="destructive">Tax</Badge>
        ) : (
            <Badge variant="success">Discount</Badge>
        );
    };

    const getValueDisplay = (valueType: string, value: string | number) => {
        if (valueType === 'percentage') {
            return `${formatDecimal(Number(value))}%`;
        }
        return `₱${formatDecimal(Number(value))}`;
    };

    return (
        <div className="mx-auto max-w-4xl space-y-6 p-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">{charge.name}</h1>
                    <p className="text-sm text-muted-foreground">Charge Details</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/charges">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Link>
                    </Button>
                    {hasPermission('charge-edit') && (
                        <Button size="sm" asChild>
                            <Link href={`/charges/${charge.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                        </Button>
                    )}
                </div>
            </div>

            <div className="space-y-4 rounded-lg border p-4">
                <h3 className="font-semibold">Charge Information</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Name</p>
                        <p className="text-sm">{charge.name}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Type</p>
                        {getTypeBadge(charge.type)}
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Value Type</p>
                        <p className="text-sm capitalize">{charge.value_type}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Value</p>
                        <p className="text-sm font-mono text-lg">{getValueDisplay(charge.value_type, charge.value)}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Status</p>
                        <Badge variant={charge.status === 'active' ? 'default' : 'secondary'}>
                            {charge.status}
                        </Badge>
                    </div>
                    <div className="col-span-2">
                        <p className="text-sm font-medium text-muted-foreground">Description</p>
                        <p className="text-sm">{charge.description || '-'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

Show.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Charges', href: '/charges' },
            { title: 'View', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
