import { Helmet } from 'react-helmet-async'

interface SEOProps {
    title?: string
    description?: string
    url?: string
    image?: string
    type?: 'website' | 'article'
}

const SITE_NAME = 'Bani Abdul Manan'
const DEFAULT_DESCRIPTION = 'Portal keluarga digital resmi Bani Abdul Manan. Menghubungkan generasi, melestarikan sejarah, dan merayakan masa depan bersama.'
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1200&auto=format&fit=crop&q=80'
const BASE_URL = import.meta.env.VITE_BASE_URL || 'https://bamseribuputu.my.id'

export default function SEO({
    title,
    description = DEFAULT_DESCRIPTION,
    url,
    image = DEFAULT_IMAGE,
    type = 'website',
}: SEOProps) {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME
    const canonicalUrl = url ? `${BASE_URL}${url}` : BASE_URL

    return (
        <Helmet>
            {/* Basic Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={canonicalUrl} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />
            <meta property="og:site_name" content={SITE_NAME} />
            <meta property="og:locale" content="id_ID" />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={canonicalUrl} />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />
        </Helmet>
    )
}
