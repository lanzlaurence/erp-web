import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import type { Material } from '@/types';
import { Link } from '@inertiajs/react';
import { Edit, ArrowLeft } from 'lucide-react';
import { usePermissions } from '@/hooks/use-permissions';
import { useFormatters } from '@/hooks/use-formatters';
import { Head } from '@inertiajs/react';
import EntityLogSection from '@/components/ui/entity-log';

type Props = {
    material: Material;
};

export default function Show({ material }: Props) {
    const { hasPermission } = usePermissions();
    const { formatAmount, formatDecimal } = useFormatters();

    return (
        <>
            <Head title="View Material" />
            <div className="mx-auto max-w-4xl space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">{material.name}</h1>
                        <p className="text-sm text-muted-foreground">Material Details</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/materials">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </Link>
                        </Button>
                        {hasPermission('material-edit') && (
                            <Button size="sm" asChild>
                                <Link href={`/materials/${material.id}/edit`}>
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
                            <p className="text-sm">{material.code}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">SKU</p>
                            <p className="text-sm">{material.sku || '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Name</p>
                            <p className="text-sm">{material.name}</p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-sm font-medium text-muted-foreground">Description</p>
                            <p className="text-sm">{material.description || '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Status</p>
                            <Badge variant={material.status === 'active' ? 'default' : 'secondary'}>
                                {material.status}
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Dimensions */}
                <div className="space-y-4 rounded-lg border p-4">
                    <h3 className="font-semibold">Dimensions</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Weight (kg)</p>
                            <p className="text-sm">{material.weight ? formatDecimal(Number(material.weight)) : '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Length (m)</p>
                            <p className="text-sm">{material.length ? formatDecimal(Number(material.length)) : '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Width (m)</p>
                            <p className="text-sm">{material.width ? formatDecimal(Number(material.width)) : '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Height (m)</p>
                            <p className="text-sm">{material.height ? formatDecimal(Number(material.height)) : '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Volume (m³)</p>
                            <p className="text-sm">{material.volume ? formatDecimal(Number(material.volume)) : '-'}</p>
                        </div>
                    </div>
                </div>

                {/* Stock Levels */}
                <div className="space-y-4 rounded-lg border p-4">
                    <h3 className="font-semibold">Stock Levels</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Min Stock Level</p>
                            <p className="text-sm">{material.min_stock_level}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Max Stock Level</p>
                            <p className="text-sm">{material.max_stock_level}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Reorder Level</p>
                            <p className="text-sm">{material.reorder_level}</p>
                        </div>
                    </div>
                </div>

                {/* Pricing */}
                <div className="space-y-4 rounded-lg border p-4">
                    <h3 className="font-semibold">Pricing</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Unit Cost</p>
                            <p className="text-sm font-mono">{formatAmount(Number(material.unit_cost))}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Unit Price</p>
                            <p className="text-sm font-mono">{formatAmount(Number(material.unit_price))}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Avg Unit Cost</p>
                            <p className="text-sm font-mono text-muted-foreground">{formatAmount(Number(material.avg_unit_cost))}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Avg Unit Price</p>
                            <p className="text-sm font-mono text-muted-foreground">{formatAmount(Number(material.avg_unit_price))}</p>
                        </div>
                    </div>
                </div>

                {/* Categories & Tracking */}
                <div className="space-y-4 rounded-lg border p-4">
                    <h3 className="font-semibold">Categories & Tracking</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Brand</p>
                            <p className="text-sm">{material.brand?.name || '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Category</p>
                            <p className="text-sm">{material.category?.name || '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">UOM</p>
                            <p className="text-sm">{material.uom?.acronym || '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Track Serial Number</p>
                            <Badge variant={material.track_serial_number ? 'default' : 'secondary'}>
                                {material.track_serial_number ? 'Yes' : 'No'}
                            </Badge>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Track Batch Number</p>
                            <Badge variant={material.track_batch_number ? 'default' : 'secondary'}>
                                {material.track_batch_number ? 'Yes' : 'No'}
                            </Badge>
                        </div>
                    </div>
                </div>

                <EntityLogSection logs={material.logs ?? []} />
            </div>
        </>
    );
}

Show.layout = (page: React.ReactNode) => (
    <AppLayout
        breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Materials', href: '/materials' },
            { title: 'View', href: '#' },
        ]}
    >
        {page}
    </AppLayout>
);
