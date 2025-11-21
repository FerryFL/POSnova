"use client"

import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Button } from "../ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command"
import { cn } from "~/lib/utils"

type Option = {
    value: string
    label: string
}

export function MultiSelectCombobox({
    options = [],
    value,
    onChange,
}: {
    options: Option[]
    value: string[]
    onChange: (val: string[]) => void
}) {
    const [open, setOpen] = React.useState(false)

    const toggleValue = (val: string) => {
        if (value.includes(val)) {
            onChange(value.filter((v) => v !== val))
        } else {
            onChange([...value, val])
        }
    }

    const removeValue = (val: string) => {
        onChange(value.filter((v) => v !== val))
    }

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
                {value.map((val) => {
                    const label = options.find((o) => o.value === val)?.label
                    return (
                        <div key={val} className="px-2 py-1 rounded-md border flex items-center gap-1">
                            <p className="text-sm">{label}</p>
                            <X className="w-4 h-4 cursor-pointer" onClick={() => removeValue(val)} />
                        </div>
                    )
                })}
            </div>

            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" className="w-[250px] justify-between">
                        {value.length > 0 ? `${value.length} Varian Terpilih` : "Pilih varian..."}
                        <ChevronsUpDown className="opacity-50 w-4 h-4" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[250px] p-0" >
                    <Command>
                        <CommandInput placeholder="Cari varian..." className="h-9" />
                        <CommandList>
                            <CommandEmpty>Varian Tidak ditemukan</CommandEmpty>
                            <CommandGroup>
                                {options.map((item) => (
                                    <CommandItem key={item.value} value={item.label} onSelect={() => toggleValue(item.value)}>
                                        {item.label}
                                        <Check
                                            className={cn(
                                                "ml-auto w-4 h-4",
                                                value.includes(item.value) ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    )
}
