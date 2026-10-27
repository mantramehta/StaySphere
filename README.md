
# StaySphere

### Discover beautiful places. Explore unique stays.

A full-stack travel accommodation platform built with **React, TypeScript, Node.js, Express, and MongoDB**.

StaySphere lets users discover accommodations, explore destinations, search and filter listings, view property locations, and share reviews. Registered users can manage their own listings through authenticated, ownership-protected workflows.

Built with a separate React frontend and Express backend, the application combines client-side routing, REST APIs, persistent authentication sessions, cloud image storage, and geolocation services.

**[Live Demo](https://staysphere-f4xw.onrender.com)** | **[Source Code](https://github.com/mantramehta/StaySphere)**

---

## Application Preview

### Home Page

![StaySphere Home](screenshots/homepage.png)

### Explore Listings

![StaySphere Listings](screenshots/listings.png)

---

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite, CSS |
| Routing | React Router |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| Authentication | Passport.js, Express Session |
| Session Storage | MongoDB |
| Image Storage | Cloudinary |
| Maps & Geocoding | Mapbox |
| Deployment | Render |

---

## Features

### Property Discovery
- Browse accommodations with images, locations, and pricing.
- Search listings by title, location, or country.
- Filter stays using property categories.
- Navigate to individual listing details using React Router.
- Explore property locations through interactive maps.

### Authentication & User Sessions
- User registration, login, and logout.
- Session-based authentication using Passport.js.
- Persistent sessions backed by MongoDB.
- Authentication-aware React components.
- Current-user retrieval through a dedicated authentication API.
- Credential-aware frontend requests for authenticated operations.

### Listing Management
- Create new accommodation listings.
- Edit existing property details.
- Delete listings owned by the authenticated user.
- Upload property images through Cloudinary.
- Manage listing data through Express routes and MongoDB.

### Reviews & Authorization
- Add reviews to property listings.
- Associate reviews with user accounts.
- Restrict review deletion to the original author.
- Enforce authorization on protected backend operations.

### Maps & External Services
- Display property locations with Mapbox.
- Integrate geocoding for location-based functionality.
- Use Cloudinary for hosted property images.

---

## System Architecture

StaySphere uses a client-server architecture with a React frontend and an Express backend.

```text
                       USER
                         |
                         v
                React + TypeScript
                 Vite / React Router
                         |
                         | HTTP / JSON
                         v
                  Express Server
                    Node.js
                         |
          +--------------+--------------+
          |              |              |
          v              v              v
     Auth Routes    Listing Routes   Review Routes
          |              |              |
          +--------------+--------------+
                         |
              Controllers / Middleware
                         |
                       Mongoose
                         |
                         v
                    MongoDB Atlas


External Services
-----------------
Cloudinary   Image uploads and storage
Mapbox       Maps and geocoding
Render       Production hosting
```

### Frontend

The React application is located in `client/` and uses TypeScript for typed application logic.

- React Router handles client-side navigation.
- Reusable components support shared UI elements.
- Page components handle individual application views.
- React Hooks manage component state and side effects.
- Fetch requests communicate with the Express backend.

### Backend

The Express backend is located at the repository root and separates routing, controllers, middleware, models, and utilities.

It is responsible for:
- Processing API requests.
- Managing authentication and sessions.
- Validating and authorizing protected operations.
- Performing MongoDB operations through Mongoose.
- Integrating external services.

### Authentication Flow

The frontend retrieves the currently authenticated user using:

```typescript
fetch('/api/auth/me', {
  credentials: 'include'
});
```

The Express backend uses session-based authentication to identify the user.

React maintains the current user in component state and updates the interface based on the authentication result.

Protected operations are authorized on the backend rather than relying only on frontend UI restrictions.

---

## Project Structure

```text
StaySphere/
|
|-- client/                  # React + TypeScript frontend
|   |-- public/              # Static assets
|   |-- src/
|   |   |-- components/      # Reusable UI components
|   |   |-- pages/           # Application pages
|   |   |-- App.tsx          # Routes and app-level logic
|   |   |-- main.tsx         # React entry point
|   |   |-- types.ts         # TypeScript types
|   |   |-- App.css
|   |   `-- index.css
|   |-- .env.example
|   |-- package.json
|   `-- vite.config.ts
|
|-- controllers/             # Request handlers
|-- models/                  # Mongoose models
|-- routes/                  # Express routes
|-- utils/                   # Backend utilities
|-- init/                    # Development seed data
|-- app.js                   # Express application
|-- middleware.js            # Application middleware
|-- schema.js                # Validation schemas
|-- cloudConfig.js           # Cloudinary configuration
|-- .env.example
|-- package.json
`-- README.md
```

Generated build files, installed dependencies, and private environment files are excluded from this simplified structure.

---

## Local Development

### Prerequisites

- Node.js and npm
- MongoDB Atlas or local MongoDB
- Cloudinary account
- Mapbox access token

### 1. Clone the Repository

```bash
git clone https://github.com/mantramehta/StaySphere.git
cd StaySphere
```

### 2. Install Dependencies

Install backend dependencies:

```bash
npm install
```

Install frontend dependencies:

```bash
npm install --prefix client
```

### 3. Configure Environment Variables

Create the backend `.env` file based on `.env.example`.

Create `client/.env.local` using `client/.env.example`.

Provide the required database configuration, session credentials, Cloudinary configuration, and public Mapbox token.

Never commit private credentials or production secrets.

### 4. Start the Backend

```bash
npm start
```

### 5. Start the Frontend

In a separate terminal:

```bash
npm run dev --prefix client
```

Open the local development URL shown by Vite.

**Note:** Use an isolated development database. Do not run seed scripts against production data.

---

## Production Deployment

StaySphere is deployed on Render.

The application uses a production build of the React frontend, served by Express alongside the backend routes.

Build command:

```bash
npm install && npm run build
```

Start command:

```bash
npm start
```

The root build script builds the React application in the `client/` directory.

When `NODE_ENV=production`, Express serves the compiled React application from `client/dist`.

**Live Application:** https://staysphere-f4xw.onrender.com

---

## Engineering Highlights

### Client-Side Routing

React Router manages navigation between application pages without requiring a full document reload for normal internal navigation.

### Persistent Authentication

Passport.js and MongoDB-backed sessions support authenticated requests across navigation and page reloads.

### Server-Side Authorization

Sensitive operations are protected by backend authorization checks, including listing ownership and review authorship.

### Separation of Concerns

The backend separates routes, controllers, middleware, models, and supporting utilities, while the frontend separates pages, reusable components, and TypeScript types.

### Third-Party Integrations

Cloudinary handles listing images, while Mapbox provides maps and geocoding functionality.

---

## Future Improvements

- Automated testing for API endpoints and authentication flows.
- Improved search and filtering experiences.
- Accessibility enhancements.
- Additional performance optimizations.
- Further improvements to user and listing management.

---

## Author

**Mantra Mehta**

M.S. Computer Science | Software Engineer

[LinkedIn](https://www.linkedin.com/in/mantra-mehta/) | [GitHub](https://github.com/mantramehta)

---

Built to demonstrate full-stack development with React, TypeScript, Express, MongoDB, authentication, REST APIs, and cloud deployment.
