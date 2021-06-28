const pool = require('../config');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const tk = require('../tk.json');
const token = require('../_helpers/utils');
const sendVerificationEmail = require('../email/send_email');
const teacherFunctions = require('./teachers.functions');
const constants = require('../_helpers/constants');
const fs = require('fs');
const path = require("path");

let uploads = {};

//Get all teachers
const getTeachers = (request, response) => {
    console.log('entra en getTeachers');
    pool.query('SELECT "Usuarios"."Id", "Usuarios"."Username", "Usuarios"."NombreCompleto", "Usuarios"."Email",  "Usuarios"."Mobile", "Usuarios"."Direccion", "Usuarios"."Nro", "Usuarios"."Ciudad",' +
        ' "Usuarios"."Pais", "Usuarios"."Info", "Docentes"."Profesion" FROM "Usuarios", "Docentes" WHERE "Docentes"."Id_Usuario" = "Usuarios"."Id" ORDER BY "Id" ASC', (error, results) => {
            if (error) {
                throw error;
            }

            let allTeachers = [];

            for (var i = 0; i < results.rowCount; i++) {
                allTeachers.push({
                    Id: results.rows[i].Id,
                    Username: results.rows[i].Username,
                    NombreCompleto: results.rows[i].NombreCompleto,
                    Email: results.rows[i].Email,
                    Mobile: results.rows[i].Mobile,
                    Direccion: results.rows[i].Direccion,
                    Nro: results.rows[i].Nro,
                    Ciudad: results.rows[i].Ciudad,
                    Pais: results.rows[i].Pais,
                    Info: results.rows[i].Info,
                    Profesion: results.rows[i].Profesion
                });
            }

            response.status(200).json(allTeachers);
        });
};

//Get a single teacher
const getUserTeacherById = (request, response) => {
    console.log('entra en getUserTeacherById');
    id = parseInt(request.params.id);

    console.log(id);

    if (!Number.isNaN(id)) {
        pool.query('SELECT "Usuarios"."Id", "Usuarios"."Username", "Usuarios"."NombreCompleto", "Usuarios"."Email",  "Usuarios"."Mobile", "Usuarios"."Direccion", "Usuarios"."Esquina", "Usuarios"."Nro", "Usuarios"."Ciudad",' +
            ' "Usuarios"."Pais", "Usuarios"."Info", "Docentes"."Profesion" FROM "Usuarios", "Docentes" WHERE "Docentes"."Id_Usuario" = "Usuarios"."Id" AND "Docentes"."Id" = $1', [id], (error, results) => {
                if (error) {
                    throw error;
                }
                response.status(200).json(results.rows);
            });
    } else {
        return response.status(200).send({
            message: 'Id null'
        });
    }


};

//Get a single teacher
const getTeacherByUserId = (request, response) => {
    console.log('entra en getTeacherByUserId');
    id = parseInt(request.params.id);

    pool.query('SELECT "Docentes"."Id", "Docentes"."Profesion" FROM "Docentes" WHERE "Docentes"."Id_Usuario" = $1', [id], (error, results) => {
        if (error) {
            throw error;
        }

        let teacher = [];

        for (var i = 0; i < results.rowCount; i++) {
            teacher.push({ Id: results.rows[i].Id });
        }

        response.status(200).json(teacher);
    });
};

//Get all type asig
const getTypeAsig = (request, response) => {
    console.log('entra en getTypeAsig');
    pool.query('SELECT * FROM "Tipo_asignatura" ORDER BY "id" ASC', (error, results) => {
        if (error) {
            throw error;
        }

        let typeAsig = [];

        for (var i = 0; i < results.rowCount; i++) {
            typeAsig.push({ Id: results.rows[i].id, Nombre: results.rows[i].nombre });
        }

        response.status(200).json(typeAsig);
    });
};

//Get all type modality
const getTypeMod = (request, response) => {
    console.log('entra en getTypeMod');
    pool.query('SELECT * FROM "Modalidad" ORDER BY "id" ASC', (error, results) => {
        if (error) {
            throw error;
        }
        let typeMod = [];

        for (var i = 0; i < results.rowCount; i++) {
            typeMod.push({ Id: results.rows[i].id, Nombre: results.rows[i].nombre });
        }

        response.status(200).json(typeMod);
    });
};

