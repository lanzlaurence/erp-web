// resources/js/components/password-requirements.tsx
type Props = {
    password: string;
};

type Requirement = {
    label: string;
    met: boolean;
};

export default function PasswordRequirements({ password }: Props) {
    const requirements: Requirement[] = [
        { label: 'At least 8 characters',      met: password.length >= 8 },
        { label: 'One uppercase letter (A-Z)',  met: /[A-Z]/.test(password) },
        { label: 'One lowercase letter (a-z)',  met: /[a-z]/.test(password) },
        { label: 'One number (0-9)',            met: /[0-9]/.test(password) },
        { label: 'One symbol (!@#$...)',        met: /[^A-Za-z0-9]/.test(password) },
    ];

    if (!password) return null;

    return (
        <ul className="mt-1 space-y-1">
            {requirements.map((req) => (
                <li key={req.label} className={`flex items-center gap-1.5 text-xs ${req.met ? 'text-green-600' : 'text-muted-foreground'}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${req.met ? 'bg-green-600' : 'bg-muted-foreground'}`} />
                    {req.label}
                </li>
            ))}
        </ul>
    );
}
