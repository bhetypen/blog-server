# 📌 REST API Documentation

This repository contains a **RESTful API** built with **Node.js, Express, and MongoDB**.  
It provides **authentication, post management, and a comment system** with fine-grained access control.

---

## 🚀 Core Features

### 🔐 Authentication
- User registration with email & password (securely hashed with bcrypt).
- User login with JWT token issuance.
- Retrieve current user details using JWT.

### 📝 Posts
- Create a post (authenticated users).
- Fetch all posts or a single post with full details.
- Posts include author information and comment counts.
- Update posts (only the post owner; admins cannot edit).
- Delete posts (owner or admin).

### 💬 Comments & Replies
- Add comments to posts (users only; admins cannot comment).
- Update and delete comments (owner only; admins can delete).
- Post authors can reply to comments.
- Post authors can update/delete their own replies.
- Admins can delete replies.

---

## 🔑 Authentication
Protected endpoints require a valid **JWT** passed in the `Authorization` header:

```
Authorization: Bearer <JWT_TOKEN>
```

---

## 📖 API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| **POST** | `/api/auth/register` | Register a new user | No |
| **POST** | `/api/auth/login` | Login and get JWT | No |
| **GET**  | `/api/auth/me` | Get current user details | Yes |
| **POST** | `/api/posts` | Create a new post | Yes |
| **GET**  | `/api/posts` | Get all posts | No |
| **GET**  | `/api/posts/:id` | Get a single post by ID | No |
| **PUT**  | `/api/posts/:id` | Update a post (owner only) | Yes |
| **DELETE** | `/api/posts/:id` | Delete a post (owner or admin) | Yes |
| **POST** | `/api/posts/:postId/comments` | Add a comment | Yes (user only) |
| **PUT** | `/api/posts/:postId/comments/:commentId` | Update a comment (owner only) | Yes |
| **DELETE** | `/api/posts/:postId/comments/:commentId` | Delete a comment (owner or admin) | Yes |
| **POST** | `/api/posts/:postId/comments/:commentId/replies` | Reply to a comment (post author only) | Yes |
| **PUT** | `/api/posts/:postId/comments/:commentId/replies/:replyId` | Update a reply (post author only) | Yes |
| **DELETE** | `/api/posts/:postId/comments/:commentId/replies/:replyId` | Delete a reply (post author or admin) | Yes |

---

## ⚠️ Error Handling
All errors are returned in JSON with descriptive messages and appropriate HTTP status codes.

**Example:**
```json
{ "error": "Unauthorized" }
```

---

## 🛠️ Tech Stack
- **Node.js**
- **Express.js**
- **MongoDB (Mongoose ODM)**
- **JWT (JSON Web Tokens)**
- **bcrypt (Password Hashing)**

---

## 📌 Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/your-repo.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set environment variables in `.env`:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/yourdbname
   JWT_SECRET=your_jwt_secret
   ```
4. Run the server:
   ```bash
   npm start
   ```

---

## 📬 Contribution
Feel free to fork this repo, open issues, and submit pull requests. Contributions are welcome!

