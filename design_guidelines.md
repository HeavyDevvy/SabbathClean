# Berry Events - Design Guidelines

## Design Approach
**Reference-Based Hybrid**: Drawing from Airbnb's trust-building card system, Thumbtack's service marketplace clarity, and Stripe's professional restraint. This marketplace requires both emotional trust-building and functional efficiency for booking flows.

## Typography System
- **Primary Font**: Inter (Google Fonts) - clean, professional, excellent readability
- **Headings**: Font weights 700-800, sizes: Hero h1 (text-5xl/6xl), Section h2 (text-3xl/4xl), Card h3 (text-xl/2xl)
- **Body**: Font weight 400-500, text-base for primary content, text-sm for supporting details
- **Emphasis**: Semibold (600) for CTAs, provider names, and service pricing

## Layout & Spacing System
**Tailwind Units**: Standardize on 4, 6, 8, 12, 16, 24 for consistency
- Container: max-w-7xl centered with px-6 lg:px-8
- Section spacing: py-16 lg:py-24
- Component gaps: gap-6 to gap-8 for grids
- Card padding: p-6 to p-8

## Page Structure

### Homepage
1. **Navigation Bar**: Sticky header with logo left, main nav center (Browse Services, Become a Provider), user actions right (Search icon, Sign In, Get Started button). Height h-20, border-b with subtle shadow on scroll.

2. **Hero Section**: Full-width image (h-[600px]) showing professional service provider in action. Overlay with gradient from transparent to dark (bottom 40%). Centered content: Large headline "Book Trusted Home Services in Minutes", subheadline, dual CTAs (primary "Find Services", secondary "List Your Services"). Buttons with backdrop-blur-md bg-white/90 for primary, bg-black/60 for secondary.

3. **Search Bar Component**: Positioned -mt-8 (overlapping hero), white card with shadow-xl, rounded-2xl. Three-part search: "What service?" dropdown, "Where?" location input, "When?" date picker, submit button. Grid layout: grid-cols-1 md:grid-cols-4.

4. **Popular Services Grid**: 3x2 grid (lg:grid-cols-3), service cards with square image (aspect-square), service name, starting price, provider count. Hover: subtle scale transform.

5. **How It Works**: Three-column layout (icons top, title, description). Steps: "Choose Your Service", "Book a Provider", "Get It Done". Use large illustrative icons (96x96).

6. **Featured Providers**: Horizontal scrolling cards (md:grid-cols-4), provider photo (circular, w-24), name, rating stars, specialty, reviews count, "View Profile" link.

7. **Trust Indicators**: 2-column split - left side statistics (grid-cols-2, large numbers), right side trust badges and verification logos. Background: subtle gray (bg-gray-50).

8. **Service Categories**: 4-column grid of category cards with background images, category name overlay with gradient backdrop.

9. **Testimonials**: 3-column grid, cards with quote, customer photo (small circular), name, service used. Rotating selection or static display.

10. **Footer CTA**: Full-width section with contrasting background, dual CTA ("For Customers" / "For Providers"), centered layout.

11. **Footer**: 4-column grid - Company links, Services, Support, Social + newsletter. Bottom bar with legal links and copyright.

### Service Listing Page
- **Filter Sidebar**: Left sidebar (w-80), sticky positioning, collapsible on mobile. Categories, price range slider, rating filter, availability calendar, distance radius.
- **Results Grid**: Main content (flex-1), service cards in 2-column grid (lg:grid-cols-2), each card: provider photo left, details right, service name, rating, price/hour, brief description, "Book Now" CTA.
- **Map Toggle**: Option to switch to map view showing provider locations.

### Service Detail Page
- **Image Gallery**: Large primary image (h-96), thumbnail strip below (grid-cols-5).
- **Booking Card**: Sticky right sidebar (w-96), displays price, date/time selector, instant book button, includes provider response time.
- **Provider Profile Mini**: Avatar, name, rating, years experience, verification badge, "View Full Profile" link.
- **Service Details**: Tabs for Description, What's Included, Reviews, Cancellation Policy.
- **Reviews Section**: Star distribution chart, filtered review cards with verified purchase badge.

### Booking Flow
- **Multi-Step Form**: Progress indicator (steps: Details, Schedule, Payment, Confirm), each step in centered card (max-w-2xl), clear back/next navigation.
- **Date/Time Picker**: Calendar view with available slots highlighted, time selection in 30-min increments.
- **Payment Section**: Secure badges, itemized cost breakdown, saved payment methods, add new card form.
- **Confirmation**: Success state with booking ID, provider details, calendar add button, email confirmation note.

### Provider Dashboard
- **Metrics Cards**: 4-column grid showing earnings, bookings, rating, reviews (each with trend indicator).
- **Upcoming Bookings**: List view with customer info, service details, time, navigate/contact options.
- **Calendar View**: Full-month calendar with bookings color-coded by status.

## Component Library

### Cards
- Standard: rounded-xl, border subtle, shadow-sm, hover:shadow-md transition
- Service Card: Image top (aspect-video), content p-6, footer with price and CTA
- Provider Card: Horizontal on desktop (grid-cols-3), image left, stack on mobile

### Buttons
- Primary: Solid background, text-white, px-6 py-3, rounded-lg, font-semibold
- Secondary: Border-2, transparent bg, px-6 py-3, rounded-lg
- On Images: backdrop-blur-md with bg-white/90 or bg-black/60, maintains same padding/rounding

### Form Inputs
- Height: h-12, rounded-lg, border with focus ring, px-4
- Labels: text-sm font-medium, mb-2
- Error states: red border, red text below

### Badges
- Verification: Small, rounded-full, bg-blue with white text
- Rating: Star icon + number, text-sm
- Status: Colored dot + text (Confirmed/Pending/Completed)

## Images Section
1. **Hero Image**: Professional service provider (plumber/electrician/cleaner) in clean, modern home setting. Natural lighting, friendly demeanor. High-quality lifestyle photography. Dimensions: 1920x600px minimum.

2. **Service Category Images**: 8-10 category-specific images (Cleaning, Plumbing, Electrical, etc.). Square format, 800x800px, showing service in action.

3. **Provider Photos**: Circular headshots, professional but approachable. 400x400px minimum.

4. **Trust Section**: Mockup images of verification process, background checks, insurance documentation. Subtle, supporting visuals.

5. **Service Detail Gallery**: Multiple angles of service/results, before-after where applicable. Primary 1200x800px, thumbnails 300x200px.