//Get all type modality
const getNivel = (request, response) => {
    console.log('entra en getNivel');
    pool.query('SELECT * FROM "Nivel" ORDER BY "id" ASC', (error, results) => {
        if (error) {
            throw error;
        }
        let nivel = [];

        for (var i = 0; i < results.rowCount; i++) {
            nivel.push({ Id: results.rows[i].id, Nombre: results.rows[i].nombre });
        }

        response.status(200).json(nivel);
    });
};

//Get all files from teacher
const getFilesTeacher = (request, response) => {
    console.log('entra en getFilesTeacher');
    userName = request.params.userName;
    let filesDirectory = [];

    console.log(userName);

    if (fs.existsSync(`./assets/${userName}/`)) {
        const directoryPath = path.join("./assets", userName);
        console.log(directoryPath);

        fs.readdir(directoryPath, function(err, files) {
            if (err) {
                return response.status(400).send({
                    message: 'Error obteniendo información del directorio'
                });
            } else {
                files.forEach(function(file) {
                    console.log(file)
                    filesDirectory.push({ Archivo: file });
                })
                response.status(200).json(filesDirectory);
            }
        });
    }


};

//Get cal data
const getDataCalendar = (request, response) => {
    console.log('entra en getDataCalendar');
    id = parseInt(request.params.id);

    pool.query('SELECT "Calendario"."Id", "Calendario"."FechaInicio", "Calendario"."FechaFin", "Calendario"."IdAsignatura", "Calendario"."IdUsuario",' +
        ' "Calendario"."IdData", "Calendario"."CostoEstablecido", "Asignaturas"."id_nivel", "Asignaturas"."id_tipo_asignatura", "Tipo_asignatura"."nombre"' +
        ' FROM "Calendario"' +
        ' left join "Asignaturas" on "Calendario"."IdAsignatura" = "Asignaturas"."id"' +
        ' left join "Tipo_asignatura" on "Asignaturas"."id_tipo_asignatura" = "Tipo_asignatura"."id"' +
        ' left join "Nivel" on "Asignaturas"."id_nivel" = "Nivel"."id"' +
        ' WHERE "IdUsuario" = $1', [id], (error, results) => {
            if (error) {
                throw error;
            }

            let calByTeacher = [];

            for (var i = 0; i < results.rowCount; i++) {
                calByTeacher.push({
                    Id: results.rows[i].IdData,
                    FechaInicio: results.rows[i].FechaInicio,
                    FechaFin: results.rows[i].FechaFin,
                    IdAsignatura: results.rows[i].IdAsignatura,
                    IdUsuario: results.rows[i].IdUsuario,
                    IdNivel: results.rows[i].id_nivel,
                    IdTipoAsignatura: results.rows[i].id_tipo_asignatura,
                    NombreTipoAsignatura: results.rows[i].nombre,
                    CostoEstablecido: results.rows[i].CostoEstablecido
                });
            }

            response.status(200).json(calByTeacher);
        });
};

//Get timeAsigofCalendar
const getTimeAsigCalendar = (request, response) => {
    console.log('entra en getTimeAsigCalendar');
    id = parseInt(request.params.id);
    nameAsig = request.params.nameAsig;
    nameNivel = request.params.nameNivel;

    nameAsig = nameAsig.charAt(0).toUpperCase() + nameAsig.slice(1);
    nameAsig = "'%" + nameAsig + "%'";

    nameNivel = nameNivel.charAt(0).toUpperCase() + nameNivel.slice(1);
    nameNivel = "'%" + nameNivel + "%'";

    currentDate = new Date();

    /*
    console.log(currentDate);

    currentDateTwo = new Date().toLocaleString("en-US", { timeZone: "America/Montevideo" });
    console.log(currentDateTwo);
    */

    pool.query('SELECT "Calendario"."Id", "Calendario"."FechaInicio", "Calendario"."FechaFin", "Calendario"."CostoEstablecido"' +
        ' FROM "Calendario"' +
        ' left join "Asignaturas" on "Calendario"."IdAsignatura" = "Asignaturas"."id"' +
        ' left join "Tipo_asignatura" on "Asignaturas"."id_tipo_asignatura" = "Tipo_asignatura"."id"' +
        ' left join "Nivel" on "Asignaturas"."id_nivel" = "Nivel"."id"' +
        ' WHERE "IdUsuario" = $1' +
        ' AND "Calendario"."FechaInicio" > $2' +
        ' AND "Nivel"."nombre" LIKE ' + nameNivel +
        ' AND "Tipo_asignatura"."nombre" LIKE ' + nameAsig, [id, currentDate], (error, results) => {
            if (error) {
                throw error;
            }

            let calTimeAsigByTeacher = [];

            for (var i = 0; i < results.rowCount; i++) {
                const fechInicio = new Date(results.rows[i].FechaInicio).toLocaleString();
                const fechFin = new Date(results.rows[i].FechaFin).toLocaleString();

                calTimeAsigByTeacher.push({
                    Id: results.rows[i].Id,
                    FechaInicio: fechInicio,
                    FechaFin: fechFin,
                    CostoEstablecido: results.rows[i].CostoEstablecido
                });
            }

            response.status(200).json(calTimeAsigByTeacher);
        });
};

