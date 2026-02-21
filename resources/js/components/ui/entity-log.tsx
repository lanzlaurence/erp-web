import type { EntityLog } from '@/types';
import { useFormatters } from '@/hooks/use-formatters';

type Props = {
    logs: EntityLog[];
};

export default function EntityLogSection({ logs }: Props) {
    const { formatDateTime } = useFormatters();

    if (!logs || logs.length === 0) return null;

    return (
        <div className="space-y-4 rounded-lg border p-4">
            <h3 className="font-semibold">Activity Log</h3>
            <div className="space-y-3">
                {logs.map((log) => (
                    <div key={log.id} className="flex items-start gap-3 text-sm">
                        <div className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />
                        <div className="flex-1">
                            <p>
                                <span className="font-medium">{log.user?.name ?? 'System'}</span>
                                {' '}
                                <span className="text-muted-foreground capitalize">{log.action}</span>
                            </p>
                            {log.changes && log.changes.length > 0 && (
                                <div className="mt-1 space-y-1">
                                    {log.changes.map((change, i) => (
                                        <p key={i} className="text-xs text-muted-foreground">
                                            <span className="font-medium capitalize">{change.field.replace(/_/g, ' ')}</span>
                                            {': '}
                                            <span className="text-red-500 line-through">{change.old || '—'}</span>
                                            {' → '}
                                            <span className="text-green-600">{change.new || '—'}</span>
                                        </p>
                                    ))}
                                </div>
                            )}
                            {log.remarks && <p className="text-xs text-muted-foreground mt-1">{log.remarks}</p>}
                            <p className="text-xs text-muted-foreground">{formatDateTime(log.created_at)}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
