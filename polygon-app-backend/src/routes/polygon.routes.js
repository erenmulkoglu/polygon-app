const router = require('express').Router();
const polygonController = require('../controllers/polygon.controller');


router.get('/', polygonController.getPolygons);
router.post('/', polygonController.createPolygon);
router.get('/getPolygons/:userId', polygonController.getPolygonsByUser);
router.put('/:id', polygonController.updatePolygon);
router.delete('/:id', polygonController.deletePolygon);
router.get('/getStatistics/:userId', polygonController.getStatistics);

module.exports = router;
