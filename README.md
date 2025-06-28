# File Transfer & Archival Service

![Project Banner](https://placehold.co/1200x400/000000/FFFFFF/png?text=File%20Transfer%20%26%20Archival%20Service)

A full-stack application for uploading large files, sharing them via a link, and automatically archiving them to a permanent, low-cost storage solution (Telegram). This project uses a temporary storage buffer (Google Drive) for immediate availability and a robust background job system for long-term archival.

The frontend is built with **Next.js** and **Tailwind CSS**, and is optimized for deployment on **Vercel**. The backend is a **Node.js/Express** API designed for deployment on **Render**.

---

## Features

-   **Large File Uploads**: Stream-based uploads to handle large files efficiently without consuming excessive server memory.
-   **Multi-File Batch Uploads**: Upload multiple files at once to generate a single, shareable link for the entire batch.
-   **Shareable Links**: Every upload batch generates a unique, persistent link for easy sharing.
-   **Dual-Source Downloads**: Download links work seamlessly whether the file is in temporary storage (Google Drive) or has been moved to permanent storage (Telegram).
-   **Multi-File Download**: Users can view and download all files within a batch from a single download page.
-   **Automatic Archival**: A background "janitor" process periodically moves files from temporary storage to permanent storage, optimizing costs and ensuring long-term availability.
-   **User Authentication**: Secure JWT-based authentication for user registration, login, and viewing personal upload history.
-   **Responsive UI**: A clean, modern, and intuitive user interface built with Next.js, shadcn/ui, and Tailwind CSS.
-   **Production-Ready**: Configured for secure and scalable deployment on Vercel (frontend) and Render (backend).

---

## Tech Stack

**Frontend:**
-   **Framework**: Next.js (with App Router)
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS
-   **UI Components**: shadcn/ui
-   **State Management**: React Context API
-   **HTTP Client**: Axios

**Backend:**
-   **Framework**: Express.js
-   **Language**: JavaScript (Node.js)
-   **Database**: MongoDB (with Mongoose)
-   **Authentication**: JSON Web Tokens (JWT)
-   **Temporary Storage**: Google Drive API
-   **Permanent Storage**: Telegram Bot API

**Deployment:**
-   **Frontend**: Vercel
-   **Backend**: Render

---

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or later recommended)
-   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
-   A [MongoDB](https://www.mongodb.com/) account (a free Atlas cluster is perfect).
-   A [Google Cloud Platform](https://cloud.google.com/) project with the **Google Drive API** enabled.
-   A [Telegram Bot](https://core.telegram.org/bots#creating-a-new-bot) and its API token.

---

## Setup & Installation

### 1. Clone the Repository

```bash
git clone [https://github.com/your-username/your-repo-name.git](https://github.com/your-username/your-repo-name.git)
cd your-repo-name
````

### 2\. Backend Setup (`/server`)

a. **Navigate to the server directory:**

```bash
cd server
```

b. **Install dependencies:**

```bash
npm install
```

c. **Create an environment file:**
Create a `.env` file in the `/server` directory. You can copy `.env.example` if one exists, or create it from scratch. Fill in the following variables:

```env
# server/.env

# Server & CORS Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# MongoDB Connection
MONGO_URI="your_mongodb_connection_string"

# JWT Authentication
JWT_SECRET="your_super_secret_jwt_key"
JWT_EXPIRES_IN=30d

# Google Drive API
GDRIVE_FOLDER_ID="id_of_your_google_drive_folder"
GOOGLE_CREDENTIALS_PATH="src/config/service-account-key.json"

# Telegram Bot API
TELEGRAM_BOT_TOKEN="your_telegram_bot_token"
TELEGRAM_CHAT_ID="your_telegram_chat_id"
```

d. **Set up Google Service Account:**

  - In your Google Cloud project, create a new service account.
  - Ensure the **Google Drive API** is enabled for your project.
  - Generate a JSON key for the service account and save it as `service-account-key.json` inside the `/server/src/config/` directory.
  - **Important**: Open your Google Drive folder, click "Share", and add the `client_email` from the JSON key file as a member with **"Editor"** permissions.

e. **Get Telegram Chat ID:**

  - Create a new private channel or group on Telegram and add your bot to it.
  - Send a test message to the channel/group.
  - Access the following URL in your browser, replacing `<YOUR_BOT_TOKEN>` with your bot's token:
    `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
  - Look for the `chat` object in the JSON response and copy the `id`. It is typically a negative number for groups and channels.

### 3\. Frontend Setup (`/client`)

a. **Navigate to the client directory from the project root:**

```bash
cd ../client
```

b. **Install dependencies:**

```bash
npm install
```

c. **Create an environment file:**
Create a `.env.local` file in the `/client` directory and add the following variable:

```env
# client/.env.local
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

-----

## Running the Application

You need to run both the backend and frontend servers simultaneously in separate terminal windows.

**1. Run the Backend Server:**

  - In the `/server` directory:

<!-- end list -->

```bash
npm run dev
```

The API will be available at `http://localhost:5000`.

**2. Run the Frontend Server:**

  - In the `/client` directory:

<!-- end list -->

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

Open your browser and navigate to `http://localhost:3000` to see the application in action.

```
```