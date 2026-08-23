require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')
const app = express()
const mongoose  = require('mongoose')
const students = require('./routes/students')
const recruiterRoutes = require("./routes/recruiterRoutes");
const driveRoutes = require("./routes/drive");
const collegeRoutes = require("./routes/collegeRoutes");
const companyRoutes = require("./routes/companyRoutes");


const mongoUri = process.env.MONGO_URI

if (!mongoUri) {
    throw new Error('MONGO_URI environment variable is required.')
}

const allowedOrigins = (process.env.FRONTEND_ORIGIN || '')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean)

app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
            return callback(null, true)
        }

        return callback(new Error('Origin not allowed by CORS.'))
    }
}))
app.use(express.json())
app.use('/api/students', students)
app.use('/api/recruiters', recruiterRoutes)
app.use("/api/drives", driveRoutes)
app.use("/uploads", express.static(path.join(__dirname, "uploads")))
app.use("/api/colleges", collegeRoutes);
app.use("/api/companies", companyRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' })
})

app.use(express.static(path.join(__dirname, 'frontend')))

mongoose.connection.on('connected', () => {
    console.log('MongoDB connected (event)');
});

mongoose.connection.on('error', err => {
    console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
})

const port = process.env.PORT || 3000

async function startServer() {
    await mongoose.connect(mongoUri)
    console.log('Connection is successful')

    app.listen(port, () => console.log(`Listening on port ${port}...`))
}

startServer().catch(err => {
    console.error('Could not connect to MongoDB', err)
    process.exit(1)
})
