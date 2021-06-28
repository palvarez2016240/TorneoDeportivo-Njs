'use strict'

var express = require("express");
var equipoControlador = require("../controladores/equipo.controlador");
var md_autorizacion = require("../middlewares/authenticated");
var multiparty = require('connect-multiparty');
var md_subirImagen = multiparty({uploadDir: './src/imagenes/equipos'});

var api = express.Router();

api.get("/BuscarEquipo/:id",md_autorizacion.ensureAuth, equipoControlador.BuscarEquipo);
api.post("/Equipo/:idLiga", md_autorizacion.ensureAuth, equipoControlador.CrearEquipo);
api.get("/equiposLiga/:idLiga", equipoControlador.equiposLiga);
api.put("/editarEquipo/:idEquipo",md_autorizacion.ensureAuth, equipoControlador.editarEquipo);
api.delete("/eliminarEquipo/:idEquipo", md_autorizacion.ensureAuth, equipoControlador.eliminarEquipo);
api.post("/subirImagen/:idEquipo", [md_autorizacion.ensureAuth, md_subirImagen], equipoControlador.subirImagen);
api.get("/obtenerImagen/:imagen", equipoControlador.obtenerImagen);

module.exports = api;
