"use client"

import { useLocale, useTranslations } from "next-intl"
import { usePathname, useRouter } from "@/i18n/routing"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronUp } from "lucide-react"

export default function LanguageSwitcher() {
    const t = useTranslations("LocaleSwitcher")
    const locale = useLocale()
    const router = useRouter()
    const pathname = usePathname()

    const onSelectChange = (nextLocale: string) => {
        router.replace(pathname, { locale: nextLocale })
    }

    const languages = [
        { code: "en", label: t("en"), flag: "🇺🇸" },
        { code: "es", label: t("es"), flag: "🇪🇸" },
    ]

    const activeLanguage = languages.find((lang) => lang.code === locale) || languages[0]

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="justify-end px-2 gap-1" aria-label={t("label")}>
                    <span className="text-lg leading-none">{activeLanguage.flag}</span>
                    <ChevronUp className="h-3 w-3 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {languages.map((lang) => (
                    <DropdownMenuItem key={lang.code} onClick={() => onSelectChange(lang.code)}>
                        <span className="mr-2 text-lg leading-none">{lang.flag}</span>
                        {lang.label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
