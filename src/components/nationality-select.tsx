import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// Most commonly selected nationalities in the UK, surfaced at the top.
const COMMON = ["British", "Irish", "Polish", "Indian", "Pakistani", "Romanian"];

const ALL = [
  "Afghan", "Albanian", "Algerian", "American", "Andorran", "Angolan", "Argentine",
  "Armenian", "Australian", "Austrian", "Azerbaijani", "Bahamian", "Bahraini",
  "Bangladeshi", "Barbadian", "Belarusian", "Belgian", "Belizean", "Beninese",
  "Bhutanese", "Bolivian", "Bosnian", "Botswanan", "Brazilian", "British",
  "Bruneian", "Bulgarian", "Burkinabe", "Burmese", "Burundian", "Cambodian",
  "Cameroonian", "Canadian", "Cape Verdean", "Central African", "Chadian",
  "Chilean", "Chinese", "Colombian", "Comoran", "Congolese", "Costa Rican",
  "Croatian", "Cuban", "Cypriot", "Czech", "Danish", "Djiboutian", "Dominican",
  "Dutch", "East Timorese", "Ecuadorean", "Egyptian", "Emirati", "Equatorial Guinean",
  "Eritrean", "Estonian", "Ethiopian", "Fijian", "Finnish", "French", "Gabonese",
  "Gambian", "Georgian", "German", "Ghanaian", "Greek", "Grenadian", "Guatemalan",
  "Guinean", "Guyanese", "Haitian", "Honduran", "Hungarian", "Icelandic", "Indian",
  "Indonesian", "Iranian", "Iraqi", "Irish", "Israeli", "Italian", "Ivorian",
  "Jamaican", "Japanese", "Jordanian", "Kazakh", "Kenyan", "Kiribati", "Kosovar",
  "Kuwaiti", "Kyrgyz", "Laotian", "Latvian", "Lebanese", "Liberian", "Libyan",
  "Liechtensteiner", "Lithuanian", "Luxembourgish", "Macedonian", "Malagasy",
  "Malawian", "Malaysian", "Maldivian", "Malian", "Maltese", "Marshallese",
  "Mauritanian", "Mauritian", "Mexican", "Micronesian", "Moldovan", "Monégasque",
  "Mongolian", "Montenegrin", "Moroccan", "Mozambican", "Namibian", "Nauruan",
  "Nepalese", "New Zealander", "Nicaraguan", "Nigerian", "Nigerien", "North Korean",
  "Norwegian", "Omani", "Pakistani", "Palauan", "Palestinian", "Panamanian",
  "Papua New Guinean", "Paraguayan", "Peruvian", "Filipino", "Polish", "Portuguese",
  "Qatari", "Romanian", "Russian", "Rwandan", "Saint Lucian", "Salvadoran",
  "Samoan", "San Marinese", "Saudi", "Senegalese", "Serbian", "Seychellois",
  "Sierra Leonean", "Singaporean", "Slovak", "Slovenian", "Solomon Islander",
  "Somali", "South African", "South Korean", "South Sudanese", "Spanish",
  "Sri Lankan", "Sudanese", "Surinamese", "Swazi", "Swedish", "Swiss", "Syrian",
  "Taiwanese", "Tajik", "Tanzanian", "Thai", "Togolese", "Tongan",
  "Trinidadian", "Tunisian", "Turkish", "Turkmen", "Tuvaluan", "Ugandan",
  "Ukrainian", "Uruguayan", "Uzbek", "Vanuatuan", "Venezuelan", "Vietnamese",
  "Yemeni", "Zambian", "Zimbabwean",
];

const REST = ALL.filter((n) => !COMMON.includes(n)).sort((a, b) => a.localeCompare(b));

export function NationalitySelect({
  value,
  onChange,
}: {
  value?: string | null;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-10 w-full justify-between font-normal"
        >
          <span className={cn(!value && "text-muted-foreground")}>
            {value || "Choose nationality…"}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search nationality…" />
          <CommandList>
            <CommandEmpty>No nationality found.</CommandEmpty>
            <CommandGroup heading="Common">
              {COMMON.map((n) => (
                <Item key={n} name={n} value={value} onSelect={onChange} setOpen={setOpen} />
              ))}
            </CommandGroup>
            <CommandGroup heading="All nationalities">
              {REST.map((n) => (
                <Item key={n} name={n} value={value} onSelect={onChange} setOpen={setOpen} />
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function Item({
  name,
  value,
  onSelect,
  setOpen,
}: {
  name: string;
  value?: string | null;
  onSelect: (value: string) => void;
  setOpen: (open: boolean) => void;
}) {
  return (
    <CommandItem
      value={name}
      onSelect={() => {
        onSelect(name);
        setOpen(false);
      }}
    >
      <Check className={cn("mr-2 h-4 w-4", value === name ? "opacity-100" : "opacity-0")} />
      {name}
    </CommandItem>
  );
}