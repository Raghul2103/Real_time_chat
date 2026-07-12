# AetherChat - Production-Ready MERN Real-Time Chat Application

AetherChat is a premium, real-time messaging application designed with a MERN stack backend and a modern glassmorphic Vite/React frontend. It provides secure HTTP-only cookie-based authentication, private & global message streams, real-time presence indicators, dynamic typing statuses, and responsive mobile drawers.

---

## Submission Details

- **GitHub Repository**: [Insert GitHub Link Here]
- **Screen Recording (Google Drive)**: [Insert Google Drive Recording Link Here]

---

## Folder Structure

```text
Real_time_Chat_app/
├── backend/
│   ├── src/
│   │   ├── config/          # Database connection
│   │   ├── controllers/     # MVC controller logic
│   │   ├── middleware/      # JWT auth guard, Express error filters
│   │   ├── models/          # User and Message Mongoose schemas
│   │   ├── routes/          # Express API route bindings
│   │   ├── sockets/         # Socket.io connection & event hooks
│   │   ├── app.js           # Express app configuring security & middlewares
│   │   └── server.js        # Main entry bootstrap
│   ├── .env.example
│   ├── .env
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── chat/        # Sidebar, ChatArea, ChatBubble, TypingIndicator
│   │   │   ├── common/      # Shared utilities (Skeletons, buttons)
│   │   │   └── layout/      # Layout containers
│   │   ├── context/         # AuthContext & ChatContext state hooks
│   │   ├── hooks/           # Utility hooks
│   │   ├── pages/           # ChatPage, LoginPage, RegisterPage views
│   │   ├── routes/          # AppRoutes guard config
│   │   ├── services/        # customFetch (axios) & socket client setup
│   │   ├── utils/           # formatTime calculations
│   │   ├── App.jsx          # Providers & routing tree entry
│   │   ├── index.css        # Tailwind directives and custom animation rules
│   │   └── main.jsx         # React DOM anchor
│   ├── .env.example
│   ├── .env
│   ├── index.html
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.js
│   └── package.json
└── README.md                # This file
```

---

## Features

### Real-Time Communications
- **Socket.io Core**: Dual-channel websocket engine linking client inputs with instant broadcasts.
- **Global Lounge**: Shared room environment where every connected user can exchange messages.
- **Direct Private Messaging**: Secure peer-to-peer chat logs mapping directly to target database indexes.
- **Live Online Sync**: Automated connection hooks updating user lists in real-time as tabs are opened or closed.
- **Typing Waves**: Interactive bounces showing who is currently typing in the selected room.
- **Status Receipts**: Real-time indicators representing if a message was Sent, Delivered, or Read.

### Security Implementation
- **HTTP-only Cookie Auth**: JWT tokens are securely stored in client-browser cookies, preventing access by client-side scripts to mitigate XSS risks.
- **SameSite and Secure Headers**: Protects session cookie handshakes against CSRF.
- **Helmet Middleware**: Configures HTTP headers to protect against common web vulnerabilities.
- **Mongo Sanitization**: Neutralizes MongoDB queries injected via inputs to prevent NoSQL attacks.
- **Rate Limiting**: Restricts brute-force API requests to 200 checks per 15 minutes window.

### User Interface & Experience
- **Premium Aesthetics**: Curated color palette featuring dark indigo glassmorphism layers and smooth animations.
- **Mobile Responsive**: Adaptive screen layouts with sliding panels for smooth use on smaller viewports.
- **Session Restoration**: Automatic cookie validation checks logging users straight into chat if the session is still active.

---

## Environment Variables

### Backend (`backend/.env`)
Create a `.env` file under the `/backend` directory:
```ini
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/chat-app
JWT_SECRET=chat_app_jwt_secret_dev_key_123456789
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### Frontend (`frontend/.env`)
Create a `.env` file under the `/frontend` directory:
```ini
VITE_API_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
```

---

## Installation & Running

Ensure you have [Node.js](https://nodejs.org) and [MongoDB](https://www.mongodb.com) installed.

### 1. Database Start
Start your local MongoDB service:
- **Windows**: `net start MongoDB` or run `mongod` in command prompt.

### 2. Backend Installation & Run
Navigate to `backend` directory, install packages, and start:
```bash
cd backend
npm install
npm run dev
```
The server will boot on `http://localhost:5000`.

### 3. Frontend Installation & Run
Navigate to `frontend` directory, install packages, and start:
```bash
cd ../frontend
npm install
npm run dev
```
Vite will host the application dashboard on `http://localhost:5173`.

