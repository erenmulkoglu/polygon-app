const Polygon = require('../models/Polygon');

// Poligon oluştur
exports.createPolygon = async (data) => {
  const polygon = new Polygon(data);
  return await polygon.save();
};

// Kullanıcının tüm poligonlarını getir
exports.getPolygonsByUser = async (userId) => {
  return await Polygon.find({ userId });
};

// Belirli ID ile poligon getir
exports.getPolygonById = async (id) => {
  return await Polygon.findById(id);
};

// Poligon güncelle
exports.updatePolygon = async (id, data) => {
  return await Polygon.findByIdAndUpdate(id, data, { new: true });
};

// Poligon sil
exports.deletePolygon = async (id) => {
  return await Polygon.findByIdAndDelete(id);
};

// İstatistik hesapla
exports.getStatistics = async (userId) => {
  const polygons = await Polygon.find({ userId });

  return {
    totalPolygons: polygons.length,
    totalArea: polygons.reduce((sum, p) => sum + p.area, 0),
    smallAreaCount: polygons.filter(p => p.area < 100000).length,
    mediumAreaCount: polygons.filter(p => p.area >= 100000 && p.area < 300000).length,
    largeAreaCount: polygons.filter(p => p.area >= 300000).length
  };
};
