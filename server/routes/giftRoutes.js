const express = require('express');
const mongoose = require('mongoose');
const { randomUUID } = require('node:crypto');

const router = express.Router();
const MAX_BYTES = 8 * 1024 * 1024;
const MAX_GIFTS = 32;
const DAY = 24 * 60 * 60 * 1000;
const LEASE = 15 * 60 * 1000;
const UUID = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;

const schema = new mongoose.Schema({
  _id: String,
  slot: { type: Number, unique: true, required: true },
  tape: mongoose.Schema.Types.Mixed,
  expiresAt: { type: Date, expires: 0, required: true },
  claimant: String,
  leaseUntil: Date,
}, { versionKey: false });
const Gift = mongoose.model('HostedGift', schema);

const activeGift = id => ({ _id: id, expiresAt: { $gt: new Date() } });

router.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

router.post('/', express.json({ limit: MAX_BYTES }), async (req, res) => {
  const tape = req.body;
  if (typeof tape?.name !== 'string' || !tape.name.trim() ||
      ![tape.sideA, tape.sideB].every(side => Array.isArray(side) && side.length <= 5 &&
        side.every(track => typeof track?.title === 'string' && typeof track.audioUrl === 'string' &&
          /^https:\/\/|^data:audio\/[\w.+-]+;base64,[a-z0-9+/]+={0,2}$/i.test(track.audioUrl)))) {
    return res.status(400).json({ error: 'Every track must have playable audio.' });
  }

  await Gift.init();
  await Gift.deleteMany({ expiresAt: { $lte: new Date() } });
  const occupied = new Set(await Gift.distinct('slot'));
  for (let slot = 0; slot < MAX_GIFTS; slot++) {
    if (occupied.has(slot)) continue;
    try {
      const gift = await Gift.create({ _id: randomUUID(), slot, tape, expiresAt: new Date(Date.now() + DAY) });
      return res.status(201).json({ id: gift.id });
    } catch (error) {
      if (error.code !== 11000) throw error;
    }
  }
  return res.status(503).json({ error: 'Gift storage is full. Try again after an existing gift is saved or expires.' });
});

router.get('/:id', async (req, res) => {
  const gift = await Gift.findOne(activeGift(req.params.id), { 'tape.name': 1, 'tape.color': 1, 'tape.labelColor': 1, 'tape.sticker': 1, 'tape.giftSender': 1 });
  if (!gift) return res.status(410).json({ error: 'This gift has expired or already been saved.' });
  return res.json(gift.tape);
});

router.post('/:id/claim', express.json({ limit: '1kb' }), async (req, res) => {
  const { claimant } = req.body || {};
  if (!UUID.test(claimant)) return res.sendStatus(400);
  const now = new Date();
  const gift = await Gift.findOneAndUpdate({
    ...activeGift(req.params.id),
    $or: [{ claimant }, { leaseUntil: { $exists: false } }, { leaseUntil: { $lte: now } }],
  }, { claimant, leaseUntil: new Date(Date.now() + LEASE) }, { returnDocument: 'after' });
  if (!gift) return res.status(409).json({ error: 'This gift is being saved elsewhere, has expired, or was already saved.' });
  return res.json(gift.tape);
});

router.delete('/:id/claim', express.json({ limit: '1kb' }), async (req, res) => {
  const { claimant } = req.body || {};
  if (!UUID.test(claimant)) return res.sendStatus(400);
  const result = await Gift.deleteOne({ _id: req.params.id, claimant });
  if (!result.deletedCount && await Gift.exists({ _id: req.params.id })) return res.sendStatus(409);
  return res.sendStatus(204);
});

module.exports = router;
