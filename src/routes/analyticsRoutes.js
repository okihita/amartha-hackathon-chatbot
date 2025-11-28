/**
 * Analytics API Routes
 * Exposes data analytics endpoints for the dashboard
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const analyticsService = require('../services/DataAnalyticsService');

// Initialize data on first request
let initialized = false;
const ensureLoaded = async (req, res, next) => {
  if (!initialized) {
    try {
      await analyticsService.loadData();
      initialized = true;
    } catch (err) {
      console.error('[Analytics] Failed to load data:', err);
      return res.status(500).json({ error: 'Failed to load analytics data' });
    }
  }
  next();
};

router.use(ensureLoaded);

// Dashboard summary
router.get('/summary', (req, res) => {
  res.json(analyticsService.getDashboardSummary());
});

// IDEA 1: Default Risk Predictions
router.get('/risk/all', (req, res) => {
  const limit = parseInt(req.query.limit) || 100;
  const predictions = analyticsService.getAllRiskPredictions().slice(0, limit);
  res.json(predictions);
});

router.get('/risk/:customerNumber', (req, res) => {
  const prediction = analyticsService.predictDefaultRisk(req.params.customerNumber);
  if (!prediction) return res.status(404).json({ error: 'Customer not found' });
  res.json(prediction);
});

// IDEA 2: Field Agent Routes
router.get('/routes', (req, res) => {
  res.json(analyticsService.analyzeFieldAgentRoutes());
});

// IDEA 3: Image Analysis
router.get('/images', (req, res) => {
  res.json(analyticsService.getImageAnalysisStats());
});

router.get('/image/:type/:filename', (req, res) => {
  const { type, filename } = req.params;
  if (!['business', 'house'].includes(type)) {
    return res.status(400).json({ error: 'Invalid type' });
  }
  const imagePath = analyticsService.getImagePath(type, filename);
  res.sendFile(imagePath);
});

// IDEA 4: Payment Analytics
router.get('/payments', (req, res) => {
  res.json(analyticsService.getPaymentAnalytics());
});

// IDEA 5: Customer Segments
router.get('/segments', (req, res) => {
  res.json(analyticsService.getCustomerSegments());
});

module.exports = router;
