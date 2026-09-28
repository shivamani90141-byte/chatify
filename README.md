# 💬 Chatify — Real-Time MERN Chat Application

Chatify is a full-stack real-time messaging application built using the MERN stack. The main goal of this project was to build a practical messaging platform from scratch while learning how authentication, REST APIs, WebSockets, database design, cloud services, security, and deployment work together in a production-style application.

The application allows users to create an account, securely log in, view other users, start conversations, exchange messages in real time, share images, and see online/offline user status.

The project is deployed and can be accessed online.

---

## 🚀 Live Demo

📦 **GitHub Repository:**  
https://github.com/shivamani90141-byte/chatify

---

## 📸 About the Project

Chatify was built as a complete full-stack application rather than just a frontend UI.

The frontend communicates with the backend through REST APIs for operations such as authentication, retrieving users, retrieving conversations, and sending messages.

For real-time communication, the application uses **Socket.IO**. When a user sends a message, the message is stored in MongoDB and then delivered to the receiver through a WebSocket connection without requiring the receiver to refresh the page.

The application also uses cloud services for additional functionality:

- MongoDB Atlas for database storage
- Cloudinary for image uploads
- Resend for transactional/welcome emails
- Arcjet for security and rate limiting
- Sevalla for production deployment

---

# ✨ Features

## 🔐 Authentication

- User registration
- User login
- User logout
- JWT-based authentication
- HTTP-only authentication cookies
- Protected backend routes
- Authentication state checking
- Password hashing using bcrypt
- Basic email validation
- Password length validation

---

## 👤 User Management

- Display authenticated user's profile
- Display other registered users
- Exclude the currently logged-in user from the contacts list
- Profile picture support
- Online/offline user status
- User logout functionality

---

## 💬 Real-Time Messaging

- One-to-one conversations
- Send text messages
- Receive messages in real time
- Messages are stored in MongoDB
- Messages are loaded when opening a conversation
- New messages appear without refreshing the page
- Automatic message scrolling
- Optimistic UI for sent messages
- Chat history persistence

---

## 🖼️ Image Messaging

Users can also send images inside conversations.

The image is uploaded to **Cloudinary**, and the resulting secure URL is stored with the message in MongoDB.

This keeps the application from storing large image files directly inside the database.

---

## 🟢 Online / Offline Status

Chatify uses Socket.IO to track connected users.

When a user connects:

1. The user's socket connection is established.
2. Their user ID is associated with the socket ID.
3. Connected users are tracked by the backend.
4. The frontend receives the current online users.
5. The UI displays the user's online/offline status.

When the user disconnects, their socket connection is removed from the online-user tracking system.

---

## 🔔 Real-Time Message Delivery

When a message is sent:

```text
User A
   │
   │ Send message
   ▼
Frontend
   │
   │ HTTP POST
   ▼
Express Backend
   │
   ├── Validate request
   ├── Save message to MongoDB
   │
   ▼
Socket.IO
   │
   │ Emit "newMessage"
   ▼
User B
