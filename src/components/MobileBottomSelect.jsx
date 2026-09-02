import React, { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';

export default function MobileBottomSelect({ value, onChange, options, placeholder, triggerClassName }) {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.value === value);

  return (
    <>
      {/* Desktop: floating dropdown (unchanged) */}
      <div className="hidden md:block">
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className={triggerClassName}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Mobile: native-style slide-up bottom drawer (vaul) */}
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <button
            type="button"
            className={`md:hidden flex items-center justify-between gap-1.5 ${triggerClassName}`}
          >
            <span className="truncate">{selected?.label || placeholder}</span>
            <ChevronDown className="w-4 h-4 opacity-50 shrink-0" />
          </button>
        </DrawerTrigger>
        <DrawerContent className="max-h-[60vh]">
          <DrawerHeader className="text-left px-4 pb-2">
            <DrawerTitle className="text-[11px] font-mono text-muted-foreground uppercase tracking-widest">{placeholder}</DrawerTitle>
          </DrawerHeader>
          <div className="px-3 pb-[max(1rem,env(safe-area-inset-bottom))] space-y-1 overflow-y-auto">
            {options.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  value === opt.value
                    ? 'bg-primary/10 text-primary border border-primary/30'
                    : 'text-foreground hover:bg-secondary border border-transparent'
                }`}
              >
                {opt.label}
                {value === opt.value && <Check className="w-4 h-4 text-primary" />}
              </button>
            ))}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}