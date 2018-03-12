'use strict';

const Order = require('./Order');
const OrderBook = require('./OrderBook');
const PriceLevel = require('./PriceLevel');
const TradeEvent = require('./TradeEvent');
const UpdateEvent = require('./UpdateEvent');

class Market {

  constructor() {
    this._books  = new Map();
    this._orders = new Map();

    this.onupdate = undefined;
    this.ontrade  = undefined;
  }

  open(instrument) {
    let book = this._books.get(instrument);
    if (!book) {
      book = new OrderBook(instrument);

      this._books.set(instrument, book);
    }

    return book;
  }

  find(orderId) {
    return this._orders.get(orderId);
  }

  add(instrument, orderId, side, price, size) {
    if (this._orders.has(orderId))
      return;

    const book = this._books.get(instrument);
    if (!book)
      return;

    const order = new Order(book, side, price, size);

    const bbo = add(book, side, price, size);

    this._orders.set(orderId, order);

    onupdate(this, book, bbo);
  }

  modify(orderId, size) {
    const order = this._orders.get(orderId);
    if (!order)
      return;

    const book = order.book;

    const newSize = Math.max(0, size);

    const bbo = update(book, order.side, order.price,
      newSize - order.remainingQuantity);

    if (newSize == 0)
      this._orders.delete(orderId);
    else
      order.remainingQuantity = newSize;

    onupdate(this, book, bbo);
  }

  execute(orderId, quantity, price) {
    const order = this._orders.get(orderId);
    if (!order)
      return;

    const book = order.book;

    const remainingQuantity = order.remainingQuantity;

    const executedQuantity = Math.min(quantity, remainingQuantity);

    ontrade(this, book, order.side, price || order.price, executedQuantity);

    update(book, order.side, order.price, -executedQuantity);

    if (executedQuantity == remainingQuantity)
      this._orders.delete(orderId);
    else
      order.remainingQuantity -= executedQuantity;

    onupdate(this, book, true);

    return remainingQuantity - executedQuantity;
  }

  cancel(orderId, quantity) {
    const order = this._orders.get(orderId);
    if (!order)
      return;

    const book = order.book;

    const remainingQuantity = order.remainingQuantity;

    const canceledQuantity = Math.min(quantity, remainingQuantity);

    const bbo = update(book, order.side, order.price, -canceledQuantity);

    if (canceledQuantity === remainingQuantity)
      this._orders.delete(orderId);
    else
      order.remainingQuantity -= canceledQuantity;

    onupdate(this, book, bbo);

    return remainingQuantity - canceledQuantity;
  }

  delete(orderId) {
    const order = this._orders.get(orderId);
    if (!order)
      return;

    const book = order.book;

    const bbo = update(book, order.side, order.price, -order.remainingQuantity);

    this._orders.delete(orderId);

    onupdate(this, book, bbo);
  }

}

module.exports = Market;

function add(book, side, price, size) {
  const levels = side === 'B' ? book._bids : book._asks;

  const node = levels.find(new PriceLevel(price));
  if (node)
    node.value.size += size;
  else
    levels.add(new PriceLevel(price, size));

  return levels.findLeast().value.price === price;
}

function update(book, side, price, quantity) {
  const levels = side === 'B' ? book._bids : book._asks;

  const level = levels.find(new PriceLevel(price)).value;

  const newSize = level.size + quantity;

  const onBestLevel = levels.findLeast().value.price === price;

  if (newSize > 0)
    level.size = newSize;
  else
    levels.delete(new PriceLevel(price));

  return onBestLevel;
}

function onupdate(market, book, bbo) {
  if (market.onupdate)
    market.onupdate(new UpdateEvent(book, bbo));
}

function ontrade(market, book, side, price, executedQuantity) {
  if (market.ontrade)
    market.ontrade(new TradeEvent(book, side, price, executedQuantity));
}
