const Polygon = require('../../src/models/Polygon');




exports.getPolygons = async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'Kullanıcı ID gerekli' });
  
    try {
      const polygons = await Polygon.find({ userId });
      res.status(200).json(polygons);
    } catch (error) {
      res.status(500).json({ error: 'Poligonlar alınamadı' });
    }
  };

  
// Poligon oluştur
exports.createPolygon = async (req, res) => {
    const { userId, name, city, district, area, coordinates, color } = req.body;

    if (!userId || !name || !city || !district || !area || !coordinates || !color) {
        return res.status(400).json({ error: 'Tüm alanlar zorunludur' });
    }

    try {
        const polygon = new Polygon({
            userId,
            name,
            city,
            district,
            area,
            coordinates,
            color
        });

        await polygon.save();
        res.status(201).json(polygon);
    } catch (error) {
        console.error('Poligon kaydedilemedi:', error);
        res.status(500).json({ error: 'Poligon kaydedilemedi' });
    }
};

// Poligonları getir
exports.getPolygonsByUser = async (req, res) => {
    try {
        const polygons = await Polygon.find({ userId: req.params.userId });
        const result = polygons.map(p => ({
            ...p._doc,
            _id: p._id.toString()
        }));
        res.json(result);
    } catch (error) {
        console.error('Poligonlar çekilemedi:', error);
        res.status(500).json({ error: 'Poligonlar çekilemedi' });
    }
};

// Güncelle
exports.updatePolygon = async (req, res) => {
    try {
        const updated = await Polygon.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(404).json({ error: 'Poligon bulunamadı' });
        res.status(200).json(updated);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Sil
exports.deletePolygon = async (req, res) => {
    try {
        const deleted = await Polygon.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: 'Poligon bulunamadı' });
        res.json({ message: 'Poligon başarıyla silindi' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// İstatistik
exports.getStatistics = async (req, res) => {
    try {
        const polygons = await Polygon.find({ userId: req.params.userId });

        const totalPolygons = polygons.length;
        const totalArea = polygons.reduce((sum, p) => sum + p.area, 0);
        const smallAreaCount = polygons.filter(p => p.area < 100000).length;
        const mediumAreaCount = polygons.filter(p => p.area >= 100000 && p.area < 300000).length;
        const largeAreaCount = polygons.filter(p => p.area >= 300000).length;

        res.json({
            totalPolygons,
            totalArea,
            smallAreaCount,
            mediumAreaCount,
            largeAreaCount
        });
    } catch (error) {
        console.error('İstatistikler yüklenemedi:', error);
        res.status(500).json({ error: 'İstatistikler yüklenemedi' });
    }
};
