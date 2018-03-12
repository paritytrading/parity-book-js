# Parity Order Book

This package implements limit order book reconstruction.

## Class: Market

This class represents an order book reconstruction.

### new Market()

- Returns `Market`

Create an order book reconstruction.

### market.onupdate

- `Function`

An event listener to be called when an order book is updated. The listener
receives an `UpdateEvent`.

### market.ontrade

- `Function`

An event listener to be called when a trade takes place. The listener receives
a `TradeEvent`.

### market.open(instrument)

- **instrument** `Number`|`String`
- Returns `OrderBook`

Open an order book.

### market.find(orderId)

- **orderId** `Number`|`String`
- Returns `Order` or `undefined`

Find an order.

### market.add(instrument, orderId, side, price, size)

- **instrument** `Number`|`String`
- **orderId** `Number`|`String`
- **side** `"B"`|`"S"`
- **price** `Number`
- **size** `Number`

Add an order to an order book.

An update event is triggered.

If the order book for the instrument is closed or the order identifier is
known, do nothing.

### market.modify(orderId, size)

- **orderId** `Number`|`String`
- **size** `Number`

Modify an order in the order book. The order will retain its time priority.
If the new size is zero, the order is deleted from the order book.

An update event is triggered.

If the order identifier is unknown, do nothing.

### market.execute(orderId, quantity[, price])

- **orderId** `Number`|`String`
- **quantity** `Number`
- **price** `Number`

Execute a quantity of an order in an order book. If the remaining quantity
reaches zero, the order is deleted from the order book.

A trade event and an update event are triggered.

If the order identifier is unknown, do nothing.

### market.cancel(orderId, quantity)

- **orderId** `Number`|`String`
- **quantity** `Number`

Cancel a quantity of an order in an order book. If the remaining quantity
reaches zero, the order is deleted from the order book.

An update event is triggered.

If the order identifier is unknown, do nothing.

### market.delete(orderId)

- **orderId** `Number`|`String`

Delete an order from an order book.

An update event is triggered.

If the order identifier is unknown, do nothing.

## Class: OrderBook

This class represents an order book.

### book.instrument

- `Number`|`String`

The instrument.

### book.bestBid()

- Returns `PriceLevel` or `undefined`

Get the best bid level.

### book.bestAsk()

- Returns `PriceLevel` or `undefined`

Get the best ask level.

### book.bids()

- Returns `Iterator`

Get the bid levels as a sequence of `PriceLevel` instances.

### book.asks()

- Returns `Iterator`

Get the ask levels as a sequence of `PriceLevel` instances.

## Class: Order

This class represents an order.

### order.book

- `OrderBook`

The order book.

### order.price

- `Number`

The order price.

### order.side

- `"B"`|`"S"`

The order side.

### order.remainingQuantity

- `Number`

The remaining quantity.

## Class: PriceLevel

This class represents a price level.

### level.price

- `Number`

The price.

### level.size

- `Number`

The size.

## Class: UpdateEvent

This class represents an order book update.

### event.book

- `OrderBook`

The order book.

### event.bbo

- `Boolean`

True if the best bid and offer (BBO) has changed, otherwise false.

## Class: TradeEvent

This class represents a trade that has taken place.

### event.book

- `OrderBook`

The order book.

### event.side

- `"B"`|`"S"`

The side of the incoming order.

### event.price

- `Number`

The trade price.

### event.size

- `Number`

The trade size.
