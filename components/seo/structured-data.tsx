import Script from 'next/script'

interface OrganizationSchemaProps {
  url?: string
}

export function OrganizationSchema({ url = "https://derno.vercel.app" }: OrganizationSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Derno",
    "url": url,
    "logo": `${url}/logo derno.png`,
    "description": "Comprehensive tutoring management platform that helps tutors schedule sessions, track student progress, manage payments, and grow their business.",
    "foundingDate": "2024",
    "sameAs": [
      "https://twitter.com/derno",
      "https://facebook.com/derno",
      "https://linkedin.com/company/derno"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Support",
      "email": "support@derno.app"
    }
  }

  return (
    <Script
      id="organization-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

interface SoftwareApplicationSchemaProps {
  url?: string
}

export function SoftwareApplicationSchema({ url = "https://derno.app" }: SoftwareApplicationSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Derno",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "description": "Free 14-day trial, then subscription based pricing"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "500"
    },
    "description": "Derno is a comprehensive tutoring management platform that helps tutors schedule sessions, track student progress, manage payments, and grow their business with powerful analytics and intuitive tools."
  }

  return (
    <Script
      id="software-application-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

interface BreadcrumbSchemaProps {
  items: Array<{
    name: string
    url: string
  }>
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  }

  return (
    <Script
      id="breadcrumb-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

