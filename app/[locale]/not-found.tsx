import { Link } from "@/i18n/routing"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useTranslations } from 'next-intl'

export default function NotFound() {
    const t = useTranslations('Errors.notFound')

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />

            <div className="z-10 flex flex-col items-center text-center space-y-8 p-4">
                {/* Logo */}
                <div className="animate-fade-in">
                    <div className="relative w-16 h-16 md:w-20 md:h-20 mb-4">
                        <Image
                            src="/logo derno.png"
                            alt="Derno Logo"
                            fill
                            className="object-contain dark:hidden"
                            priority
                        />
                        <Image
                            src="/logo derno_dark.png"
                            alt="Derno Logo"
                            fill
                            className="object-contain hidden dark:block"
                            priority
                        />
                    </div>
                </div>

                {/* 404 Text */}
                <div className="space-y-2 animate-slide-up">
                    <h1 className="text-8xl font-bold tracking-tighter text-primary/20 select-none">
                        404
                    </h1>
                    <h2 className="text-3xl font-semibold tracking-tight">
                        {t('title')}
                    </h2>
                    <p className="text-muted-foreground max-w-[400px] mx-auto">
                        {t('description')}
                    </p>
                </div>

                {/* Action Button */}
                <div className="animate-fade-in-delayed">
                    <Button asChild size="lg" className="group">
                        <Link href="/">
                            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                            {t('returnHome')}
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Footer text */}
            <div className="absolute bottom-8 text-xs text-muted-foreground animate-fade-in-more-delayed">
                &copy; {new Date().getFullYear()} Derno. All rights reserved.
            </div>
        </div>
    )
}
