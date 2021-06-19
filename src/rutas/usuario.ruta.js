'use strict'

var express = require("express");
var usuarioControlador = require("../controladores/usuario.controlador");
var md_autorizacion = require("../middlewares/authenticated");

var api = express.Router();

api.get("/login", usuarioControlador.Login);
api.post('/NuevoAdmin',md_autorizacion.ensureAuth,usuarioControlador.NuevoAdmin);
api.post('/registrar', usuarioControlador.Registrar);
api.put('/EditarUser/:id', md_autorizacion.ensureAuth, usuarioControlador.EditarUser);
api.delete('/EliminarUser/:id', md_autorizacion.ensureAuth, usuarioControlador.EliminarUser);
api.get('/AllUser', md_autorizacion.ensureAuth,usuarioControlador.ObtenerUser);
api.get('/UserID/:id', md_autorizacion.ensureAuth,usuarioControlador.obtenerUsuarioID);



module.exports = api;