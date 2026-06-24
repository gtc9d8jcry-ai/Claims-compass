import { useState } from 'react';
import { Command, CommandInput, CommandList, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown } from 'lucide-react';

const COMMON_NATIONALITIES = [
  'British', 'Irish', 'Polish', 'Romanian', 'Indian', 'Pakistani', 
  'Bangladeshi', 'Nigerian', 'Ghanaian', 'Jamaican', 'Other EEA', 'Other'
];

interface NationalitySelectProps {
  value?: string;
  onChange?: (value: string) => void;
}

export function NationalitySelect({ value = 'British', onChange }: NationalitySelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const handleSelect = (nationality: string) => {
    onChange?.(nationality);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          {value || 'Select nationality'}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput 
            placeholder="Search nationality..." 
            value={search} 
            onValueChange={setSearch} 
          />
          <CommandList>
            {COMMON_NATIONALITIES
              .filter(n => n.toLowerCase().includes(search.toLowerCase()))
              .map((nationality) => (
                <CommandItem
                  key={nationality}
                  onSelect={() => handleSelect(nationality)}
                  className="flex items-center"
                >
                  <Check className={`mr-2 h-4 w-4 ${value === nationality ? 'opacity-100' : 'opacity-0'}`} />
                  {nationality}
                </CommandItem>
              ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}