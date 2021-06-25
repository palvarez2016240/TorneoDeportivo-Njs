'use strict'

var express = require("express");
var ligaControlador = require("../controladores/liga.controlador");
var md_autorizacion = require("../middlewares/authenticated");

var api = express.Router();



api.post("/Liga", md_autorizacion.ensureAuth, ligaControlador.CrearLiga);
api.put('/EditarLiga/:id', md_autorizacion.ensureAuth, ligaControlador.EditarLiga);
api.delete('/EliminarLiga/:id', md_autorizacion.ensureAuth, ligaControlador.EliminarLiga);
api.get('/ObtenerLigas',ligaControlador.ObterLigas);
api.get('/ligaId/:idLiga', ligaControlador.ligaId);

module.exports = api;
