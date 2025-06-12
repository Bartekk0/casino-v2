# Casino V2

Casino V2 is a web-based casino application built with SvelteKit. It features various games, user authentication, and a responsive design.

## Features

- **Games**: Includes Mines, Blackjack, Plinko, and more.
- **Authentication**: Login, registration, and secure user sessions.
- **Wallet**: Manage balance, deposit, and withdraw funds.
- **Responsive Design**: Optimized for desktop and mobile devices.

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/casino-v2.git
   cd casino-v2
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Development

Start the development server:

```bash
npm run dev
```

Open the app in your browser at [http://localhost:5173](http://localhost:5173).

## Building for Production

To create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Folder Structure

- **src/routes**: Contains all the pages and API endpoints.
- **src/lib**: Shared libraries and utilities.
- **src/static**: Static assets like images and icons.
- **src/utils**: Helper functions for database, authentication, and more.

## Games

### Mines

- Click tiles to reveal multipliers.
- Avoid bombs to keep playing.

### Blackjack

- Play against the dealer.
- Try to get as close to 21 as possible without going over.

### Plinko

- Drop balls and win based on where they land.