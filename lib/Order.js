'use strict';

class Order {

  constructor(book, side, price, size) {
    this.book = book;

    this.side  = side;
    this.price = price;

    this.remainingQuantity = size;
  }

}

module.exports = Order;
