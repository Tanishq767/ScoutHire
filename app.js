const express = require('express')
const cors = require('cors')
const app = express()
const mongoose  = require('mongoose')
const students = require('./routes/students')

mongoose.connect('mongodb://127.0.0.1/mydb')
.then(() => console.log('Connection is successful'))
.catch(err => console.error('Couldnt connect to mongoDB', err))

app.use(cors())
app.use(express.json())
app.use('/api/students', students)

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Listening on port ${port}...`));
mongoose.connection.on('connected', () => {
    console.log('MongoDB connected (event)');
});

mongoose.connection.on('error', err => {
    console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
})