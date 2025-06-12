# Casino V2

Casino V2 is a web-based casino application built with SvelteKit. It features various games, user authentication, and a responsive design.

## Features

- **Games**: Includes Mines, Blackjack, Plinko, and more.
- **Authentication**: Login, registration using credentials, google and github, secure sessions.
- **Wallet**: Create wallet, deposit funds.
  
## Installation
(Note that the app will not work fully as the database is external - logging in won't work without it. Also for authJs to work you need to generate an auth secret, and for providers to work a respective auth ID and auth Secret are needed)

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
- Works with database

### Blackjack

- Play against the dealer.
- Try to get as close to 21 as possible without going over.
- Currently no betting, just recreational games.

### Plinko

- Drop balls and win based on where they land.

### Chance
- Set a slider and bet money whether a random number is going to be lower or higher.
- Works with database

### Roulette

- Currently no betting, just seeing the wheel spin and having fun.

### Slots

- Not implemented

## description

### login features
Supports login with credentials, and also with google and github. When an account with credentials is created, the user can later log into the same account using other providers, as long as the email address is the same. Users can also log into the same account with github and google, given same email address. Or you can just use providers, completely skipping old-school login and password. Every login creates a session, that is stored in cookies and in a database. Conveniently authJs barely supports credentials, so everything had to be implemented manually. Users without a session cannot access any games and will be redirected to log in. Every action like sending a request to a database needs an active session.

### games
Currently chance and mines work 100%, the rest of the games are either not connected to the database or just unfinished.
In blackjack splitting is available and the user plays each hand at a time. 


### other features
By clicking your balance you access the wallet, where you can add balance (unfortunately it is not real money - that would be illegal) so you can play more games. There are also some safety features if the user didn't automatically connect with his wallet, then he can create one by simply pressing a button (should never happen).
There are also a few subpages just to look nice, they don't do much.
