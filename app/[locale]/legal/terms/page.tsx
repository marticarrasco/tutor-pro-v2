import { TermsOfServiceEn } from "@/components/legal/terms-of-service-en"
import { TermsOfServiceEs } from "@/components/legal/terms-of-service-es"
import { PageHeader } from "@/components/page-header"

import { ForceLightMode } from "@/components/force-light-mode"

export default function TermsPage({ params: { locale } }: { params: { locale: string } }) {
    return (
        <div className="container max-w-4xl py-10">
            <ForceLightMode />
            <PageHeader
                title={locale === "es" ? "Términos de Servicio" : "Terms of Service"}
                description={locale === "es" ? "Lea nuestros términos de servicio cuidadosamente." : "Read our terms of service carefully."}
                hideSidebarTrigger={true}
            />
            <div className="mt-8">
                {locale === "es" ? <TermsOfServiceEs /> : <TermsOfServiceEn />}
            </div>
        </div>
    )
}
