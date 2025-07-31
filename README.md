# CloudNest - Secure Client-Side S3 Browser

> A fast, modern, and secure UI to browse and manage your AWS S3 buckets directly from your browser.

<img width="1920" height="924" alt="Screenshot From 2025-07-31 02-32-17" src="https://github.com/user-attachments/assets/e50f6bd1-8ada-4144-8c9d-d7c4e493908a" />
---

<img width="1920" height="917" alt="Screenshot From 2025-07-31 02-32-03" src="https://github.com/user-attachments/assets/9b3f3205-133b-4808-a00b-36672e338cba" />

---

## ✨ Key Features

*   🔐 **Secure Connection:** Credentials stay in your browser's memory and vanish when you close the tab.
*   🗂️ **Full File & Folder Navigation:** Browse with an intuitive UI and breadcrumbs.
*   ⬆️ **Simple Uploads & Downloads:** Upload files and download using secure presigned URLs.
*   ➕ **Create & Delete:** Organize your bucket with full folder and file management.

## 🛠️ Tech Stack

**Frontend:** `React` `Vite` `AWS SDK for JS v3` `CSS`

## 🛡️ How it's Secure

This app is built with a security-first mindset:
*   **No Backend Server:** It runs 100% in your browser. Your keys are never sent to a third-party server.
*   **In-Memory Storage Only:** Credentials are deleted the moment you close the browser tab.
*   **Direct Communication:** Uses the AWS SDK to talk directly and securely to AWS endpoints.

---

### Local Project Setup

Follow these steps to get the application running on your local machine.

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/Xcode83/CloudNest.git
    ```

2.  **Navigate into the project directory:**
    ```sh
    cd CloudNest
    ```

3.  **Install the necessary dependencies:**
    ```sh
    npm install
    ```

4.  **Start the local development server:**
    ```sh
    npm run dev
    ```

Now, open your browser and navigate to `http://localhost:5173`.
##

### AWS Setup (Required)

Before running, you need an S3 bucket with the correct **CORS configuration**.

1.  In the AWS S3 Console, go to your bucket's **Permissions** tab.
2.  Scroll to **Cross-origin resource sharing (CORS)** and click **Edit**.
3.  Paste in the following JSON:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": ["http://localhost:5173"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
