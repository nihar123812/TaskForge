# ⚡ TaskForge — Team Task Manager

> A premium, full-stack web application for team project management with role-based access control, real-time task tracking, and a stunning glassmorphism UI.

![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Railway](https://img.shields.io/badge/Railway-Deployed-0B0D0E?style=for-the-badge&logo=railway&logoColor=white)

---

## 🌐 Live Demo

🔗 **[TaskForge Live](https://taskforge-production-aa25.up.railway.app/dashboard.html)** _(Update with your Railway URL after deployment)_

---

## 🚀 Features

### 🔐 Authentication
- **JWT-based** signup & login with secure bcrypt password hashing
- **Role selection** during registration (Admin / Member)
- Persistent sessions with token-based auth
- Auto-generated avatar initials

### 📁 Project Management
- **Create, edit, delete** projects (Admin only)
- Custom project **colors** for visual identification
- **Team member management** — add/remove members
- Real-time **progress tracking** with task counts

### ✅ Task Tracking
- **Kanban board** with 4 columns: To Do → In Progress → Review → Done
- **Task assignment** to team members
- **Priority levels**: Low, Medium, High, Urgent
- **Due date tracking** with overdue alerts
- **Filters**: by project, status, priority, and search

### 📊 Dashboard
- At-a-glance **stat cards** (projects, tasks, in-progress, completed, overdue)
- **Overdue tasks** panel with urgency indicators
- **Due soon** alerts (next 3 days)
- **Project progress bars** with completion percentages
- **Recent tasks** table

### 🛡️ Role-Based Access Control (RBAC)

| Action | Admin | Member |
|--------|:-----:|:------:|
| Create project | ✅ | ❌ |
| Edit/delete project | ✅ | ❌ |
| Add/remove team members | ✅ | ❌ |
| Create/delete tasks | ✅ | ❌ |
| Assign tasks | ✅ | ❌ |
| Update own task status | ✅ | ✅ |
| View dashboard | ✅ | ✅ |

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| **Backend** | Node.js + Express.js |
| **Database** | MongoDB Atlas (Mongoose ODM) |
| **Authentication** | JWT + bcryptjs |
| **Validation** | express-validator |
| **Frontend** | Vanilla HTML/CSS/JavaScript |
| **UI Design** | Glassmorphism + Dark Theme |
| **Deployment** | Railway |

---

## 📂 Project Structure

```
TaskForge/
├── server.js                 # Express entry point
├── package.json
├── .env.example              # Environment variable template
│
├── config/
│   └── db.js                 # MongoDB connection
│
├── models/
│   ├── User.js               # User schema (name, email, password, role)
│   ├── Project.js            # Project schema (name, owner, members)
│   └── Task.js               # Task schema (title, status, priority, dueDate)
│
├── middleware/
│   ├── auth.js               # JWT verification middleware
│   └── roleCheck.js          # Role-based access guard
│
├── controllers/
│   ├── authController.js     # Signup, login, profile
│   ├── projectController.js  # Project CRUD + member management
│   ├── taskController.js     # Task CRUD with role checks
│   └── dashboardController.js # Aggregated stats
│
├── routes/
│   ├── auth.js
│   ├── projects.js
│   ├── tasks.js
│   └── dashboard.js
│
└── public/                   # Frontend (served by Express)
    ├── index.html            # Auth page (Login/Signup)
    ├── dashboard.html        # Dashboard
    ├── projects.html         # Project management
    ├── tasks.html            # Task Kanban board
    ├── css/style.css         # Glassmorphism design system
    └── js/
        ├── api.js            # Shared API client
        ├── auth.js           # Auth logic
        ├── dashboard.js      # Dashboard rendering
        ├── projects.js       # Project CRUD
        └── tasks.js          # Task management
```

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/api/auth/signup` | Public | Create account |
| `POST` | `/api/auth/login` | Public | Login & get JWT |
| `GET` | `/api/auth/me` | Auth | Get profile |
| `GET` | `/api/auth/users` | Auth | List all users |

### Projects
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/projects` | Auth | List projects |
| `POST` | `/api/projects` | Admin | Create project |
| `GET` | `/api/projects/:id` | Auth | Project detail |
| `PUT` | `/api/projects/:id` | Admin | Update project |
| `DELETE` | `/api/projects/:id` | Admin | Delete project |
| `POST` | `/api/projects/:id/members` | Admin | Add member |
| `DELETE` | `/api/projects/:id/members/:userId` | Admin | Remove member |

### Tasks
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/tasks` | Auth | List tasks (with filters) |
| `POST` | `/api/tasks` | Admin | Create task |
| `PUT` | `/api/tasks/:id` | Auth | Update task |
| `DELETE` | `/api/tasks/:id` | Admin | Delete task |

### Dashboard
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/dashboard/stats` | Auth | Get all stats |

---

## ⚙️ Local Setup

### Prerequisites
- **Node.js** v18+
- **MongoDB Atlas** free cluster ([Create one here](https://www.mongodb.com/atlas))

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/TaskForge.git
   cd TaskForge
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your values:
   ```env
   MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/taskforge
   JWT_SECRET=your_strong_random_secret_key
   PORT=3000
   NODE_ENV=development
   ```

4. **Start the server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

---

## 🚀 Railway Deployment

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit: TaskForge - Team Task Manager"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/TaskForge.git
git push -u origin main
```

### Step 2: Deploy on Railway
1. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**
2. Select your **TaskForge** repository
3. Add **Environment Variables** in Railway dashboard:
   - `MONGODB_URI` — Your MongoDB Atlas connection string
   - `JWT_SECRET` — A strong random secret
   - `NODE_ENV` — `production`
4. Railway auto-detects Node.js and runs `npm start`
5. Click **Generate Domain** to get your live URL

### Step 3: MongoDB Atlas Network Access
- In MongoDB Atlas → **Network Access** → **Add IP Address** → `0.0.0.0/0` (allow from anywhere)
- This is required for Railway to connect to your database

---

## 🧪 Testing the App

### Quick Start Flow:
1. **Sign up** as **Admin** → creates your account
2. **Create a project** → give it a name and color
3. **Sign up another user** as **Member** in a new browser/incognito
4. **Add the member** to your project (from Projects → 👥 button)
5. **Create tasks** → assign to the member, set priorities and due dates
6. **Switch to member account** → update task statuses
7. **Check dashboard** → see stats, progress, and overdue alerts

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

## 👨‍💻 Author

Built with ❤️ using Node.js, Express, MongoDB, and vanilla JavaScript.

---

<p align="center">
  <strong>⚡ TaskForge — Team Task Management, Supercharged ⚡</strong>
</p>
