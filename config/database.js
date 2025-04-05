const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import cors
const app = express();

const dbURI = 'mongodb+srv://patk:Pk0984479298@cluster.x1rbldn.mongodb.net/sportbooking';

mongoose.connect(dbURI, { serverSelectionTimeoutMS: 5000 }) // Set a timeout for server selection
  .then(() => {
    console.log('เชื่อมต่อ MongoDB สำเร็จ!');
  })
  .catch(err => {
    console.error('ไม่สามารถเชื่อมต่อ MongoDB:', err.message); // Improved error logging
  });

// Debugging connection events
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to the database.');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected from the database.');
});

// Update the booking schema to include field_id and user_id
const bookingSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    field_id: Number,
    field: String,
    date: Date,
    start_time: String,
    end_time: String,
    hours: Number,
    user_id: mongoose.Schema.Types.ObjectId
});

// Create Model from Schema
const Booking = mongoose.model('Booking', bookingSchema);

// Define the schema for the fields collection
const fieldSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    field_id: Number,
    name: String,
    field_type: String,
    price_per_hour: Number
});

// Create a model for the fields collection
const Field = mongoose.model('Field', fieldSchema);

// Fetch all bookings from the collection
mongoose.connection.once('open', () => {
  console.log('Database connection is open. Fetching bookings...');
  Booking.find({})
    .then(bookings => {
      console.log('All bookings:', bookings);
    })
    .catch(err => {
      console.error('Error retrieving bookings:', err.message); // Improved error logging
    });
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // Add this line to parse JSON data
app.use(cors()); // Enable CORS for all routes

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

// API endpoint to create a booking
app.post('/create-booking', async (req, res) => {
    try {
        const { field_id, date, start_time, hours, user_id } = req.body;

        console.log('Request body:', req.body); // Log the request body for debugging

        // Validate required fields
        if (!field_id || !date || !start_time || !hours || !user_id) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        // Validate field_id as a Number and user_id as ObjectId
        if (typeof field_id !== 'number' || !mongoose.Types.ObjectId.isValid(user_id)) {
            return res.status(400).json({ error: 'Invalid field_id or user_id.' });
        }

        // Calculate end_time
        const [startHour, startMinute] = start_time.split(':').map(Number);
        const endHour = startHour + parseInt(hours, 10);
        const end_time = `${endHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`;

        // Create a new booking
        const newBooking = new Booking({
            _id: new mongoose.Types.ObjectId(),
            field_id, // Use field_id as a Number
            date: new Date(date),
            start_time,
            end_time,
            hours: parseInt(hours, 10),
            user_id: new mongoose.Types.ObjectId(user_id) // Ensure user_id is a valid ObjectId
        });

        // Save the booking to the database
        await newBooking.save();

        res.status(201).json({
            message: 'Booking created successfully!',
            booking: newBooking
        });
    } catch (err) {
        console.error('Error creating booking:', err); // Log the error for debugging
        res.status(500).json({ error: 'Failed to create booking.' });
    }
});

// API endpoint to fetch all fields
app.get('/fields', async (req, res) => {
    try {
        const fields = await Field.find({});
        res.status(200).json(fields);
    } catch (err) {
        console.error('Error fetching fields:', err.message);
        res.status(500).send('Failed to fetch fields.');
    }
});

// Start the server
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});