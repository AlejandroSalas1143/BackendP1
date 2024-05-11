const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  books: [{
    _id: false,
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    price: { type: Number, required: true }
  }],
  status: { type: String, enum: ['in progress', 'completed', 'cancelled'], default: 'in progress' },
  address: { type: String, required: true },
  total : {type: Number, required: true},
  creationDate: {type: Date,default: Date.now},
  enabled: { type: Boolean, default: true }
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
