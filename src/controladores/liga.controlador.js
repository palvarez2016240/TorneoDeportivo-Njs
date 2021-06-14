'use strict'

var User = require('../modelos/usuario.model');
var Liga = require('../modelos/liga.model')
   
    function CrearLiga(req, res) {
        let idUser = req.user.sub;
        let liga = new Liga();
        let params = req.body;
    
        if (params.nombres && idUser) {
            User.findOne({ _id: idUser }, (err, userFound) => {
                if (err) {
                    return res.status(500).send({message: "Error general" });
                } else if (userFound) {
                    Liga.findOne({ usuario: userFound._id }, (err, teamFound) => {
                        if (err) {
                            return res.status(500).send({message: "Error general" });
                        } else if (teamFound) {
                            return res.json({message: "Ese usuario ya creo una liga",});
                        } else {
                            liga.nombres = params.nombres;
                            liga.usuario = idUser;
                            liga.save((err, ligaGuardada) => {
                                if (err) {
                                    return res.status(500).send({ message: "Error general" });
                                } else if (ligaGuardada) {
                                    return res.json({
                                        message: "Liga guardada correctamente",ligaGuardada,});
                                } else {
                                    return res.json({
                                        message: "Error al guardar el liga",
                                    });
                                }
                            });
                        }
                    });
                } else {
                    return res.json({ message: "NO existe el usuario" });
                }
            });
        } else {
            return req.json({  message: "Error" });
        }
    }

    function EditarLiga(req, res) {
        let LigaId = req.params.id;
        let params = req.body;
        delete params.password;
        
        Liga.find({
             nombres: params.nombres, 
        
            }).exec((err, LigaEncontrada) => {
            if (err) return res.status(500).send({ mensaje: "Error en la solicitud de Equipo" });
            if (LigaEncontrada.length >= 1) {
                return res.status(500).send({ mensaje: "Listo ya ha actulizado el cambio" })
            } else {
                Liga.findOne({ _id: LigaId }).exec((err, ligaEncontrada) => {
                    if (err) return res.status(500).send({ mensaje: "Error en la solicitud ID de Equipo" });
                    if (!ligaEncontrada) return res.status(500).send({ mensaje: "No se ha encotrado estos datos en la base de datos" });
                    Liga.findByIdAndUpdate(LigaId, params, { new: true }, (err, ligaActualizada) => {
                    if (err) return res.status(500).send({ mensaje: "Error en la solicitud" });
                    if (!ligaActualizada) return res.status(500).send({ mensaje: "No se ha podido editar exitosamente el liga" });
                    if (ligaActualizada) return res.status(200).send({ mensage : 'Liga guardada correctamente',ligaActualizada, })
                    })
                })
            }
        })
    }

    function EliminarLiga(req, res) {
        let LigaId = req.params.id
    
        Liga.findOne({ _id: LigaId }).exec((err, ligaEncontrada) => {
            if (err) return res.status(500).send({ mensaje: "Error en la solicitud" });
            if (!ligaEncontrada) return res.status(500).send({ mensaje: "No se han encontrado los datos" })
            Liga.findByIdAndDelete(LigaId, (err, ligaEliminada) => {
            if (err) return res.status(500).send({ mensaje: "Error en la solicitud" });
            if (!ligaEliminada) return res.status(500).send({ mensaje: "No se ha podido eliminar la liga", ligaEliminada, });
            if (ligaEliminada) return res.status(200).send("Elimando desde la base de datos correctamente")
            })
        })
    }

    function ObterLigas(req, res){
        let LigaId = req.params.id;
        Liga.findById(LigaId, (err,ligaEncontrada)=>{
            if (err) return res.status(500).send({ mensaje: "Error en la petición de Ligas"});
            if(!ligaEncontrada) return res.status(500).send({ mensaje: 'Error al obtener las Ligas'});
            return res.status(200).send({ligaEncontrada})
        })
    }






module.exports = {
    CrearLiga,
    EditarLiga,
    EliminarLiga,
    ObterLigas
    
}