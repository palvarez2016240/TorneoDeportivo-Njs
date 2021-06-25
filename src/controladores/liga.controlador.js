'use strict'

var User = require('../modelos/usuario.model');
var Liga = require('../modelos/liga.model');
var equipo = require('../modelos/equipos.model');


//  Registrar una liga
function CrearLiga(req, res) {
    let idUser = req.user.sub;
    let liga = new Liga();
    let params = req.body;

    //Validar datos ingresados
    if (params.nombres && idUser) {

        //Validar que el que pide la solictud sea rol usuario
        if (req.user.rol != 'ROL_USER') {
            return res.status(500).send({ mensaje: "Solo el usuario puede agregar una liga" })
        }

        //Buscar el id del usuario que hace la peticion (No se para que)
        User.findOne({ _id: idUser }, (err, userFound) => {
            if (err) {
                return res.status(500).send({ message: "Error general" });
            } else if (userFound) {

                //Inyectar datos
                liga.nombres = params.nombres;
                liga.usuario = idUser;

                //Guardar las datos
                liga.save((err, ligaGuardada) => {
                    if (err) {
                        return res.status(500).send({ message: "Error general" });
                    } else if (ligaGuardada) {
                        return res.status(200).send({
                            message: "Liga guardada correctamente"
                        });
                    } else {
                        return res.status(500).send({
                            message: "Error al guardar el liga",
                        });
                    }
                });
            } else {
                return res.status(500).send({ message: "NO existe el usuario" });
            }
        });
    } else {
        return res.status(500).send({ message: "Error" });
    }
}


//  Editar un liga
function EditarLiga(req, res) {
    let LigaId = req.params.id;
    let params = req.body;

    //Validar parametros ingresados
    if (!params.nombres) {
        return res.status(500).send({ mensaje: "Paremetros incorrectos o incomplentos" })
    }

    //Busqueda para ver si el nombre ya existe
    Liga.find({
        nombres: params.nombres,
    }).exec((err, LigaEncontrada) => {
        if (err) return res.status(500).send({ mensaje: "Error" });
        if (LigaEncontrada.length >= 1) {
            return res.status(500).send({ mensaje: "La liga ya existe" })
        } else {

            //Busqueda para ver si la liga que se desea editar existe
            Liga.findOne({ _id: LigaId }).exec((err, ligaEncontrada) => {
                if (err) return res.status(500).send({ mensaje: "Error" });
                if (ligaEncontrada.length === 0) return res.status(500).send({ mensaje: "La liga que quiere editar no existe" });
                var idUsuario = ligaEncontrada.usuario;

                //Validar rol
                if (req.user.sub != idUsuario) {
                    return res.status(500).send({ mensaje: "Esta liga no te pertenece" })
                }

                //Eliminar parametro del usuario
                delete params.usuario;

                //Editar la liga
                Liga.findByIdAndUpdate(LigaId, params, { new: true }, (err, ligaActualizada) => {
                    if (err) return res.status(500).send({ mensaje: "Error en la solicitud" });
                    if (!ligaActualizada) return res.status(500).send({ mensaje: "No se ha podido editar la Liga" });
                    if (ligaActualizada) return res.status(200).send({ mensage: 'Liga actualizada correctamente' })
                })
            })
        }
    })
}


//  Eliminar una liga
function EliminarLiga(req, res) {
    let LigaId = req.params.id
    var idUsuario;

    //Buscar si la liga existe
    Liga.findOne({ _id: LigaId }).exec((err, ligaEncontrada) => {
        if (err) return res.status(500).send({ mensaje: "Error" });
        if (!ligaEncontrada) return res.status(500).send({ mensaje: "La liga no existe" })
        idUsuario = ligaEncontrada.usuario;

        //Validar usuario
        if (req.user.sub != idUsuario) {
            return res.status(500).send({ mensaje: "Este equipo no te pertenece" })
        }

        //Eliminar equipos de la liga
        equipo.deleteMany({ liga: LigaId }, { multi: true }, (err, equipoEliminado) => {
            if (err) return res.status(500).send({ mensaje: 'Error al eliminar Equipos' });
            if (!equipoEliminado) return res.status(500).send({ mensaje: "No hay equipos a eliminar" })

            //Eliminar la liga
            Liga.findByIdAndDelete(LigaId, (err, ligaEliminada) => {
                if (err) return res.status(500).send({ mensaje: "Error en la solicitud" });
                if (!ligaEliminada) return res.status(500).send({ mensaje: "No se ha podido eliminar la liga" });
                if (ligaEliminada) return res.status(200).send({ mensaje: "Elimando desde la base de datos correctamente" });
            })
        })
    })
}


//  Ver las ligas
function ObterLigas(req, res) {

    //Busqueda de las ligas
    Liga.find({usuario : req.user.sub},(err, ligaEncontrada) => {
        if (err) return res.status(500).send({ mensaje: "Error en la petición de Ligas" });
        if (ligaEncontrada.length === 0) return res.status(500).send({ mensaje: 'No existen las ligas' });
        return res.status(200).send({ ligaEncontrada })
    })
}


//  Buscar liga por id
function ligaId(req, res) {
    var idLiga = req.params.idLiga;

    //Hacer la busqueda
    Liga.findById(idLiga, (err, ligaEncontrada)=>{
        if (err) return res.status(500).send({ mensaje: "Error en la solicitud" });
        if (!ligaEncontrada) return res.status(500).send({mensaje: "La liga no existe"});
        return res.status(200).send({ligaEncontrada})
    })
}


module.exports = {
    CrearLiga,
    EditarLiga,
    EliminarLiga,
    ObterLigas,
    ligaId
}
