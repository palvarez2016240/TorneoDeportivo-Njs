"use strict";

var User = require("../modelos/usuario.model");
var Equipo = require("../modelos/equipos.model");
var liga = require("../modelos/liga.model");
var fs = require('fs');
var path = require('path');


//  Buscar un equipo por su id
function BuscarEquipo(req, res) {

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

        //Validar que el que pide la solictud sea rol usuario
        if (req.user.rol != 'ROL_USER') {
            return res.status(500).send({ mensaje: "Solo el usuario puede agregar un equipo" })
        }

        //Se busca al usuario si existe
        User.findOne({ _id: idUser }, (err, userFound) => {
            if (err) {
                return res.status(500).send({ ok: false, message: "Error general" });
            } else if (userFound) {

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
                                    equipo.imagen = null;

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
    var nombreAntiguo;
    var ligaAntigua;

    //Verificar si el equipo existe
    Equipo.findOne({ _id: idEquipo }).exec((err, equipoEncontrado) => {
        if (err) return res.status(500).send({ mensaje: "Error" });
        if (!equipoEncontrado) return res.status(500).send({ mensaje: "El equipo no existe" })
        idUsuario = equipoEncontrado.usuario;
        nombreAntiguo = equipoEncontrado.nombres;
        ligaAntigua = equipoEncontrado.liga;

        //Validar rol
        if (req.user.sub != idUsuario) {
            return res.status(500).send({ mensaje: "Este equipo no te pertenece" })
        }

        //Validar parametros correctos para editar
        if (!params.nombres && !params.liga) {
            return res.status(500).send({ mensaje: "No hay ningun parametro correcto para editar" })
        }

        //Eliminar el parametro de usuario
        delete params.usuario;

        //Validar si lo que desea editar es el nombre
        if (nombreAntiguo != params.nombres) {

            //Verificar que el nuevo nombre no exista
            Equipo.find({
                $or: [
                    { nombres: params.nombres },
                ]
            }).exec((err, encontrados) => {
                if (err) return res.status(500).send({ mensaje: "Error en la peticion" });
                if (encontrados && encontrados.length >= 1) {
                    return res.status(500).send({ mensaje: "El equipo ya existe" });
                }
            })
        }

        //Verificar que no hayan mas de 10 equipos en la liga
        Equipo.find({ liga: params.liga }).exec((err, equipoEncontrado) => {
            if (err) return res.status(500).send({ mensaje: "Error" });
            if (equipoEncontrado && equipoEncontrado.length >= 10) {
                return res.status(500).send({ mensaje: "Solo puede haber 10 equipos por liga" })
            } else {

                //Validar si lo que desea editar es la liga
                if (ligaAntigua != params.liga) {

                    //Busqueda para ver si la liga existe
                    liga.findOne({ nombres: params.liga }).exec((err, ligaEncontrada) => {
                        if (err) return res.status(500).send({ mensaje: "Error" });
                        if (ligaEncontrada && ligaEncontrada.length === 0) return res.status(500).send({ mensaje: "La liga no existe" })
                    })
                }

                //Editar equipo
                Equipo.findByIdAndUpdate(idEquipo, params, { new: true }, (err, equipoActualizado) => {
                    if (err) return res.status(500).send({ mensaje: "Error" });
                    if (!equipoActualizado) return res.status(500).send({ mensaje: "No se ha podido editar el equipo" })
                    return res.status(200).send({ equipoActualizado })
                })

            }
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

        //Validar usuario
        if (req.user.sub != idUsuario) {
            return res.status(500).send({ mensaje: "Este equipo no te pertenece" })
        }

        //Eliminar el equipo
        Equipo.findByIdAndDelete(idEquipo, (err, equipoEliminado) => {
            if (err) return res.status(500).send({ mensaje: "Error" });
            if (!equipoEliminado) return res.status(500).send({ mensaje: "No se ha podido eliminar el equipo" });
            return res.status(200).send({ mensaje: "Equipo Eliminado" })
        })
    })
}


// Eliminar archivo no apto para imagen
function eliminarArchivo(res, rutaArchivo, mensaje) {

    //Elimina el archivo no apto 
    fs.unlink(rutaArchivo, (err) => {
        return res.status(500).send({ mensaje: mensaje })
    })
}


//  Subir imagen del equipo
function subirImagen(req, res) {
    var idEquipo = req.params.idEquipo

    //Busqueda para ver si el equipo existe
    Equipo.findOne({ _id: idEquipo }).exec((err, equipoEncontrado) => {
        if (err) return res.status(500).send({ mensaje: "Error" });
        if (!equipoEncontrado) return res.status(500).send({ mensaje: "El equipo no existe" })
        var idUsuario = equipoEncontrado.usuario;

        //Validar dueño del equipo
        if (req.user.sub != idUsuario) {
            return res.status(500).send({ mensaje: "Este equipo no te pertenece" })
        }

        //Validar que se haya subido un archivo
        if (req.files) {

            //En esta variable se guardara la ruta de la imagen
            var direccionArchivo = req.files.imagen.path;

            //Se elimina las diagonales invertidas de la ruta
            var direccion_split = direccionArchivo.split('\\');

            //En esta variable se guarda el nombre del archivo
            var nombre_archivo = direccion_split[3];

            //En esta variable se separa el nombre del archivo de su extension  
            var extension_archivo = nombre_archivo.split('.');

            //Se guarda el nombre de la extension
            var nombre_extension = extension_archivo[1].toLowerCase();

            //Se valida que la extasion del archivo sea correcta
            if (nombre_extension === 'png' || nombre_extension === 'jpg' || nombre_extension === 'gif') {

                //Se sube la imagen del equipo
                Equipo.findByIdAndUpdate(idEquipo, { imagen: nombre_archivo }, { new: true }, (err, usuarioEncontrado) => {
                    return res.status(200).send({ usuarioEncontrado });
                })
            } else {

                //Se elimina el archivo subido no permitido
                return eliminarArchivo(res, direccionArchivo, 'Tipo de imagen no permitida');
            }
        } else {
            return res.status(500).send({ mensaje: "No se ha subido ningun archivo" })
        }
    })
}


//  Obtener la imagen
function obtenerImagen(req, res) {
    var nombreImagen = req.params.imagen;
    var rutaArchivo = `./src/imagenes/equipos/${nombreImagen}`;

    //Funcion para obtener la imagen en archivo
    fs.access(rutaArchivo, ((err) => {
        if (err) {
            return res.status(500).send({ mensaje: "No existe la imagen" });
        } else {
            return res.sendFile(path.resolve(rutaArchivo));
        }
    }))
}

module.exports = {
    CrearEquipo,
    BuscarEquipo,
    equiposLiga,
    editarEquipo,
    eliminarEquipo,
    subirImagen,
    obtenerImagen
};
