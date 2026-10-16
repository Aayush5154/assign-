# PulseBoard — Personalized Content Dashboard
## Project Documentation

**Project repository:** https://github.com/Aayush5154/assign-  
**Developer:** Aayush Vijay  
**Project type:** Responsive web application  
**Framework:** Next.js App Router, React, TypeScript

## 1. Overview

PulseBoard is a personalized content dashboard that brings news, movie recommendations, and simulated social posts together in one responsive interface. Users can browse content by category, search across content, save favorites, customize interests, switch themes, and rearrange dashboard widgets. The project focuses on an intuitive user experience, reusable components, resilient API handling, accessibility, and automated testing.

## 2. Objectives

- Provide a single place to discover several types of content.
- Personalize displayed content using selected interests and category filters.
- Make search, pagination, favorites, and preferences easy to use.
- Keep third-party API keys on the server rather than exposing them in client-side code.
- Ensure a consistent responsive interface with dark and light themes.
- Support reliable development through unit, integration, and end-to-end tests.

## 3. Main Features

### Personalized dashboard and feed
The overview presents a greeting, date, interest filters, content widgets, and highlights. A unified feed combines news, movies, and social content with tabs and category filters.

### News
News is requested through Next.js server route handlers. The interface supports category-based headlines, search, pagination, loading skeletons, retry and clear indication when demonstration data is being used.

### Movies
The movie section supports popular and trending titles, title search, posters, ratings, genres, detail pages, trailers, and recommendations. TMDB attribution is included in the application.

### Social demo feed
A deterministic mock API provides sample social posts. Demo posts are explicitly labelled so simulated content is not mistaken for real user-generated content. Likes are stored locally.

### Search
Global search includes a short debounce, suggestions, recent searches, category tabs, URL query parameters, request cancellation, and protection against older requests overwriting newer results.

### Favorites and preferences
Users can save news, movies, and social posts, then browse and filter their favorites. Selected interests and personalized-feed preferences are managed through Redux Toolkit and persisted in LocalStorage.

### Customizable dashboard and themes
Widgets can be rearranged using drag-and-drop controls, with the order saved locally and an option to reset. Dark and light themes use shared CSS variables and persist between visits.

### Responsive design and accessibility
The layout adapts to desktop and mobile screens, with a collapsible sidebar and mobile navigation. Accessibility features include semantic landmarks, labelled inputs, keyboard-operable controls, focus indicators, alt text, and support for reduced-motion preferences.

## 4. Technology Stack

- **Frontend:** Next.js 15 App Router, React 19, TypeScript
- **Styling:** Tailwind CSS, CSS custom properties
- **State management:** Redux Toolkit, React Redux
- **Animations:** Framer Motion
- **Drag and drop:** dnd-kit
- **Forms and validation:** React Hook Form, Zod
- **Icons:** Lucide React
- **External data:** NewsAPI and TMDB, accessed through server routes
- **Demo content:** Deterministic local/mock social data and fallback data
- **Persistence:** LocalStorage for preferences, favorites, theme, widget order, likes, and recent searches
- **Testing:** Vitest, React Testing Library, Playwright

## 5. High-Level Architecture

1. **UI layer:** Reusable layouts, content cards, widgets, filters, forms, and navigation render the dashboard.
2. **State layer:** Redux slices manage preferences, favorites, theme, and dashboard state.
3. **API layer:** Next.js Route Handlers act as a server-side gateway to NewsAPI and TMDB. The client calls same-origin endpoints rather than exposing provider keys.
4. **Normalization and validation:** Provider responses are transformed into consistent application content types, while input validation and error states make failures easier to handle.
5. **Persistence layer:** LocalStorage retains user-facing settings across sessions; state is restored client-side to avoid server-rendering hydration mismatches.
6. **Testing layer:** Unit, integration, and Playwright end-to-end tests cover behavior at different levels.

## 6. API Endpoints

| Endpoint | Purpose |
| --- | --- |
| `GET /api/news` | Retrieve news headlines by category and page |
| `GET /api/news/search` | Search news articles |
| `GET /api/movies/popular` | Retrieve popular movies |
| `GET /api/movies/trending` | Retrieve trending movies |
| `GET /api/movies/search` | Search for movies |
| `GET /api/movies/[id]` | Retrieve movie details, trailer information, and recommendations |
| `GET /api/social` | Retrieve deterministic mock social posts |

The API layer returns structured responses and handles invalid input, rate limits, and upstream provider failures. API keys are configured through server-side environment variables.

## 7. Local Setup

**Requirements:** Node.js 20 or later and npm 10 or later.

1. Clone the repository:
   `git clone https://github.com/Aayush5154/assign-.git`
2. Enter the project directory:
   `cd assign-`
3. Install dependencies:
   `npm install`
4. Create a `.env.local` file in the project root and add the keys you have:
   `NEWS_API_KEY=your_news_api_key`
   `TMDB_API_KEY=your_tmdb_api_key`
5. Start the development server:
   `npm run dev`
6. Open `http://localhost:3000`.

The application can run in demonstration mode without API keys. In that case, it displays labelled sample data rather than presenting it as live results.

## 8. Testing and Quality Checks

The repository includes:
- **Unit and integration tests:** `npm test`
- **Linting:** `npm run lint`
- **Type checking:** `npm run typecheck`
- **Production build:** `npm run build`
- **End-to-end tests:** `npm run test:e2e`

Playwright browser installation may be required before the first end-to-end test run. Tests are designed to run without API keys where applicable.

## 9. Security, Reliability, and Design Choices

- Third-party API keys stay in server environment variables and are not intended to be exposed in browser code.
- Demo content is labelled clearly and is not silently mixed with live provider results.
- Request cancellation and stale-response guards improve search and pagination reliability.
- Input validation and explicit loading, empty, and error states help users understand what is happening.
- LocalStorage reads use safe defaults when saved data is invalid.
- Shared theme variables keep dark and light modes visually consistent.
- Reduced-motion preferences and keyboard-accessible controls improve usability.

## 10. Limitations

- A real authentication system is not included; preferences are stored in the browser.
- Social posts are simulated demo content, not a live social network integration.
- Availability and behavior of live news results depend on NewsAPI plan restrictions and provider availability.
- Live news and movie data requires valid API keys; otherwise, the application uses labelled demonstration data.

## 11. Deployment

The project is configured for deployment on Vercel as a Next.js application:

1. Import the GitHub repository into Vercel.
2. Select the Next.js framework preset.
3. Add `NEWS_API_KEY` and `TMDB_API_KEY` as server environment variables if live data is required.
4. Deploy the application and verify the news, movie, search, and demo fallback flows.

Do not commit `.env.local` or any real API secrets to the repository.

## 12. Conclusion

PulseBoard demonstrates the development of a modern, responsive content dashboard that combines third-party data integration, client-side state management, local persistence, interactive widgets, search, theming, accessibility, and automated testing. Its server-side API gateway and explicit demonstration mode make the application easier to develop and test while keeping external service credentials out of the browser.

**Source code:** https://github.com/Aayush5154/assign-
