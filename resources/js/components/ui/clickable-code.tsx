import { Link } from '@inertiajs/react';
import { ExternalLink } from 'lucide-react';

type Props = {
    href: string;
    value: string | null | undefined;
    fallback?: string;
    mono?: boolean;
};

export default function ClickableCode({ href, value, fallback = '-', mono = true }: Props) {
    if (!value) return <span className="text-muted-foreground">{fallback}</span>;
    return (
        <Link
            href={href}
            className={`inline-flex items-center gap-1 text-sm text-blue-600 underline hover:text-blue-800 transition-colors ${mono ? 'font-mono' : ''}`}
        >
            {value}
            <ExternalLink className="h-3 w-3 shrink-0" />
        </Link>
    );
}
