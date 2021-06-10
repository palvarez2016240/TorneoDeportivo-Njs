'use strict'

var express = require("express");
var equipoControlador = require("../controladores/equipo.controlador");
var md_autorizacion = require("../middlewares/authenticated");

var api = express.Router();


api.get("/BuscarUserEquipo/:id",md_autorizacion.ensureAuth, equipoControlador.BuscarUserEquipo);;
api.post("/Equipo", md_autorizacion.ensureAuth, equipoControlador.CrearEquipo);

module.exports = api;