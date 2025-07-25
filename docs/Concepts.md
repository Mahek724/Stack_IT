# 📘 Stack_IT – Key Project Concepts

This document outlines the core concepts integral to the Stack_IT project, organized by Object, Context, and Relevant Information.

---

### 🔹 1. User

- **Object**: User  
- **Context**: Used for authentication, profile management, and activity tracking  
- **Important Information**:
  - `username`, `email`, `passwordHash`
  - `avatar`, `reputation`, `joinedDate`
  - Linked with questions and answers via User ID
  - Supports manual login and Google OAuth

---

### 🔹 2. Question

- **Object**: Question  
- **Context**: Core content posted by users to seek answers  
- **Important Information**:
  - `title`, `description` (rich HTML)
  - `tags`, `upvotes`, `downvotes`, `views`
  - `createdAt`, `askedBy` (User)
  - Linked with answers and comments

---

### 🔹 3. Answer

- **Object**: Answer  
- **Context**: Provided by users to respond to questions  
- **Important Information**:
  - `answerText` (rich HTML), `createdAt`
  - `answeredBy`, `upvotes`, `downvotes`
  - `isAccepted` (boolean)
  - Linked to the associated question and user

---

### 🔹 4. Tags

- **Object**: Tag  
- **Context**: Categorizes questions by topic  
- **Important Information**:
  - Each question can have multiple tags
  - Tags help in filtering, searching, and organizing content

---

### 🔹 5. Votes

- **Object**: Vote  
- **Context**: Track reputation and community feedback  
- **Important Information**:
  - +1 for upvote, -1 for downvote
  - +10 for accepted answer
  - Reputation is computed from cumulative votes

---

### 🔹 6. Authentication

- **Object**: Auth System  
- **Context**: Manages login, signup, and secure access  
- **Important Information**:
  - Manual signup (email/password)
  - Google OAuth login
  - JWT-based session handling
  - "Remember Me", forgot password, and secure cookie support

---

### 🔹 7. Rich Text Editor

- **Object**: Editor (`react-draft-wysiwyg`)  
- **Context**: Used for submitting questions and answers  
- **Important Information**:
  - Supports text formatting, code blocks, and images
  - Converts editor state to HTML using `draftToHtml`

---

### 🔹 8. Accepted Answer

- **Object**: Answer Status  
- **Context**: Indicates the answer accepted by the question author  
- **Important Information**:
  - Marked with a green check icon
  - Grants +10 reputation to the answerer
  - Only one accepted answer per question

---

### 🔹 9. Search and Filter

- **Object**: Search System  
- **Context**: Allows users to discover questions efficiently  
- **Important Information**:
  - Supports keyword search (partial matches)
  - Tag-based filtering
  - Sorts results by date or relevance

---

### 🔹 10. Profile Page

- **Object**: User Profile  
- **Context**: Displays user-specific activity and details  
- **Important Information**:
  - Shows posted questions and answers
  - Avatar upload and profile editing (username/email)
  - Displays reputation badge (Beginner / Contributor / Expert)

---

### 🔹 11. MongoDB Data Model

- **Object**: NoSQL Schema  
- **Context**: Manages backend data structure  
- **Important Information**:
  - Mongoose models: User, Question, Answer
  - Indexed fields for faster search
  - Reference IDs to link documents

---

### 🔹 12. Security

- **Object**: Secure Access  
- **Context**: Protects APIs and sensitive data  
- **Important Information**:
  - JWT token-based route protection
  - Passwords hashed with Bcrypt
  - Middleware ensures authenticated access

---

### 🔹 13. Tech Stack

- **Frontend**: React, Vite, Axios, CSS  
- **Backend**: Node.js, Express  
- **Database**: MongoDB (Atlas)  
- **Authentication**: JWT + Google OAuth  
- **Editor**: `react-draft-wysiwyg`  
- **Storage**: Cloudinary (for avatar uploads)
