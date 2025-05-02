const mongoose = require('mongoose');

const PolygonSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true }, 
  city: { type: String, required: true }, 
  district: { type: String, required: true }, 
  area: { type: Number, required: true },
  coordinates: { type: Array, required: true },
  color: { type: String, required: true }
});

const Polygon = mongoose.model('Polygon', PolygonSchema);

module.exports = Polygon;
