# 🎓 SmartEducationHub

SmartEducationHub is a comprehensive web platform for university students, offering centralized access to online tests, video lectures, study materials, previous year question papers, feedback, and career roadmaps. It includes both student and admin functionality with a secure login system.

---

## 🚀 Features 

- 👤 **User Authentication**
  - Secure login/signup for students
  - Admin login for managing platform content

- 📚 **Study Material**
  - Upload/download PDF resources
  - Organized by course/subject

- 🎥 **Video Lectures**
  - Access embedded video content (Java, DBMS, OS, CN, etc.)

- 📝 **Online Test Module**
  - Take quizzes and view results

- 🗺️ **Career Roadmaps**
  - Guidance paths for Data Scientist, AI Engineer, Developer, etc.

- 🗃️ **Previous Year Papers**
  - Download question papers by subject/semester

- 💬 **Feedback System**
  - Students can submit feedback for continuous improvement

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **File Upload**: Multer
- **Session Management**: express-session

---

## ⚙️ Setup Instructions

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/SmartEducationHub.git
   cd SmartEducationHub
Install Dependencies

bash
npm install
Configure MySQL Database

Create a database named loginDB

Import required tables: users, pdf_files, feedback

Update credentials in server.js

Run the Server

bash
node server.js
Visit in Browser

arduino
http://localhost:8001
📂 Project Structure
<pre> ```plaintext SmartEducationHub/ ├── server.js # Main backend logic (Node.js, Express) ├── index.html # Login page ├── signup.html # Signup page ├── mainpage.html # Student dashboard ├── admin.html # Admin dashboard ├── course.html # Course listings ├── roadmap.html # Career guidance ├── exam.html # Online test system ├── feedback.html # Feedback form ├── study_material.html # Material viewer & download ├── /css/ # Stylesheets ├── /js/ # Client-side JS └── /uploads/ # Uploaded PDFs (if saved locally) ``` </pre>
🙋‍♀️ Admin Credentials (Default)
Username: iam_admin
Password: admin
📌 Notes
All uploaded PDFs are stored in the MySQL database (pdf_files table).

Feedback is logged in the feedback table.

Basic validation and session protection are implemented.

📧 Contact
For queries or suggestions, feel free to connect on LinkedIn(https://www.linkedin.com/in/harshadamundwadkar-tech-student).


