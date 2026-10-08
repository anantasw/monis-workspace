# Monis Workspace Builder: domain glossary

Words used in the code, the UI and the docs. Use these words; avoid the ones listed under _Avoid_.

**Setup**: everything one customer wants to rent: one desk, zero or one chair, items with quantities, and a rental length in weeks. Code: `Setup` in `src/domain/setup.ts`.
_Avoid_: cart, basket, order (nothing is ordered until a rent request is sent).

**Product**: one thing monis.rent rents out, with a weekly price. Code: `Product` in `src/domain/catalog.ts`.
_Avoid_: SKU, article.

**Desk / Chair**: exactly one desk is always in a setup; a chair is optional ("no chair" is allowed for people who stand).

**Item**: any product in a setup that is not the desk or the chair: screens, desk gear and zone products. Items have a quantity.

**Screen**: a monitor. The desk decides how many screens fit (**screen slots**): 2 on a 120 cm desk or the teak desk, 3 on a 140 cm desk.
_Avoid_: display (except in product names such as "Studio Display").

**Gear**: small items that sit on the desk: keyboard, mouse, laptop stand, webcam, lamp, monitor riser, desk plant.

**Zone**: products that fill the rest of the room: coffee corner, air purifier, floor plant. Comes from the "Coffee Station / Relax Zone" idea in the client sketch.

**Preset**: a ready-made setup to start from, named after monis.rent bundles (The Essentials, The Founders Setup, …). Loading a preset keeps the rental length.
_Avoid_: bundle (on monis.rent a bundle has a discount; presets do not).

**Weekly price / Total**: weekly price = sum of product prices × quantity, in integer cents. Total = weekly price × weeks. Delivery, setup and pick-up are free.

**Sample price**: a price we made up for a product monis.rent does not list yet. Always labelled in the UI. Must be confirmed by the client.

**Room**: the 2D picture of the setup (`Scene`). **Light** (phase): morning, noon, sunset or night; follows **Bali time** (WITA, UTC+8) unless the user picks one.

**Sticker**: the item picker card. Its drawing is the same art that appears in the room.

**Share code / Share link**: a short text that describes a setup, for example `desk-140.chair-ergo.mon-27x2.w8`, used in `/?s=`.

**Rent request**: what the customer sends from the summary page: contact, delivery area, delivery date, note and the setup. It is a request, not a booking: monis.rent confirms stock and delivery afterwards. Each request gets a **reference** such as `MON-3F9A1C`.
_Avoid_: order, booking, checkout (in code).

**Postcard**: the summary view and the PNG the user can download.
