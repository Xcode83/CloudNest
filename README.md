# CloudNest S3 Browser
<img width="1920" height="924" alt="Screenshot From 2025-07-31 02-32-17" src="https://github.com/user-attachments/assets/fe1c4681-4c72-48de-a150-24547c6db9fc" />


<img width="1920" height="917" alt="Screenshot From 2025-07-31 02-32-03" src="https://github.com/user-attachments/assets/2271b66f-57fa-44e5-b878-ceedb51b3547" />

A modern, fast, and secure client-side S3 browser. This tool allows you to connect directly to your own AWS S3 bucket to manage your files and folders through a clean user interface, without your credentials ever touching a server.

---

## ✨ Features

*   **Secure Client-Side Connection:** Connect directly to AWS. Your credentials are held only in browser memory and are gone when you close the tab.
*   **File & Folder Management:**
    *   List files and navigate through folders.
    *   Upload files with a simple drag-and-drop or file picker.
    *   Download files directly from your bucket.
    *   Create new folders.
    *   Delete files and entire folders.
*   **Clean UI:** A modern and intuitive interface built with React.
*   **Breadcrumb Navigation:** Easily keep track of and navigate your folder path.

---

## 🚀 How to Run This Project Locally

To run this project on your own machine, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Xcode83/CloudNest.git
    ```

2.  **Navigate to the project directory:**
    ```bash
    cd CloudNest
    ```

3.  **Install the dependencies:**
    ```bash
    npm install
    ```

4.  **Start the development server:**
    ```bash
    npm run dev
    ```
    The application will be running at `http://localhost:5173`.

---

## 💻 Tech Stack

*   **Frontend:** [React](https://reactjs.org/)
*   **Build Tool:** [Vite](https://vitejs.dev/)
*   **AWS SDK:** [@aws-sdk/client-s3](https://www.npmjs.com/package/@aws-sdk/client-s3) for S3 interactions.
*   **Styling:** Plain CSS with a modern, dark theme.

---

## ⚠️ Security Notice

This is a **client-side only** tool.
*   Your AWS Access Keys are required to communicate with the AWS S3 API directly from your browser.
*   Your credentials are only stored in the application's memory for the duration of your session.
*   **They are never transmitted to, or stored on, any server other than AWS.**
*   Closing your browser tab or disconnecting will permanently erase the credentials from the application's memory.

---

## 📄 License

This project is licensed under the MIT License.
