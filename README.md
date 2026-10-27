# StaySphere

StaySphere is a full-stack travel listing application where users can discover stays, search by destination or category, create and manage listings, and leave reviews.

## Tech stack

- React, TypeScript, and Vite
- Node.js and Express
- MongoDB Atlas and Mongoose
- Passport with MongoDB-backed sessions
- Cloudinary image uploads
- Mapbox maps and geocoding

## Features

- Search and category filters
- Listing details with interactive maps
- Account registration, login, and logout
- Owner-only listing creation, editing, and deletion
- Author-only review deletion
- Responsive layout for desktop and mobile

## Local setup

1. Install backend packages with `npm install`.
2. Install frontend packages with `npm install --prefix client`.
3. Copy `.env.example` to `.env` and add development credentials.
4. Copy `client/.env.example` to `client/.env.local` and add a public Mapbox token.
5. Start Express with `npm start`.
6. In another terminal, start React with `npm run dev --prefix client`.

Use an isolated development database. Do not run the development seed against production.

## Production build

Run `npm run build`. Express serves the generated React application from `client/dist` when `NODE_ENV=production`.

## Environment variables

See `.env.example` and `client/.env.example`. Real credentials are intentionally excluded from Git.
