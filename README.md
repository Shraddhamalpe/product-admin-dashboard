# Product Admin Dashboard

A responsive Product Admin Dashboard built as a frontend assignment using Next.js, React, Tailwind CSS, Axios, and the DummyJSON API.

## Features

* User login with authentication
* Protected product routes
* Logout functionality
* Product listing with:

  * Product image
  * Title
  * Category
  * Price
  * Rating
  * Stock
* Responsive desktop table and mobile card layout
* Pagination with page numbers, Previous/Next, and page-size selection
* Search with debounce
* Category filtering
* Sorting by title, price, and rating
* URL-based search, filter, sort, page, and page-size state
* Product details page
* Add product
* Edit product
* Delete product with confirmation
* Form validation
* Loading, empty, error, and retry states
* Shared Axios instance with authentication token handling
* Centralized API error handling
* Protection against stale search results
* Local persistence for product additions, edits, and deletions

## Tech Stack

* Next.js
* React
* TypeScript
* Tailwind CSS
* Axios
* DummyJSON API
* JavaScript/TypeScript
* Git & GitHub

## API

This project uses the DummyJSON API:

* Authentication: `/auth/login`
* Products: `/products`
* Product search: `/products/search`
* Categories: `/products/categories`
* Product details: `/products/:id`

## Demo Login

Use the following DummyJSON test credentials:

```text
Username: emilys
Password: emilyspass
```

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Shraddhamalpe/product-admin-dashboard.git
```

### 2. Open the project

```bash
cd product-admin-dashboard
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start the development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

The root page redirects to the login page.

## Project Structure

```text
src/
├── app/
│   ├── login/
│   │   └── page.tsx
│   ├── products/
│   │   ├── [id]/
│   │   │   ├── edit/
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── add/
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   └── ProtectedRoute.tsx
│
├── lib/
│   └── axios.ts
│
└── services/
    ├── authService.ts
    └── productService.ts
```

## Important Note About DummyJSON

DummyJSON is used as the backend API for this assignment.

Product add, edit, and delete operations are simulated by the API and are not permanently stored on the DummyJSON server. To provide a consistent user experience during the session, localStorage is used to persist local product changes.

## Price Display

The API product prices are provided in USD. The dashboard converts API prices to INR for display.

Locally created products use the entered INR price directly.

## Responsive Design

The dashboard is designed for both:

* Desktop screens using a table layout
* Mobile screens using product cards

## Error Handling

The application handles:

* Invalid login
* API errors
* Unauthorized requests
* Product not found
* Empty search results
* Empty category results
* Invalid URL parameters
* Loading states
* Retry actions

## Authentication

The login access token is stored in browser localStorage after successful authentication.

A shared Axios instance automatically attaches the token to API requests.

Protected routes redirect unauthenticated users to the login page.

## AI Usage

AI tools were used during development for assistance with:

* Debugging
* Code review
* Understanding Next.js and React concepts
* Improving error handling and edge-case handling
* Reviewing assignment requirements
* Documentation and README preparation

All application code was reviewed, tested, and integrated into the project manually.

## Author

Shraddha Malpe

MCA 2026 Pass-out
Pune, Maharashtra, India

GitHub: https://github.com/Shraddhamalpe

LinkedIn: https://linkedin.com/in/shraddha-malpe866878337