//Get all type asig
const getAsigByTeacher = (request, response) => {
    console.log('entra en getAsigByTeacher');
    id = parseInt(request.params.id);

    pool.query('SELECT "Asignaturas"."id", "Asignaturas"."id_tipo_asignatura", "Asignaturas"."id_docente", "Asignaturas"."id_nivel", "Asignaturas"."informarcion",' +
        ' "Tipo_asignatura"."nombre" as "TipoAsignaturaNombre", "Nivel"."nombre" as "NivelNombre"' +
        ' FROM "Asignaturas" ' +
        ' left join "Tipo_asignatura" on "Asignaturas"."id_tipo_asignatura" = "Tipo_asignatura"."id"' +
        ' left join "Nivel" on "Asignaturas"."id_nivel" = "Nivel"."id"' +
        ' WHERE "Asignaturas"."id_docente" = $1', [id], (error, results) => {
            if (error) {
                throw error;
            }

            let asigByTeacher = [];

            for (var i = 0; i < results.rowCount; i++) {
                asigByTeacher.push({
                    Id: results.rows[i].id,
                    Id_Docente: results.rows[i].id_docente,
                    Id_Nivel: results.rows[i].id_nivel,
                    Id_TipoAsig: results.rows[i].id_tipo_asignatura,
                    TipoAsignaturaNombre: results.rows[i].TipoAsignaturaNombre,
                    NivelNombre: results.rows[i].NivelNombre
                });
            }

            response.status(200).json(asigByTeacher);
        });
};

//Get all mod by teacher
const getModByTeacher = (request, response) => {
    console.log('entra en getModByTeacher');
    id = parseInt(request.params.id);

    pool.query('SELECT * FROM "Modalidad_docente" WHERE "Id_docente" = $1', [id], (error, results) => {
        if (error) {
            throw error;
        }

        let modByTeacher = [];

        for (var i = 0; i < results.rowCount; i++) {
            modByTeacher.push({ Id: results.rows[i].Id, Id_modalidad: results.rows[i].Id_modalidad, Id_docente: results.rows[i].Id_docente });
        }

        response.status(200).json(modByTeacher);
    });
};

