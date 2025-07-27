# 💡 Stack_IT – A Full-Stack Q&A Web Application

**Stack_IT** is a developer-focused Q&A platform inspired by Stack Overflow. Users can ask questions, submit answers, upvote/downvote content, mark accepted answers, and build a reputation. It includes rich text support, profile customization, and secure authentication via JWT and Google OAuth.

---

## 🚀 Features

- 📝 Ask and answer technical questions using a rich text editor
- ✅ Accept one answer per question
- 👍 Voting system for questions and answers
- 🏷️ Tag-based question categorization
- 🔍 Keyword and tag-based search and filter
- 👤 User profiles with reputation and badge system
- 🔐 JWT and Google OAuth authentication
- 🖼️ Avatar upload via Cloudinary
- 🧠 Responsive and intuitive UI

---

## 🛠️ Tech Stack

| Layer      | Technology                     |
|------------|---------------------------------|
| Frontend   | React, Vite, Axios, CSS         |
| Backend    | Node.js, Express                |
| Database   | MongoDB (Atlas), Mongoose       |
| Auth       | JWT, Google OAuth               |
| Editor     | `react-draft-wysiwyg`           |
| File Upload| Cloudinary (for avatars)        |

---

### Prerequisites

- Node.js v18+
- MongoDB Atlas account
- Cloudinary account (for image uploads)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/stack_it.git
   cd stack_it

2. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install


  
3. **Install backend dependencies**
   ```bash
   cd ../backend
   npm install

  
4. **Start the backend server**
   ```bash
   cd backend
   npm run dev

5. **Start the frontend app**
   ```bash
   cd ../frontend
   npm run dev
