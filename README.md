# ScoutHire

ScoutHire is a campus recruitment platform that brings colleges, students, and recruiters into one workflow. It replaces scattered placement emails, spreadsheets, and form links with a single place to publish drives, track applications, screen candidates, and communicate outcomes.

The project was inspired by the friction students and placement teams often face during campus recruitment: it can be difficult to know which companies are visiting, whether you are eligible, which drives you have applied to, and what happens next.

## What ScoutHire does

ScoutHire supports three kinds of users:

- **Colleges** upload and manage student data, establish company partnerships, and approve drives before students can see them.
- **Students** activate their college-created account, discover eligible approved drives, apply, upload a resume, and receive OA/interview communication.
- **Recruiters** create a company profile, partner with colleges, create recruitment drives, review applicants, rank and shortlist candidates, import OA results, and invite candidates for interviews.

## End-to-end workflow

1. A college and company establish a partnership using a shared verification code.
2. A college uploads student records through CSV; students then activate their existing records using their USN and registered email address.
3. A recruiter creates a drive for one or more partner colleges.
4. Each target college approves the drive. Only then can its students discover it.
5. Students see only drives for which they meet the CGPA, branch, skill, deadline, and approval requirements.
6. Recruiters review eligible applicants, apply configurable ranking weights, and select candidates for an online assessment.
7. OA invitations are sent by email. Results can be imported as a validated CSV file.
8. Recruiters select interview candidates, save interview details, and send personalised interview invitations.

## Key features

- Role-based accounts for colleges, students, and recruiters
- JWT-based protected routes and bcrypt password hashing
- Student and recruiter email verification
- College-company partnership verification
- Drive-level approval for each targeted college
- Eligibility filtering by CGPA, branch, required skills, drive status, and deadline
- Candidate ranking using weighted, normalized CGPA, coding-platform rating, projects, and internships
- CSV bulk upload for students and OA results
- OA and interview email notifications with Nodemailer
- PDF resume upload with optional Cloudinary storage
- Account deletion flows that clean up related records

## Tech stack

| Layer | Technologies |
| --- | --- |
| Frontend | HTML, CSS, Vanilla JavaScript |
| Backend | Node.js, Express |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcrypt |
| File handling | Multer, csv-parser, Cloudinary |
| Email | Nodemailer |
| Validation | Joi |

## Project structure

```text
.
├── config/          # Application configuration
├── controllers/     # API and business logic
├── frontend/        # Static HTML, CSS, and JavaScript client
├── middlewares/     # Authentication and upload middleware
├── models/          # Mongoose schemas
├── routes/          # Express routes
├── utils/           # Mail and Cloudinary helpers
├── uploads/         # Local uploaded files (when Cloudinary is not configured)
├── app.js           # Application entry point
└── seed.js          # Optional seed data script
```

## Getting started

### Prerequisites

- Node.js 20 or newer
- MongoDB database (local or Atlas)
- A Gmail account with an app password, or equivalent SMTP credentials, for email features

### Installation

```bash
git clone <your-repository-url>
cd "Project 1"
npm install
```

Create a `.env` file in the project root:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=a_long_random_secret
PORT=3000
FRONTEND_ORIGIN=http://localhost:3000

EMAIL=your_email_address
EMAIL_PW=your_email_app_password

# Optional: enables Cloudinary resume storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Start the application:

```bash
npm run dev
```

The app runs on `http://localhost:3000`. The health endpoint is available at `/api/health`.

## API overview

| Area | Base route | Purpose |
| --- | --- | --- |
| Students | `/api/students` | Activation, login, profile, eligible drives, applications, resume uploads |
| Recruiters | `/api/recruiters` | Registration, verification, login, account management |
| Colleges | `/api/colleges` | Registration, login, student uploads, partnerships, drive approvals |
| Companies | `/api/companies` | Company-college partnership management |
| Drives | `/api/drives` | Drive creation, ranking, shortlisting, OA results, and interviews |

Protected endpoints expect this header:

```http
Authorization: Bearer <JWT_TOKEN>
```

## Candidate ranking

Recruiters supply weights for CGPA, coding-platform rating, project count, and internship count. ScoutHire normalizes the provided weights so that they add up to one. It also normalizes each student metric against the strongest eligible applicant for that metric, making values such as CGPA and coding ratings comparable before calculating a final weighted score.

## Current scope and planned improvements

ScoutHire is a working project focused on the main campus-recruitment flow. Good next steps include automated tests, transactional application updates, background jobs for bulk email/CSV processing, stricter request validation, and more advanced analytics.

## License

This project is currently licensed under the ISC License.
