import { PrivacyPolicyEn } from "@/components/legal/privacy-policy-en"
import { PrivacyPolicyEs } from "@/components/legal/privacy-policy-es"
import { PageHeader } from "@/components/page-header"

import { ForceLightMode } from "@/components/force-light-mode"

export default function PrivacyPage({ params: { locale } }: { params: { locale: string } }) {
    return (
        <div className="container max-w-4xl py-10">
            <ForceLightMode />
            <PageHeader
                title={locale === "es" ? "Política de Privacidad" : "Privacy Policy"}
                description={locale === "es" ? "Lea nuestra política de privacidad cuidadosamente." : "Read our privacy policy carefully."}
                hideSidebarTrigger={true}
            />
            <div className="mt-8">
                {locale === "es" ? <PrivacyPolicyEs /> : <PrivacyPolicyEn />}
            </div>
        </div>
    )
}
