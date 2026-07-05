export interface BreadcrumbItem {
  name: string;
  path: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

const BRAND = {
  name: 'OctopusTrack',
  url: 'https://octopustrack.shop',
  logo: 'https://octopustrack.shop/images/og/og-image-1200x630.jpg',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
} as const;

/**
 * Returns a SoftwareApplication schema block for OctopusTrack.
 */
export function softwareApplication(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: BRAND.name,
    applicationCategory: BRAND.applicationCategory,
    operatingSystem: BRAND.operatingSystem,
    description:
      'Sistema de gestión ERP para ferreterías, sanitarios, distribuidoras y casas de electricidad. Control de ventas, stock, cuentas corrientes y facturación.',
    url: BRAND.url,
    publisher: {
      '@type': 'Organization',
      name: BRAND.name,
      url: BRAND.url,
    },
  };
}

/**
 * Returns an Organization schema block for OctopusTrack.
 */
export function organization(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: BRAND.name,
    url: BRAND.url,
    logo: BRAND.logo,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: 'Spanish',
    },
  };
}

/**
 * Returns a BreadcrumbList schema block from a list of BreadcrumbItem.
 * Transforms relative paths into absolute URLs using the brand URL.
 */
export function breadcrumbList(items: BreadcrumbItem[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${BRAND.url}${item.path}`,
    })),
  };
}

/**
 * Returns an FAQPage schema block from a list of FaqItem.
 */
export function faqPage(items: FaqItem[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

/**
 * Wraps an array of schema types into a single @graph container.
 * Pass the result as one item in BaseLayout's `structuredData` array.
 */
export function buildGraph(types: object[]): object {
  return {
    '@context': 'https://schema.org',
    '@graph': types,
  };
}
