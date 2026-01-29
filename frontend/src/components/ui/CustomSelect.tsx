import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
    value: string | number;
    label: string;
}

interface CustomSelectProps {
    value: string | number;
    onChange: (value: string) => void;
    options: Option[];
    placeholder?: string;
    label?: string;
    required?: boolean;
}

export default function CustomSelect({ value, onChange, options, placeholder = 'Seçiniz', label, required }: CustomSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(o => String(o.value) === String(value));

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);

    return (
        <div className="relative" ref={dropdownRef}>
            {label && <label className="block text-sm font-semibold text-gray-900 mb-2">{label}</label>}

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full text-left border-0 ring-1 ring-gray-200 rounded-lg px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-black focus:bg-white transition-all shadow-sm flex items-center justify-between ${isOpen ? 'ring-black bg-white' : ''}`}
            >
                <span className={`block truncate ${selectedOption ? 'text-gray-900' : 'text-gray-400'}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown size={20} className={`text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute z-50 mt-1 w-full bg-white shadow-lg max-h-60 rounded-lg py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm animate-in fade-in zoom-in-95 duration-100">
                    {options.length === 0 ? (
                        <div className="text-gray-500 select-none relative py-2 pl-3 pr-9">Seçenek yok</div>
                    ) : (
                        options.map((option) => {
                            const isSelected = String(option.value) === String(value);
                            return (
                                <div
                                    key={option.value}
                                    className={`cursor-pointer select-none relative py-2.5 pl-4 pr-9 hover:bg-gray-50 transition-colors ${isSelected ? 'text-black font-semibold bg-gray-50' : 'text-gray-900'}`}
                                    onClick={() => {
                                        onChange(String(option.value));
                                        setIsOpen(false);
                                    }}
                                >
                                    <span className={`block truncate ${isSelected ? 'font-medium' : 'font-normal'}`}>
                                        {option.label}
                                    </span>
                                    {isSelected && (
                                        <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-black">
                                            <Check size={16} />
                                        </span>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {/* Hidden input for form requirements if needed, usually managed by state though */}
            {required && <input type="text" className="sr-only" value={value} required onChange={() => { }} />}
        </div>
    );
}
