"use strict";

var User = require("../modelos/usuario.model");
var Equipo = require("../modelos/equipos.model");
var liga = require("../modelos/liga.model");


//  Buscar un equipo por su id
function BuscarEquipo(req, res) {

    //Se revisa si el solicita la funcion es rol admin (No se para que, pero ok)
    let idEquipo = req.params.id;
    if (req.user.rol != "ROL_ADMINAPP") {
        return res.status(500).send({ mensaje: "No puedes ver estos clubs" });
    }

    //Se busca el equipo por su id
    Equipo.findOne({ _id: idEquipo }).exec((err, equipoEncontrado) => {
        if (err) return res.status(500).send({ mensaje: "Error en la solicitud" });
        if (!equipoEncontrado)
            return res.status(500).send({ mensaje: "El equipo no existe", });
        if (equipoEncontrado) return res.status(500).send({ equipoEncontrado });
    });
}


//  Registrar un equipo
function CrearEquipo(req, res) {
    let idUser = req.user.sub;
    let equipo = new Equipo();
    let params = req.body;
    var idLiga = req.params.idLiga;

    //Se revisa parametros correctos
    if (params.nombres) {

        //Se busca al usuario si existe
        User.findOne({ _id: idUser }, (err, userFound) => {
            if (err) {
                return res.status(500).send({ ok: false, message: "Error general" });
            } else if (userFound) {

                //Busqueda para ver si el usuario ya tiene un equipo
                Equipo.findOne({ usuario: userFound._id }, (err, teamFound) => {
                    if (err) {
                        return res.status(500).send({ message: "Error general" });
                    } else if (teamFound) {
                        return res.status(500).send({ message: "El usuario ya tiene un equipo", });
                    } else {

                        //Busqueda para ver si el equipo ya existe
                        Equipo.find({ $or: [{ nombres: params.nombres },] }).exec((err, equipoEncontrado) => {
                            if (err) { return res.status(500).send({ mensaje: "Error" }) }
                            if (equipoEncontrado && equipoEncontrado.length >= 1) {
                                return res.status(500).send({ mensaje: "El equipo ya existe" })
                            } else {

                                //Busqueda para ver si la liga existe
                                liga.findOne({ _id: idLiga }).exec((err, ligaEncontrada) => {
                                    if (err) return res.status(500).send({ mensaje: "Error" });
                                    if (!ligaEncontrada) return res.status(500).send({ mensaje: "La liga no existe" });

                                    //Validar que ni hayan mas de 10 equipos en la liga
                                    Equipo.find({ liga: idLiga }).exec((err, equipoEncontrado) => {
                                        if (err) return res.status(500).send({ mensaje: "Error" });
                                        if (equipoEncontrado && equipoEncontrado.length >= 10) {
                                            return res.status(500).send({ mensaje: "Solo puede haber 10 equipos por liga" })
                                        } else {

                                            //Ingresar parametros
                                            equipo.nombres = params.nombres;
                                            equipo.usuario = idUser;
                                            equipo.liga = idLiga;

                                            //Guaradar los datos ingresados
                                            equipo.save((err, teamSaved) => {
                                                if (err) {
                                                    return res.status(500).send({ ok: false, message: "Error general" });
                                                } else if
                                                    (teamSaved) {
                                                    return res.status(500).send({ teamSaved });
                                                }
                                            });
                                        }
                                    })
                                })
                            }
                        })
                    }
                })
            } else {
                return res.status(500).send({ message: "No existe el usuario" });
            }
        });

    } else {
        return res.status(500).send({ message: "Error" });
    }
}


//  Buscar equipos por liga
function equiposLiga(req, res) {
    var params = req.body;
    var idLiga = req.params.idLiga;

    //Busqueda para revisar si existe la liga
    liga.findOne({ _id: idLiga }).exec((err, ligaEncontrada) => {
        if (err) return res.status(500).send({ mensaje: "Error" });
        if (!ligaEncontrada) return res.status(500).send({ mensaje: "La liga no existe" });

        //Busqueda a los equipos por su liga
        Equipo.find({ liga: idLiga }).exec((err, equipoEncontrado) => {
            if (err) return res.status(500).send({ mensaje: "Error" });
            if (equipoEncontrado.length === 0) return res.status(500).send({ mensaje: "Esta liga no tiene equipos" })
            return res.status(200).send({ equipoEncontrado })
        })
    })
}


