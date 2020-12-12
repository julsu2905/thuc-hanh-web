const app = require('express');
const router = app.Router();
const viewClientController = require('../controllers/viewClientController');

router.get('/',viewClientController.getLandingPage);

module.exports= router ;