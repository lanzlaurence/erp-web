// js/components/ui/input-phone.tsx
import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

interface InputPhoneProps {
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    id?: string;
}

const InputPhone = forwardRef<HTMLInputElement, InputPhoneProps>(
    ({ value, onChange, placeholder = '+63 912 345 6789', className, disabled = false, id }, ref) => {

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            // Allow only digits, spaces, +, -, (, )
            const cleaned = e.target.value.replace(/[^\d\s+\-().]/g, '');
            onChange?.(cleaned);
        };

        return (
            <input
                ref={ref}
                id={id}
                type="tel"
                value={value}
                onChange={handleChange}
                placeholder={placeholder}
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
);

InputPhone.displayName = 'InputPhone';

export default InputPhone;
