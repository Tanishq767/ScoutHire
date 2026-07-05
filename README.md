### ScoutHire

ScoutHire is a campus recruitment website that provides a common platform for recruiters, students, and colleges to streamline the recruitment process. It enables recruiters to create hiring drives, allows students to apply for them, intelligently identifies eligible candidates, rank candidates using customizable evaluation metrics, and allows fast and automated communication throughout the hiring process.

### Features

### Recruiter
  Recruiter Registration
  Email Verification
  Secure JWT Login
  Recruiter Dashboard
  Create Recruitment Drives
  View Recruitment Drives
  View Drive Details

### Student
  Student Database
  CSV Upload Support
  Student Search
  Student Filtering

### Recruitment
  Automatic Eligible Student Detection
  Candidate Ranking using Weighted Metrics
  Custom Ranking Weights
  Top-N Candidate Selection (Upcoming)
  OA/Interview Shortlisting (Upcoming)


 ## Tech Stack

-Frontend
  HTML
  CSS
  JavaScript

-Backend
  Node.js
  Express.js

-Database
  MongoDB
  Mongoose

-Authentication
  JWT
  bcrypt

-Email
  Nodemailer

-Other utilities
 Multer
 CSV Parser


### Structure

-backend
  controllers
  middlewares
  models
  routes
  utils
-frontend
  css
  js
  html
-app.js

### WorkFlow
Recruiter
↓
Register
↓
Verify Email
↓
Login
↓
Create Recruitment Drive
↓
Open Drive
↓
Find Eligible students
↓
Rank Students
↓
Shortlist
↓
Send Interview Emails

### Future Enhancements

- Student Login
- Student Application Portal
- OA Invitation System
- Interview Scheduling
- Resume Parsing
- AI based Candidate role assigning
- Analytics Dashboard
