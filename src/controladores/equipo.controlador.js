'use strict'

var User = require('../modelos/usuario.model');
var Equipo = require('../modelos/equipos.model')
var bcrypt = require('bcrypt-nodejs');
var jwt = require('../services/jwt');


    function BuscarUserEquipo(req, res) {
        let idUser = req.params.id
        if(req.user.rol != 'ROL_ADMINAPP'){
            return res.status(500).send({ mensaje: 'Ustede no puede nuscar un usuario cambiese de Rol' })
        }
        Equipo.findOne({usuario:idUser}).exec((err, userEncontrado)=>{
            if(err) return res.status(500).send({ mensaje: 'Error en la solicitud' })
            if(!userEncontrado) return res.status(500).send({ mensaje: 'No se pudo encontrar al usuario en la base de datos'})
            if(userEncontrado) return res.status(500).send({ userEncontrado})
        })
    }

    function CrearEquipo(req, res) {
        let idUser = req.user.sub;
        let equipo = new Equipo();
        let params = req.body;
    
        if (params.nombres && idUser) {
            User.findOne({ _id: idUser }, (err, userFound) => {
                if (err) {
                    return res.status(500).send({ ok: false, message: "Error general" });
                } else if (userFound) {
                    Equipo.findOne({ usuario: userFound._id }, (err, teamFound) => {
                        if (err) {
                            return res
                                .status(500)
                                .send({ ok: false, message: "Error general" });
                        } else if (teamFound) {
                            return res.json({
                                ok: false,
                                message: "Ese equipo ya tiene usuario",
                            });
                        } else {
                            equipo.nombres = params.nombres;
                            equipo.usuario = idUser;
                            equipo.save((err, teamSaved) => {
                                if (err) {
                                    return res
                                        .status(500)
                                        .send({ ok: false, message: "Error general" });
                                } else if (teamSaved) {
                                    return res.json({
                                        ok: true,
                                        message: "Equipo guardado correctamente",
                                        teamSaved,
                                    });
                                } else {
                                    return res.json({
                                        ok: false,
                                        message: "Error al guardar el equipo",
                                    });
                                }
                            });
                        }
                    });
                } else {
                    return res.json({ ok: false, message: "NO existe el usuario" });
                }
            });
        } else {
            return req.json({ ok: false, message: "Eror" });
        }
    }






module.exports = {
    CrearEquipo,BuscarUserEquipo
    
}