//Get getNotifContByTeacher by teacher
const getNotifContByTeacher = (request, response) => {
    console.log('entra en getNotifContByTeacher');
    id = parseInt(request.params.id);

    let notiByTeacher = [];

    pool.query('Select "Notificaciones_cont"."Id", "usE"."NombreCompleto" as "NombreEstudiante", "Modalidad"."nombre" as "NombreModalidad", "Tipo_asignatura"."nombre" as "NombreAsignatura", "Calendario"."FechaInicio", "Calendario"."FechaFin", "Calendario"."CostoEstablecido"' +
        ' from "Notificaciones_cont"' +
        ' left join "Contratacion" on "Notificaciones_cont"."IdContratacion" = "Contratacion"."id"' +
        ' left join "Estudiantes" on "Contratacion"."IdEstudiante" = "Estudiantes"."Id"' +
        ' left join "Calendario" on "Contratacion"."IdCalendario" = "Calendario"."Id"' +
        ' left join "Usuarios" as "usE" on "Estudiantes"."Id_Usuario" = "usE"."Id"' +
        ' left join "Modalidad" on "Contratacion"."IdModalidad" = "Modalidad"."id"' +
        ' left join "Asignaturas" on "Calendario"."IdAsignatura" = "Asignaturas"."id"' +
        ' left join "Tipo_asignatura" on "Asignaturas"."id_tipo_asignatura" = "Tipo_asignatura"."id"' +
        ' where "Notificaciones_cont"."IdUsuarioNotificar" =   $1', [id], (error, results) => {
            if (error) {
                throw error;
            }

            var dateFormat = require('dateformat');

            for (var i = 0; i < results.rowCount; i++) {
                const fechInicio = new Date(results.rows[0].FechaInicio).toLocaleTimeString();
                const fechFin = new Date(results.rows[0].FechaFin).toLocaleTimeString();
                let horario = fechInicio + ' - ' + fechFin;

                const event = new Date(results.rows[0].FechaInicio);
                let fechaClase = dateFormat(event, "dd/mm/yyyy");

                notiByTeacher.push({
                    Id: results.rows[i].Id,
                    NombreEstudiante: results.rows[i].NombreEstudiante,
                    NombreModalidad: results.rows[i].NombreModalidad,
                    NombreAsignatura: results.rows[i].NombreAsignatura,
                    HorarioClase: horario,
                    FechaClase: fechaClase,
                    CostoEstablecido: results.rows[i].CostoEstablecido
                });
            }

            response.status(200).json(notiByTeacher);
        });
};

//Get getNotifContMensjByTeacher by teacher
const getNotifContMensjByTeacher = (request, response) => {
    console.log('entra en getNotifContMensjByTeacher');
    id = parseInt(request.params.id);
    notified = request.params.notified;

    let notiMensjByTeacher = [];
    let setEstado;

    if (notified === 'false') {
        setEstado = 0;
    } else {
        setEstado = 1;
    }

    pool.query('Select "Notificaciones_cont"."Id", "Notificaciones_cont"."Mensaje"' +
        ' from "Notificaciones_cont"' +
        ' where "Notificaciones_cont"."IdUsuarioNotificar" = $1 and "Notificaciones_cont"."Estado" = $2', [id, setEstado], (error, results) => {
            if (error) {
                throw error;
            }

            for (var i = 0; i < results.rowCount; i++) {
                notiMensjByTeacher.push({
                    Id: results.rows[i].Id,
                    Mensaje: results.rows[i].Mensaje
                });
            }

            response.status(200).json(notiMensjByTeacher);
        });
};

//Create a new teacher
const createTeacher = (request, response) => {
    //const { name, email } = request.body
    console.log('entra en createTeacher');

    const { username, completeName, email, password } = request.body;

    console.log('username ' + username);

    pool.query('SELECT "Username" FROM "Usuarios" WHERE "Username" = $1', [username], (error, results) => {
        if (results.rowCount > 0) {
            return response.status(400).send({
                message: 'Username "' + username + '" no se encuentra disponible'
            });
        } else {
            pool.query('INSERT INTO "Usuarios" ("Username", "NombreCompleto", "Email") VALUES ($1, $2, $3) RETURNING "Id"', [username, completeName, email], (error, results) => {
                if (error) {
                    throw error;
                }

                let user_id = results.rows[0].Id;
                // hash password
                var pass = bcrypt.hashSync(password, 10);

                pool.query('INSERT INTO "Docentes" ("Password", "Id_Usuario") VALUES ($1, $2) RETURNING "Id"', [pass, user_id], (error, results) => {
                    if (error) {
                        throw error;
                    }

                    let teacher_id = results.rows[0].Id;
                    let token_teacher = token(16);

                    pool.query('INSERT INTO "Verificacion_token" ("Docente_Id", "Token") VALUES ($1, $2)', [teacher_id, token_teacher],
                        (error, results) => {
                            if (error) {
                                throw error;
                            }

                            sendVerificationEmail(email, token_teacher);
                        }
                    );

                    response.status(201).json('Teacher added with ID:' + teacher_id);
                });
            });
        }
    });
};

