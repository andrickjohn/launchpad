export interface SupportedScraper {
    actorId: string
    name: string
    description: string
    baseCostPer1k: number
    logoBase64?: string
    iconLabel: string // We will use predefined strings we can map to Lucide icons
    inputTypeHelp: string
}

export const SUPPORTED_SCRAPERS: SupportedScraper[] = [
    {
        actorId: 'compass/google-maps-scraper',
        name: 'Google Maps Scraper',
        description: 'Best for local businesses, restaurants, plumbers, dentists.',
        baseCostPer1k: 5.00,
        iconLabel: 'MapPin',
        inputTypeHelp: 'Needs "searchStrings" array',
    },
    {
        actorId: 'bebity/linkedin-scraper',
        name: 'LinkedIn Profile Scraper',
        description: 'Best for corporate profiles, B2B roles, executives.',
        baseCostPer1k: 8.00,
        iconLabel: 'Briefcase',
        inputTypeHelp: 'Needs "urls" array',
    },
    {
        actorId: 'apify/instagram-profile-scraper',
        name: 'Instagram Scraper',
        description: 'Best for influencers, D2C brands, creators.',
        baseCostPer1k: 3.50,
        iconLabel: 'Instagram',
        inputTypeHelp: 'Needs "usernames" array',
    },
    {
        actorId: 'dainty_screw/github-user-scraper',
        name: 'GitHub User Scraper',
        description: 'Best for developers, engineers, technical talent.',
        baseCostPer1k: 2.00,
        iconLabel: 'Code',
        inputTypeHelp: 'Needs "search" string',
    }
]
