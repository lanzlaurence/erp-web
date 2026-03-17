// js/components/ui/input-percentage.tsx
import { NumericFormat } from 'react-number-format';
import { cn } from '@/lib/utils';
import { useFormatters } from '@/hooks/use-formatters';

interface InputPercentageProps {
    value?: number | string;
    onValueChange?: (value: number | undefined) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    max?: number; // default 100, but flexible if needed
}

export default function InputPercentage({
    value,
    onValueChange,
    placeholder,
    className,
    disabled = false,
    max = 100,
}: InputPercentageProps) {
    const { getDecimalPlaces } = useFormatters();
    const decimalScale = getDecimalPlaces();

    return (
        <NumericFormat
            value={value}
            onValueChange={(values) => onValueChange?.(values.floatValue)}
            decimalSeparator="."
            decimalScale={decimalScale}
            fixedDecimalScale
            allowNegative={false}
            isAllowed={(values) => {
                const { floatValue } = values;
                return floatValue === undefined || floatValue <= max;
            }}
            placeholder={placeholder ?? '0.' + '0'.repeat(decimalScale)}
            disabled={disabled}
            className={cn(
                'border-input placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
                'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
                'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
                className,
            )}
        />
    );
}