const updateTeacher = (request, response) => {
    const id = parseInt(request.params.id)
    const { completeName, mobile, direccion, nro, esquina, ciudad, pais, info, profesion } = request.body.user;
    const { lat, lng } = request.body;

    let result_query;
    console.log(request.body.user);
    console.log(id);

    pool.query(
        'UPDATE "Usuarios" SET "NombreCompleto" = $1, "Mobile" = $2, "Direccion" = $3, "Nro" = $4, "Esquina" = $5, "Ciudad" = $6, "Pais" = $7, "Info" = $8 WHERE "Id" = $9', [completeName, mobile, direccion, nro, esquina, ciudad, pais, info, id], (error, results) => {
            if (error) {
                result_query = constants.User_updated_failed;
                throw error;
            }
            console.log(results);
            pool.query(
                'UPDATE "Docentes" SET "Profesion" = $1 WHERE "Id_Usuario" = $2', [profesion, id], (error, results) => {
                    if (error) {
                        result_query = constants.User_updated_failed;
                        throw error;
                    }
                    console.log(results);
                    pool.query('SELECT * FROM "Localizacion_usuario" WHERE "Id_Usuario" = $1', [id], (error, results) => {
                        if (results.rowCount > 0) {
                            pool.query('UPDATE "Localizacion_usuario" SET "Lat" = $1, "Long" = $2, "Id_Usuario" = $3 WHERE "Id_Usuario" = $3', [lat, lng, id],
                                (error, results) => {
                                    if (error) {
                                        result_query = constants.User_updated_failed;
                                        throw error;
                                    }
                                    result_query = constants.User_updated_successfully;
                                    console.log(results);
                                }
                            );
                        } else {
                            pool.query('INSERT INTO "Localizacion_usuario" ("Lat", "Long", "Id_Usuario") VALUES ($1, $2, $3)', [lat, lng, id],
                                (error, results) => {
                                    if (error) {
                                        result_query = constants.User_updated_failed;
                                        throw error;
                                    }
                                    result_query = constants.User_updated_successfully;
                                }
                            );
                        }
                        setTimeout(() => {
                            if (result_query === constants.User_updated_successfully) {
                                response.status(200).json('Teacher actualizado exitosamente');
                            } else {
                                return response.status(400).send({
                                    message: 'No se puedo actualizar los datos del usuario en este momento'
                                });
                            }
                        }, 100);
                    });
                }
            );
        }
    );
};

const updateNotifMensjCont = (request, response) => {
    console.log('entra en updateNotifMensjCont');
    const { element } = request.body;

    pool.query(
        'UPDATE "Notificaciones_cont" SET "Estado" = $1 WHERE "Id" = $2', [1, element['Id']], (error, results) => {
            if (error) {
                result_query = constants.User_updated_failed;
                throw error;
            }
            response.status(200).json('Notificaciones actualizadas');
        }
    );
};


//Delete a teacher
const deleteTeacher = (request, response) => {
    const id = parseInt(request.params.id);

    pool.query('DELETE FROM "Docentes" WHERE "Id" = $1', [id], (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).json('Teacher deleted with ID:' + results.rows[0].Id);
    });
};

//Create a new Asig
const createAsig = (request, response) => {
    //const { name, email } = request.body
    console.log('entra en createAsig');

    const { idTypeAsig, idNivel, idTeacher } = request.body;

    let asig_selected = [];
    let nivel_selected = [];

    pool.query('SELECT "id" FROM "Asignaturas" WHERE "id_tipo_asignatura" = $1 AND "id_nivel" = $2 AND "id_docente" = $3', [idTypeAsig, idNivel, idTeacher], (error, results) => {
        if (!results.rowCount > 0) {
            pool.query('INSERT INTO "Asignaturas" ("id_tipo_asignatura", "id_nivel", "id_docente") VALUES ($1, $2, $3) RETURNING "id"', [idTypeAsig, idNivel, idTeacher], (error, results) => {
                if (error) {
                    throw error;
                }
                let id_asig = results.rows[0].id;

                console.log(results);
                response.status(201).json(id_asig);

            });
        } else {
            pool.query('SELECT "nombre" FROM "Tipo_asignatura" WHERE "id" = $1', [idTypeAsig], (error, results) => {
                let nombre_tipo_asig = results.rows[0].nombre;
                pool.query('SELECT "nombre" FROM "Nivel" WHERE "id" = $1', [idNivel], (error, results) => {
                    let nombre_nivel = results.rows[0].nombre;
                    return response.status(400).send({
                        message: 'Asignatura: "' + nombre_tipo_asig + '", nivel: "' + nombre_nivel + '" ya se encuentra asignada al docente'
                    });
                });
            });
        }
    });
};

