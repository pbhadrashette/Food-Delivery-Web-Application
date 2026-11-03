# Foodie Delivery

A full-stack food-delivery platform with a customer storefront and an access-controlled admin dashboard. The React client communicates only with the Express REST API; MongoDB is accessed through Mongoose on the server.

## Included functionality

- Customer registration, JWT login persistence, profiles, addresses, favourites, cart, coupons, checkout, order history, tracking, cancellation and delivered-order reviews.
- Restaurant discovery, food and cuisine search, filters, menu sections, vegetarian filtering, and single-restaurant cart enforcement.
- Admin-only management for restaurants, food items, categories, coupons, customers, reviews, order status, live dashboard statistics and analytics.
- Password hashing, protected API routes, admin authorization, rate limiting, CORS, upload-ready local media storage, server-side pricing and coupon validation.

## Run locally

1. Start MongoDB locally (or create a MongoDB Atlas database).
2. Copy `backend/.env.example` to `backend/.env` and set `MONGO_URI`, a strong `JWT_SECRET`, and a unique `ADMIN_EMAIL` and `ADMIN_PASSWORD`. The configured admin credentials are applied during seeding: an existing admin account is reset to the configured password, a missing account is created, and an existing non-admin account is never promoted.
3. In one terminal, run:

   ```powershell
   cd backend
   npm install
   npm run seed
   npm run dev
   ```

4. In a second terminal, run:

   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

Open `http://localhost:3000`. The server creates or resets the administrator using `ADMIN_EMAIL` and `ADMIN_PASSWORD` when configured and disables the old demo admin credentials if they are still present. To reset an admin password, update `ADMIN_PASSWORD` in `backend/.env` and run `npm run seed` from `backend` (or restart the backend). Seeding no longer deletes existing database collections. The sample customer account is `user@foodie.com` / `user1234`. Admin credentials are not assigned a default; keep them private and use a unique strong password.

## Deployment

- Deploy `frontend` to Vercel and set `VITE_API_URL` to the hosted API URL ending in `/api`.
- Deploy `backend` to Render, set the environment variables shown in `backend/.env.example`, and allow the Vercel origin through `CLIENT_URL`.
- Use MongoDB Atlas for production data. Payment data is intentionally not stored; the order model is ready for a gateway provider reference such as Razorpay's payment ID.
