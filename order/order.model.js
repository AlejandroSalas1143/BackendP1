const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  books: [{
    _id: false,
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book'
    },
    owner: {  
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  }],
  status: {
    type: String,
    enum: ['in progress', 'completed', 'cancelled'],
    default: 'in progress'
  },
  creationDate: {
    type: Date,
    default: Date.now
  }
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
