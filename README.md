# Abyssinia Beans

Immersive single-page experience for exploring Ethiopian microlots, balancing custom blends, and staging orders for the roastery. Built with React, TypeScript, and Vite.

## Features

- Curated single-origin catalog with processing details, tasting notes, and ETB pricing
- Custom blend lab with live weight tracking and bag size balancing
- Roast choice prompt that asks account holders for As Is, Roasted, or Roasted & Ground before carting
- Account creation, login, and a persistent navbar with top-right cart access
- First registered account is promoted to admin and flagged within the navbar session badge
- Quick-add lots prompt for roast preparation before they enter the cart
- Custom blends prompt for percentages, enforce 100% totals, then ask how many kilograms you need
- Cart staging area with removal controls and total value visibility
- Order history timeline that auto-progresses through queued, roasting, and fulfilled states
- Responsive gradient-driven theme with subtle motion accents

## Tech Stack

- React 19 functional components and hooks
- TypeScript for strongly typed coffee, cart, and order data models
- Vite for rapid development and optimized production output
- Modern CSS for layout, animation, and responsive breakpoints

## Getting Started

1. Install dependencies with npm install
2. Start the dev server with npm run dev (http://localhost:5173)
3. Create a production build with npm run build

## Available Scripts

- npm run dev – start the development server
- npm run build – type-check and generate a production build
- npm run preview – inspect the production build locally
- npm run lint – execute ESLint using the shared configuration

## Project Structure

- src/App.tsx – main SPA composition with catalog, blend lab, cart, and history views
- src/App.css – component styling, layout primitives, motion design, navigation, and prompts
- src/main.tsx – React bootstrap and global style imports
- public – static assets that ship unchanged with the build

## Next Steps

1. Connect authentication, carts, and orders to a MongoDB-backed API
2. Harden password handling with hashing, session tokens, and refresh flows
3. Extend blend lab with grind options and inventory-aware availability
4. Prepare API endpoints to power the upcoming companion mobile application

## MongoDB Compass Workflow

MongoDB Compass offers a local-first way to inspect and seed data for the eventual backend. A suggested structure:

1. Launch Compass and connect to your local or Atlas cluster.
2. Create a database named `abyssinia_beans` with the following collections:
	- `users` – `{ name, email, passwordHash, createdAt }`
	- `coffees` – existing catalog records (`process`, `region`, `flavorNotes`, `pricePerKg`, etc.)
	- `carts` – `{ userId, items: [{ coffeeId, weight }], roastChoice, bagSize, createdAt }`
	- `orders` – `{ userId, cartId, status, fulfilledAt }`
3. Seed initial documents through Compass or the `import` wizard so the API has data to serve.
4. Expose a secure connection string via an `.env` entry like `VITE_API_BASE_URL` once a backend is ready.

> The current UI keeps credentials in `localStorage` for demo purposes only. Integrate a Node/Express or serverless API that authenticates against MongoDB, stores salted password hashes, and issues secure session tokens before moving to production.