//Create a new Mod
const createMod = (request, response) => {
    console.log('entra en createMod');

    const { idMod, idTeacher } = request.body;

    pool.query('SELECT "Id" FROM "Modalidad_docente" WHERE "Id_modalidad" = $1 AND "Id_docente" = $2', [idMod, idTeacher], (error, results) => {
        if (!results.rowCount > 0) {
            pool.query('INSERT INTO "Modalidad_docente" ("Id_modalidad", "Id_docente") VALUES ($1, $2) RETURNING "Id"', [idMod, idTeacher], (error, results) => {
                if (error) {
                    throw error;
                }
                let id_mod = results.rows[0].Id;

                response.status(201).json(id_mod);

            });
        } else {
            pool.query('SELECT "nombre" FROM "Modalidad" WHERE "id" = $1', [idMod], (error, results) => {
                let nombre_mod = results.rows[0].nombre;
                return response.status(400).send({
                    message: 'Modalidad: "' + nombre_mod + '" ya se encuentra asignada al docente'
                });
            });
        }
    });
};

//Delete asig teacher
const deleteAsigTeacher = (request, response) => {
    const id = parseInt(request.params.id);

    pool.query('DELETE FROM "Asignaturas" WHERE "id" = $1', [id], (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).json('Asignatura deleted with ID: ' + id);
    });
};

//Delete asig teacher
const deleteModTeacher = (request, response) => {
    const id = parseInt(request.params.id);

    pool.query('DELETE FROM "Modalidad_docente" WHERE "Id" = $1', [id], (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).json('Modalidad deleted with ID: ' + id);
    });
};


//Create a new addDataCalendar
const addDataCalendar = (request, response) => {
    console.log('entra en addDataCalendar');

    const { dataCalendar, idUsuario } = request.body;
    let idDataCalendar = [];

    var loopEnd = new Promise((resolve, reject) => {
        for (const d of dataCalendar) {
            teacherFunctions.dataCalendar(d, idUsuario).then(function(result) {
                idDataCalendar.push(result)
            });
        }
        setTimeout(() => resolve(), 1000) // resolve
    });

    loopEnd.then(() => {
        console.log('Finish!');
        // response.status(201).json(idDataCalendar);

        pool.query('SELECT * FROM "Calendario" WHERE "IdUsuario" = $1', [idUsuario], (error, results) => {
            if (error) {
                throw error;
            }

            // FALTA RESPONDSE
            var loopDelete = new Promise((resolve, reject) => {
                for (var i = 0; i < results.rowCount; i++) {
                    console.log(results.rows[i]);
                    if (!idDataCalendar.includes(results.rows[i].Id)) {
                        pool.query('DELETE FROM "Calendario" WHERE "Id" = $1', [results.rows[i].Id], (error, results) => {
                            if (error) {
                                throw error;
                            }
                            console.log('deleted');
                        });
                    }
                }
                setTimeout(() => resolve(), 1000) // resolve
            });

            loopDelete.then(() => {
                response.status(200).json('Done operation in calendar');
            });

        });
    });
};

