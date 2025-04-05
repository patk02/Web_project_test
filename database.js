const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const dbURI = 'mongodb+srv://patk:Pk0984479298@cluster.x1rbldn.mongodb.net/';

mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('เชื่อมต่อ MongoDB สำเร็จ!');
  })
  .catch(err => {
    console.log('ไม่สามารถเชื่อมต่อ MongoDB:', err);
  });

const bookingSchema = new mongoose.Schema({
    field: String,
    date: Date,
    startTime: String,
    endTime: String,
    hours: Number
});

// สร้าง Model จาก Schema
const Booking = mongoose.model('Booking', bookingSchema);

// ดึงข้อมูลทั้งหมดจาก collection "bookings"
Booking.find({})
    .then(bookings => {
        console.log('All bookings:', bookings);
    })
    .catch(err => {
        console.error('Error retrieving bookings', err);
    });

app.use(bodyParser.urlencoded({ extended: true }));

// Route to handle form submission
app.post('/add-booking', (req, res) => {
    const { field, date, startTime, endTime, hours } = req.body;

    const newBooking = new Booking({
        field,
        date: new Date(date),
        startTime,
        endTime,
        hours: parseInt(hours, 10)
    });

    newBooking.save()
        .then(() => {
            res.send('Booking added successfully!');
        })
        .catch(err => {
            console.error('Error adding booking:', err);
            res.status(500).send('Failed to add booking.');
        });
});

// Start the server
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});