---

## REST API Documentation

All routes prefix with `/api/v1`.

### 1. Authentication Routes (`/auth`)
- **POST `/auth/register`**: Registers a new user. Stores JWT token in HTTP-only cookie.
  - Body: `{ "name": "John Doe", "email": "john@example.com", "password": "securepassword" }`
- **POST `/auth/login`**: Authenticates user credentials. Returns HTTP-only cookie.
  - Body: `{ "email": "john@example.com", "password": "securepassword" }`
- **POST `/auth/logout`**: Expires cookies, signing the user out.
- **GET `/auth/me`**: Returns details of the currently authenticated user session. Requires cookie.

### 2. Contacts Routes (`/users`)
- **GET `/users`**: Lists all registered users (except current logged-in user). Protected.
- **GET `/users/online`**: Lists all currently active users. Protected.

### 3. Messaging Routes (`/messages`)
- **GET `/messages/global`**: Retrieves chronological Global Chat history. Protected.
- **POST `/messages/global`**: Sends a global message via REST. Protected.
- **GET `/messages/private/:userId`**: Retrieves private chat logs with user matching `:userId`. Protected.
- **POST `/messages/private`**: Sends a private message via REST. Protected.
  - Body: `{ "receiverId": "target_user_id", "message": "Hello!" }`

---

## Socket Event Map

### Client Handshake
- **Handshake Connection**: Sends cookies. Decoded by socket auth middleware.
- **`join-global`**: Emitted by client to join the public space socket room.
- **`join-private`**: Emitted by client to join a private room with a peer.
  - Payload: `{ "receiverId": "recipient_user_id" }`
- **`send-global-message`**: Client transmits a new public message.
  - Payload: `{ "message": "Global announcement" }`
- **`send-private-message`**: Client transmits a peer-to-peer message.
  - Payload: `{ "receiverId": "recipient_user_id", "message": "Direct message text" }`
- **`typing-start`**: Client starts typing.
  - Payload: `{ "isGlobal": true/false, "receiverId": "recipient_id_if_private" }`
- **`typing-stop`**: Client stops typing.
  - Payload: `{ "isGlobal": true/false, "receiverId": "recipient_id_if_private" }`
- **`mark-as-read`**: Client opens a private room, marking all received messages from that user as read.
  - Payload: `{ "senderId": "user_who_sent_the_messages" }`

### Server Broadcasts
- **`online-users`**: Broadcasts list of all connected user objects.
- **`user-online`**: Broadcasts single user's online appearance details.
- **`user-offline`**: Broadcasts single user's disconnection status.
- **`global-message`**: Broadcasts new global message object.
- **`private-message`**: Emits private message details to sender and receiver sockets.
- **`typing`**: Broadcasts typing states.
  - Payload: `{ "senderId": "typing_user_id", "isTyping": true/false, "isGlobal": true/false }`
- **`delivered`**: Emits notification to message sender that recipient socket received the payload.
- **`read`**: Emits receipt that recipient opened the peer conversation.

---

## Design Decisions & Assumptions

1. **Mongoose Models**: Added hooks to handle passwords securely using `bcryptjs` hashing. Implemented auto-generating avatars using dynamic color blocks and initials via `ui-avatars.com`.
2. **Websockets Auth**: Integrated standard cookies checking into Socket.io connection handshake. If the HTTP-only cookie validation fails, websocket initialization rejects, preventing unauthenticated clients from connecting to the server socket.
3. **Database Portability**: Connection fallbacks route to a local database (`mongodb://127.0.0.1:27017/chat-app`), with options to configure remote MongoDB Atlas clusters by editing the backend `.env`.

---

## Deployment Steps

### Frontend (Vercel)
1. Install Vercel CLI or import the frontend subfolder directly into Vercel Dashboard.
2. Select target root directory as `frontend`.
3. Set Build command: `npm run build`, Output Directory: `dist`.
4. Add Environmental Variable:
   - `VITE_API_URL` (Pointing to production API url)
   - `VITE_SOCKET_URL` (Pointing to production Socket server url)

### Backend (Render)
1. Create a Web Service on Render, referencing the project repository.
2. Set root directory to `backend`.
3. Select Environment as `Node`.
4. Set Build command: `npm install`, Start command: `npm start`.
5. Add backend Environment variables:
   - `MONGO_URI` (Atlas cluster URL string)
   - `JWT_SECRET` (A strong random secret string)
   - `CLIENT_URL` (Pointing to your deployed Vercel URL)
   - `NODE_ENV` (`production`)