//  Editar un equipo
function editarEquipo(req, res) {
    var params = req.body;
    var idEquipo = req.params.idEquipo;
    var idUsuario;

    //Verificar si el equipo existe
    Equipo.findOne({ _id: idEquipo }).exec((err, equipoEncontrado) => {
        if (err) return res.status(500).send({ mensaje: "Error" });
        if (equipoEncontrado.length === 0) return res.status(500).send({ mensaje: "El equipo no existe" })
        idUsuario = equipoEncontrado.usuario;

        //Validar rol
        if (req.user.sub != idUsuario) {
            if (req.user.rol != "ROL_ADMINAPP")
                return res.status(500).send({ mensaje: "Solo el ADMIN o la misma se puede modificar" })
        }

        //Validar parametros correctos para editar
        if (!params.nombres && !params.liga) {
            return res.status(500).send({ mensaje: "No hay ningun parametro correcto para editar" })
        }

        //Eliminar el parametro de usuario
        delete params.usuario;

        //Verificar que el nuevo nombre no exista
        Equipo.findOne({ nombres: params.nombres }).exec((err, equipoEncontrado) => {
            if (err) return res.status(500).send({ mensaje: "Error" });
            console.log(equipoEncontrado)
            if (equipoEncontrado) {
                return res.status(500).send({ mensaje: "El equipo ya existe" })
            }

            //Verificar que no hayan mas de 10 equipos en la liga
            Equipo.find({ liga: params.liga }).exec((err, equipoEncontrado) => {
                if (err) return res.status(500).send({ mensaje: "Error" });
                if (equipoEncontrado && equipoEncontrado.length >= 10) {
                    return res.status(500).send({ mensaje: "Solo puede haber 10 equipos por liga" })
                } else {

                    //Busqueda para ver si la liga existe
                    liga.findOne({ nombres: params.liga }).exec((err, ligaEncontrada) => {
                        if (err) return res.status(500).send({ mensaje: "Error" });
                        if (!ligaEncontrada) return res.status(500).send({ mensaje: "La liga no existe" })


                        //Editar equipo
                        Equipo.findByIdAndUpdate(idEquipo, params, { new: true }, (err, equipoActualizado) => {
                            if (err) return res.status(500).send({ mensaje: "Error" });
                            if (!equipoActualizado) return res.status(500).send({ mensaje: "No se ha podido editar el equipo" })
                            return res.status(200).send({ equipoActualizado })
                        })
                    })
                }
            })
        })
    })

}


//  Eliminar un equipo
function eliminarEquipo(req, res) {
    var idEquipo = req.params.idEquipo;
    var idUsuario;

    //Validar que el equipo exista
    Equipo.findOne({ _id: idEquipo }).exec((err, equipoEncontrado) => {
        if (err) return res.status(500).send({ mensaje: "Error" });
        if (!equipoEncontrado) return res.status(500).send({ mensaje: "El equipo no existe" })
        idUsuario = equipoEncontrado.usuario;

        //Validar rol
        if (req.user.sub != idUsuario) {
            if (req.user.rol != "ROL_ADMINAPP")
                return res.status(500).send({ mensaje: "Solo el ADMIN o la misma se puede modificar" })
        }

        //Eliminar el equipo
        Equipo.findByIdAndDelete(idEquipo, (err, equipoEliminado) => {
            if (err) return res.status(500).send({ mensaje: "Error" });
            if (!equipoEliminado) return res.status(500).send({ mensaje: "No se ha podido eliminar el equipo" });
            return res.status(200).send({ mensaje: "Equipo Eliminado" })
        })
    })
}


module.exports = {
    CrearEquipo,
    BuscarEquipo,
    equiposLiga,
    editarEquipo,
    eliminarEquipo
};
