const Market = require('..');

const market = new Market();

market.onupdate = function (event) {
  const instrument = event.book.instrument;

  const bestBid = event.book.bestBid();
  const bestAsk = event.book.bestAsk();

  const bestBidPrice = bestBid ? bestBid.price.toFixed(2) : '-';
  const bestAskPrice = bestAsk ? bestAsk.price.toFixed(2) : '-';

  console.log(instrument + ' ' + bestBidPrice + ' ' + bestAskPrice);
};

market.open('AAPL');

market.add('AAPL', 1, 'B', 179.00, 1000);
market.add('AAPL', 2, 'S', 180.50,  500);