//Authenticate a teacher
const authenticateTeacher = (request, response) => {
    console.log('entra en authenticateTeacher');
    const { username, password, mobile } = request.body;

    teacherFunctions.checkTeacherStatus(username).then(function(result) {

        console.log('after 3 seconds', result)

        if (result == constants.User_activited) {
            pool.query('SELECT "Usuarios"."Username", "Usuarios"."NombreCompleto", "Usuarios"."Email", "Usuarios"."Mobile", "Docentes"."Id", "Docentes"."Id_Usuario", "Docentes"."Password", "Docentes" FROM "Usuarios", "Docentes"' +
                ' WHERE "Docentes"."Id_Usuario" = "Usuarios"."Id" AND "Usuarios"."Username" = $1', [username], (error, results, fields) => {
                    if (results.rowCount > 0) {
                        if (bcrypt.compareSync(password, results.rows[0].Password)) {
                            const token = jwt.sign({ sub: results.rows[0].Id }, tk.secret);
                            var mytoken = { "token": token };
                            results.rows.push(mytoken);

                            if (mobile) {
                                response.status(200).json({ Id: results.rows[0].Id_Usuario, Username: results.rows[0].Username, Nombre: results.rows[0].NombreCompleto, Mobile: results.rows[0].Mobile, Email: results.rows[0].Email, IdDocente: results.rows[0].Id, token: token });
                            } else {
                                let user = JSON.stringify({ Id: results.rows[0].Id_Usuario, Username: results.rows[0].Username, Nombre: results.rows[0].NombreCompleto, Email: results.rows[0].Email, IdDocente: results.rows[0].Id, token: token });
                                response.status(200).json(user);
                            }

                            //response.status(200).json(results.rows);
                        } else {
                            return response.status(400).send({
                                message: 'ErrorUserCheckData'
                            });
                        }
                    } else {
                        return response.status(400).send({
                            message: 'ErrorUserCheckData'
                        });
                    }
                });
        } else if (result == constants.User_not_exist) {

            return response.status(400).send({
                message: 'ErrorUserNotRegister'
            });

        } else {

            return response.status(400).send({
                message: 'ErrorUserNotAuth'
            });

            /*
            return response.status(400).send({
                message: 'Usuario aún no registrado, por favor registrese en la plataforma'
            });
            } else {
            return response.status(400).send({
                message: 'Usuario aún no autenticado, por favor verifique su correo y active su usuario'
            });
            */
        }
    });
};

//Verify a teacher
const verifyTeacher = (request, response) => {
    console.log('entra en verifyTeacher');
    const { email, token } = request.body;

    pool.query('SELECT "Status" FROM "Usuarios" WHERE "Email" = $1', [email], (error, results) => {
        console.log(results);
        if (results.rows[0].Status == 1) {
            response.status(202).json('Su correo ya ha sido verificado');
        } else if (results.rows[0].Status == 0) {
            pool.query('SELECT "Token", "Docente_Id" FROM "Verificacion_token" WHERE "Token" = $1', [token], (error, results) => {
                if (results.rowCount > 0) {
                    let teacher_id = results.rows[0].Docente_Id;
                    pool.query('SELECT "Id_Usuario" FROM "Docentes" WHERE "Id" = $1', [teacher_id], (error, results) => {
                        if (results.rowCount > 0) {
                            let user_id = results.rows[0].Id_Usuario;
                            pool.query('UPDATE "Usuarios" SET "Status" = $1 WHERE "Id" = $2', [1, user_id], (error, results) => {
                                console.log(results);
                                if (error) {
                                    return response.status(403).send({
                                        message: 'Verificación fallo'
                                    });
                                }
                                response.status(200).json('Teacher status modified with ID:' + teacher_id);
                            });
                        } else {
                            throw error;
                        }
                    });
                } else {
                    return response.status(404).send({
                        message: 'El token ha expirado'
                    });
                }
            });
        } else {
            return response.status(404).send({
                message: 'Correo no encontrado en el sistema'
            });
        }
    });
};

//Get uploadGetFileStatus
const uploadGetFileStatus = (req, res) => {
    console.log('entra en uploadGetFileStatus');

    let fileId = req.body['fileId'];
    let name = req.body['nameFile'];
    let fileSize = parseInt(req.body['sizeFile'], 10);
    let userName = req.body['userName'];
    console.log(name);
    if (name) {
        try {
            let stats = fs.statSync('assets/' + userName + '/' + name); //grabs file information and returns
            //checking file exists or not
            if (stats.isFile()) {
                console.log(`fileSize is ${fileSize} and already uploaded file size ${stats.size}`);
                if (fileSize == stats.size) {
                    res.send({ 'status': 'file is present' }) //returns if file exists
                    return;
                }
                if (!uploads[fileId])
                    uploads[fileId] = {}
                console.log(uploads[fileId]);
                uploads[fileId]['bytesReceived'] = stats.size; //checks total amount of file uploaded
                console.log(uploads[fileId], stats.size);
            }
        } catch (er) {

        }

    }
    let upload = uploads[fileId];
    if (upload)
        res.send({ "uploaded": upload.bytesReceived }); //returns to FrontEnd amout of bytes uploaded
    else
        res.send({ "uploaded": 0 });
};

