const mongoose = require("mongoose");


const bookSchema = new mongoose.Schema({
  uploader: {type: mongoose.Schema.Types.ObjectId, ref: 'User',required: true},
  title: { type: String, required: true },
  author: { type: String, required: true },
  genre: { type: String, required: true },
  publisher: { type: String, required: true },
  publicationDate: { type: Date, required: true },
  price: { type: Number, required: true },
  status: { type: String, enum: ['available', 'sold', 'reserved'], default: 'available' },
  description: { type: String },
  enabled: { type: Boolean, default: true }
  
},{
  timestamps: true, 
  versionKey: false 
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
