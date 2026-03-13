import { NumericFormat } from 'react-number-format';
import { cn } from '@/lib/utils';
import { useFormatters } from '@/hooks/use-formatters';

interface InputAmountProps {
    value?: number | string;
    onValueChange?: (value: number | undefined) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    max?: number;
}

export default function InputAmount({
    value,
    onValueChange,
    placeholder,
    className,
    disabled = false,
    max,
}: InputAmountProps) {
    const { getDecimalPlaces } = useFormatters();
    const decimalScale = getDecimalPlaces();

    return (
        <NumericFormat
            value={value}
            onValueChange={(values) => onValueChange?.(values.floatValue)}
            thousandSeparator=","
            decimalSeparator="."
            decimalScale={decimalScale}
            fixedDecimalScale
            allowNegative={false}
            isAllowed={(values) => {
                const { floatValue } = values;
                if (floatValue === undefined) return true;
                if (floatValue >= 1e15) return false;
                if (max !== undefined && floatValue > max) return false;
                return true;
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
