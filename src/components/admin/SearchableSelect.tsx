import { useState } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type SearchableOption = { value: string; label: string; hint?: string };

/**
 * Select with a built-in live search box. Drop-in replacement for the
 * shadcn Select in admin forms where the option list is long (products,
 * merchants, customers, categories, ...).
 */
export function SearchableSelect({
  options, value, onValueChange, placeholder = "Select...", searchPlaceholder = "Type to search...", emptyText = "No match found.", className,
  onCreate, createLabel = "Add",
}: {
  options: SearchableOption[];
  value: string;
  onValueChange: (v: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
  /** When set, typing a name with no exact match shows an "Add ..." row that calls this. */
  onCreate?: (label: string) => void;
  createLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selected = options.find((o) => o.value === value);
  const trimmed = query.trim();
  const canCreate = !!onCreate && trimmed.length > 0 &&
    !options.some((o) => o.label.toLowerCase() === trimmed.toLowerCase());

  return (
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (!o) setQuery(""); }}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between font-normal", !selected && "text-muted-foreground", className)}
        >
          <span className="truncate">{selected ? selected.label : placeholder}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]" align="start">
        <Command
          filter={(itemValue, search) => (itemValue.toLowerCase().includes(search.toLowerCase()) ? 1 : 0)}
        >
          <CommandInput placeholder={searchPlaceholder} value={query} onValueChange={setQuery} />
          <CommandList className="max-h-60">
            <CommandEmpty>
              {onCreate && trimmed ? (
                <button
                  type="button"
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent rounded-md text-left"
                  onClick={() => { onCreate(trimmed); setQuery(""); setOpen(false); }}
                >
                  <Plus className="h-4 w-4 text-primary" /> {createLabel} “{trimmed}”
                </button>
              ) : emptyText}
            </CommandEmpty>
            <CommandGroup>
              {options.map((o) => (
                <CommandItem
                  key={o.value}
                  value={`${o.label} ${o.hint ?? ""}`}
                  onSelect={() => { onValueChange(o.value); setQuery(""); setOpen(false); }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === o.value ? "opacity-100" : "opacity-0")} />
                  <div className="min-w-0">
                    <div className="truncate">{o.label}</div>
                    {o.hint && <div className="text-xs text-muted-foreground truncate">{o.hint}</div>}
                  </div>
                </CommandItem>
              ))}
              {canCreate && (
                <CommandItem value={`__create__ ${trimmed}`} onSelect={() => { onCreate!(trimmed); setQuery(""); setOpen(false); }}>
                  <Plus className="mr-2 h-4 w-4 text-primary" />
                  <span>{createLabel} “{trimmed}”</span>
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
