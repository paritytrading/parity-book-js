'use strict';

const Market = require('./');
const assert = require('assert');

const UpdateEvent = require('./lib/UpdateEvent');
const TradeEvent  = require('./lib/TradeEvent');

describe('Market', function () {
  let market;

  let received;
  let expected;

  let book;

  beforeEach(function () {
    market = new Market();

    received = [];
    expected = [];

    market.onupdate = event => received.push(event);
    market.ontrade  = event => received.push(event);

    book = market.open(1);
  });

  it('handles best bid and offer', function () {
    market.add(1, 1, 'B',  999, 100);
    market.add(1, 2, 'S', 1001, 200);
    market.add(1, 3, 'S', 1000,  50);

    assert.equal(book.bestBid().price,  999);
    assert.equal(book.bestAsk().price, 1000);
  });

  it('handles addition', function () {
    market.add(1, 1, 'B',  999, 100);
    expected.push(update(true));

    market.add(1, 2, 'S', 1001, 200);
    expected.push(update(true));

    market.add(1, 3, 'B', 1000,  50);
    expected.push(update(true));

    assert.deepEqual(levels(), [
      [1000,  50, 1001, 200],
      [ 999, 100,    0,   0],
    ]);

    assert.deepEqual(received, expected);
  });

  it('handles modification', function () {
    market.add(1, 1, 'B',  999, 100);
    expected.push(update(true));

    market.add(1, 2, 'S', 1001, 200);
    expected.push(update(true));

    market.modify(2, 100);
    expected.push(update(true));

    assert.deepEqual(levels(), [[999, 100, 1001, 100]]);

    assert.deepEqual(received, expected);
  });

  it('handles execution', function () {
    market.add(1, 1, 'B',  999, 100);
    expected.push(update(true));

    market.add(1, 2, 'S', 1001, 200);
    expected.push(update(true));

    market.add(1, 3, 'S', 1002,  50);
    expected.push(update(false));

    assert.equal(0, market.execute(2, 200));
    expected.push(trade('S', 1001, 200));
    expected.push(update(true));

    assert.deepEqual(levels(), [[999, 100, 1002, 50]]);

    assert.deepEqual(received, expected);
  });

  it('handles execution with price', function () {
    market.add(1, 1, 'B',  999, 100);
    expected.push(update(true));

    market.add(1, 2, 'S', 1001, 200);
    expected.push(update(true));

    market.add(1, 3, 'S', 1002,  50);
    expected.push(update(false));

    assert.equal(0, market.execute(2, 200, 1000));
    expected.push(trade('S', 1000, 200));
    expected.push(update(true));

    assert.deepEqual(levels(), [[999, 100, 1002, 50]]);

    assert.deepEqual(received, expected);
  });

  it('handles partial execution', function () {
    market.add(1, 1, 'B',  999, 100);
    expected.push(update(true));

    market.add(1, 2, 'S', 1001, 200);
    expected.push(update(true));

    assert.equal(100, market.execute(2, 100));
    expected.push(trade('S', 1001, 100));
    expected.push(update(true));

    assert.deepEqual(levels(), [[999, 100, 1001, 100]]);

    assert.deepEqual(received, expected);
  });

  it('handles cancellation', function () {
    market.add(1, 1, 'B',  999, 100);
    expected.push(update(true));

    market.add(1, 2, 'S', 1001, 200);
    expected.push(update(true));

    market.add(1, 3, 'S', 1002,  50);
    expected.push(update(false));

    assert.equal(0, market.cancel(2, 200));
    expected.push(update(true));

    assert.deepEqual(levels(), [[999, 100, 1002, 50]]);

    assert.deepEqual(received, expected);
  });

  it('handles partial cancellation', function () {
    market.add(1, 1, 'B',  999, 100);
    expected.push(update(true));

    market.add(1, 2, 'S', 1001, 200);
    expected.push(update(true));

    assert.equal(100, market.cancel(2, 100));
    expected.push(update(true));

    assert.deepEqual(levels(), [[999, 100, 1001, 100]]);

    assert.deepEqual(received, expected);
  });

  it('handles deletion', function () {
    market.add(1, 1, 'B',  999, 100);
    expected.push(update(true));

    market.add(1, 2, 'S', 1001, 200);
    expected.push(update(true));

    market.add(1, 3, 'S', 1002,  50);
    expected.push(update(false));

    market.delete(2);
    expected.push(update(true));

    assert.deepEqual(levels(), [[999, 100, 1002, 50]]);

    assert.deepEqual(received, expected);
  });

  it('handles empty book', function () {
    market.add(1, 1, 'B',  999, 100);
    expected.push(update(true));

    market.add(1, 2, 'S', 1001, 200);
    expected.push(update(true));

    market.delete(2);
    expected.push(update(true));

    market.delete(1);
    expected.push(update(true));

    assert.deepEqual(levels(), []);

    assert.deepEqual(received, expected);
  });

  function update(bbo) {
    return new UpdateEvent(book, bbo);
  }

  function trade(side, price, executedQuantity) {
    return new TradeEvent(book, side, price, executedQuantity);
  }

  function levels() {
    const levels = [];

    const bids = book.bids();
    const asks = book.asks();

    while (true) {
      const level = [ 0, 0, 0, 0 ];

      const bid = bids.next();
      const ask = asks.next();

      if (!bid.done) {
        level[0] = bid.value.price;
        level[1] = bid.value.size;
      }

      if (!ask.done) {
        level[2] = ask.value.price;
        level[3] = ask.value.size;
      }

      if (bid.done && ask.done)
        break;

      levels.push(level);
    }

    return levels;
  }

});


