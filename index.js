const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();
require('dotenv').config();
console.log(process.env.DB_PASSWORD);

app.use(cors());
app.use(express.json());

app.get("/", (req,res) => {
    res.status(200).json({});
})
const authRoutes = require("./auth/auth.route");
app.use('/auth', authRoutes);

const rutasBook = require("./book/book.route")
app.use('/book', rutasBook);

const orderRoutes = require("./order/order.route"); 
app.use('/order', orderRoutes);

const userRoutes = require("./user/user.route"); 
app.use('/user', userRoutes);

// aqui va la connection string VVVVV
const connectionString = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@backendproyect.nxmhnja.mongodb.net/?retryWrites=true&w=majority&appName=BackendProyect`;
//mongoose.connect('mongodb+srv://ainfantem:bdbackendproyect@backendproyect.nxmhnja.mongodb.net/?retryWrites=true&w=majority&appName=BackendProyect');

mongoose.connect(connectionString);


app.listen(8080);

