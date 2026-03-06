import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
    // A list of all locales that are supported
    locales: ['en', 'es', 'fr', 'ar', 'hi'],

    // Used when no locale matches
    defaultLocale: 'en',

    // Persist the user's locale choice via cookie
    localeCookie: true,
});

export const config = {
    // Match all pathnames except for
    // - API routes
    // - _next (Next.js internals)
    // - _vercel (Vercel internals)
    // - Static files (e.g. /favicon.ico, /vercel.svg, etc.)
    matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
