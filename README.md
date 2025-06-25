# TicketZone

TicketZone is a simple event ticketing project built with **Next.js 15**, **TypeScript** and **MongoDB**. It provides basic authentication and pages to browse events or view your tickets.

## Features

- Registration and login using JWT sessions stored in cookies.
- API routes under `app/api/auth` for registering, logging in and logging out users.
- MongoDB database accessed through Mongoose models.
- Example pages for events, user tickets and a responsive home page.
- Tailwind CSS styles loaded from the CDN.

## Requirements

- Node.js 20 or later
- Access to a MongoDB database

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env.local` file in the project root with the following variables:
   ```bash
   MONGODB_URI=<your MongoDB connection string>
   JWT_SECRET=<random secret for JWT>
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   Then open `http://localhost:3000` in your browser.

## Project Structure

- `app/` – Next.js application source code
- `app/api/auth/` – authentication API routes
- `app/lib/` – helpers for database connection and JWT
- `models/` – Mongoose models
- `antpages/` – legacy examples of older pages

This project is provided for educational purposes.
