const express = require('express');
const router = express.Router();
const OwnerInvitation = require('../models/OwnerInvitation');
const crypto = require('crypto');

// @route   GET /api/invitations
// @desc    Get all 24-hr owner invitations
router.get('/', async (req, res) => {
  try {
    const invites = await OwnerInvitation.find().sort({ createdAt: -1 });
    res.json({ success: true, data: invites });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch invitations' });
  }
});

// @route   POST /api/invitations
// @desc    Send 24-hour onboarding invitation
router.post('/', async (req, res) => {
  try {
    const { email, canteenName, invitedBy } = req.body;
    const token = crypto.randomBytes(24).toString('hex');
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours from now

    const invite = await OwnerInvitation.create({
      email: email.toLowerCase(),
      canteenName,
      role: 'canteen_admin',
      token,
      status: 'PENDING',
      expiresAt,
      invitedBy: invitedBy || 'Super Admin Directorate',
    });

    res.status(201).json({ success: true, data: invite });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create invitation', error: err.message });
  }
});

// @route   POST /api/invitations/:id/resend
// @desc    Resend invitation & reset 24-hour expiration clock
router.post('/:id/resend', async (req, res) => {
  try {
    const invite = await OwnerInvitation.findById(req.params.id);
    if (!invite) return res.status(404).json({ success: false, message: 'Invitation not found' });

    invite.expiresAt = Date.now() + 24 * 60 * 60 * 1000;
    invite.status = 'PENDING';
    invite.sentAt = new Date().toLocaleString();
    await invite.save();

    res.json({ success: true, message: 'Invitation resent with new 24h deadline', data: invite });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to resend invitation' });
  }
});

// @route   DELETE /api/invitations/:id
// @desc    Revoke invitation
router.delete('/:id', async (req, res) => {
  try {
    await OwnerInvitation.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Invitation revoked successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to revoke invitation' });
  }
});

module.exports = router;