//Get uploadTeacherFileUpload
const uploadTeacherFileUpload = (req, res) => {
    console.log('entra en uploadTeacherFileUpload');

    let fileId = req.headers['x-file-id'];
    let startByte = parseInt(req.headers['x-start-byte'], 10);
    let name = req.headers['name'];
    let userName = req.headers['username'];
    let fileSize = parseInt(req.headers['size'], 10);

    if (uploads[fileId] && fileSize == uploads[fileId].bytesReceived) {
        res.end();
        return;
    }

    if (!fileId) {
        res.writeHead(400, "No file id");
        res.end(400);
    }
    if (!uploads[fileId])
        uploads[fileId] = {};

    let upload = uploads[fileId]; //Bytes of file already present

    let fileStream;

    if (!fs.existsSync(`./assets/`)) {
        fs.mkdirSync(`./assets/`);
    }

    if (!fs.existsSync(`./assets/${userName}/`)) {
        fs.mkdirSync(`./assets/${userName}/`);
    }

    //checking bytes of file uploaded and sending to server
    if (!startByte) {
        upload.bytesReceived = 0;
        let name = req.headers['name'];
        fileStream = fs.createWriteStream(`./assets/${userName}/${name}`, {
            flags: 'w' //with "w"(write stream ) it keeps on adding data
        });
    } else {
        if (upload.bytesReceived != startByte) { //if same name file is sent with different size it will not upload
            res.writeHead(400, "Wrong start byte");
            res.end(upload.bytesReceived);
            return;
        }
        // append to existing file
        fileStream = fs.createWriteStream(`./assets/${userName}/${name}`, {
            flags: 'a'
        });
    }

    req.on('data', function(data) {
        upload.bytesReceived += data.length; //adding length of data we are adding
    });

    req.pipe(fileStream);

    // when the request is finished, and all its data is written
    fileStream.on('close', function() {
        console.log(upload.bytesReceived, fileSize);
        if (upload.bytesReceived == fileSize) {
            console.log("Upload finished");
            delete uploads[fileId];

            // can do something else with the uploaded file here
            res.send({ 'status': 'uploaded' });
            res.end();
        } else {
            // connection lost, leave the unfinished file around
            console.log("File unfinished, stopped at " + upload.bytesReceived);
            res.writeHead(500, "Server Error");
            res.end();
        }
    });

    // in case of I/O error - finish the request
    fileStream.on('error', function(err) {
        console.log("fileStream error", err);
        res.writeHead(500, "File error");
        res.end();
    });
};

//Modify file teacher
const modifyTeacherFiles = (request, response) => {
    console.log('entra en modifyTeacherFiles');
    const { obj, userName, oldName } = request.body;

    const directoryPath = path.join("./assets", userName, obj);
    const oldDirectoryPath = path.join("./assets", userName, oldName);

    fs.rename(oldDirectoryPath, directoryPath, function(err) {
        if (err) throw err;
        response.status(200).json('Archivo renombrado!');
    });
};

//Delete file teacher
const deleteTeacherFiles = (request, response) => {
    console.log('entra en deleteTeacherFiles');
    const obj = request.params.obj;
    const userName = request.params.userName;

    const directoryPath = path.join("./assets", userName, obj);

    fs.unlink(directoryPath, function(err) {
        if (err) throw err;
        response.status(200).json('Archivo eliminado!');
    });
};

module.exports = {
    uploadGetFileStatus,
    uploadTeacherFileUpload,
    getTeachers,
    getUserTeacherById,
    getTeacherByUserId,
    getTypeAsig,
    getTypeMod,
    getNivel,
    getFilesTeacher,
    getDataCalendar,
    getTimeAsigCalendar,
    getAsigByTeacher,
    getModByTeacher,
    getNotifContByTeacher,
    getNotifContMensjByTeacher,
    createTeacher,
    updateTeacher,
    updateNotifMensjCont,
    modifyTeacherFiles,
    deleteTeacher,
    deleteAsigTeacher,
    deleteModTeacher,
    deleteTeacherFiles,
    addDataCalendar,
    createAsig,
    createMod,
    authenticateTeacher,
    verifyTeacher,
};