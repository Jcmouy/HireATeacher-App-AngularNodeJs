const pool = require('../config');
const bcrypt = require('bcryptjs');
const send_sms = require('../sms/send_sms');
const send_smsNew = require('../sms/send_smsNew');
const studentFunctions = require('./students.functions');
const constants = require('../_helpers/constants');
const constantsNotif = require('../_helpers/constantsNotif');
const mercadopago = require('mercadopago');
const tkMercado = require('../tkMercado.json');

//Get all teachers
const getStudents = (request, response) => {
    pool.query('SELECT * FROM "Usuarios" ORDER BY "Id" ASC', (error, results) => {
        if (error) {
            throw error;
        }
        console.log(response);
        response.status(200).json(results.rows);
    });
};

//Get a single student
const getStudentById = (request, response) => {
    id = parseInt(request.params.id);

    pool.query('SELECT * FROM "Usuarios" WHERE "Id" = $1', [id], (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).json(results.rows);
    });
};

//Update location and teachers of Asig
const getlocationAsig = (request, response) => {
    console.log('entra en getlocationAsig');
    nameAsig = request.params.nameAsig;

    nameAsig = nameAsig.charAt(0).toUpperCase() + nameAsig.slice(1);
    nameAsig = "'%" + nameAsig + "%'";
    console.log(nameAsig);

    currentDate = new Date();

    let idLastUser;
    let nivelAsig;
    let modalidadAsig;
    let teacherAsig = [];
    let element = {};
    let lastNivel = [];
    let lastModalidad = [];

    pool.query('SELECT "Usuarios"."Id", "Usuarios"."Username", "Usuarios"."NombreCompleto", "Usuarios"."Email", "Usuarios"."Status", "Usuarios"."Mobile",' +
        ' "Usuarios"."Fecha_creado", "Usuarios"."Direccion", "Usuarios"."Nro", "Usuarios"."Esquina", "Usuarios"."Ciudad", "Pais", "Usuarios"."Info",' +
        ' "Docentes"."Id" as "Docente_Id", "Docentes"."Profesion", "Localizacion_usuario"."Id" as "Localizacion_Id", "Localizacion_usuario"."Lat",' +
        ' "Localizacion_usuario"."Long", "Tipo_asignatura"."nombre" as "Asignatura", "Asignaturas"."id" as "AsignaturaId", "Nivel"."nombre" as "Nivel", "Modalidad"."nombre" as "Modalidad"' +
        ' FROM "Usuarios"' +
        ' left join "Docentes" on "Usuarios"."Id" = "Docentes"."Id_Usuario"' +
        ' left join "Localizacion_usuario" on "Usuarios"."Id" = "Localizacion_usuario"."Id_Usuario"' +
        ' left join "Asignaturas" on "Docentes"."Id" = "Asignaturas"."id_docente"' +
        ' left join "Tipo_asignatura" on "Asignaturas"."id_tipo_asignatura" = "Tipo_asignatura"."id"' +
        ' left join "Modalidad_docente" on "Docentes"."Id" = "Modalidad_docente"."Id_docente"' +
        ' left join "Modalidad" on "Modalidad_docente"."Id_modalidad" = "Modalidad"."id"' +
        ' left join "Nivel" on "Asignaturas"."id_nivel" = "Nivel"."id"' +
        ' left join "Calendario" on "Usuarios"."Id" = "Calendario"."IdUsuario"' +
        ' Where "Calendario"."FechaInicio" > $1' +
        ' AND "Tipo_asignatura"."nombre" LIKE ' + nameAsig, [currentDate], (error, results) => {
            if (results.rowCount > 0) {
                let contNivel = 1;
                let contModalidad = 1;
                for (var i = 0; i < results.rowCount; i++) {
                    if (idLastUser != null) {
                        if (results.rows[i].Id != idLastUser) {
                            teacherAsig.push({
                                Id: results.rows[i].Id,
                                Username: results.rows[i].Username,
                                NombreCompleto: results.rows[i].NombreCompleto,
                                Email: results.rows[i].Email,
                                Status: results.rows[i].Status,
                                Mobile: results.rows[i].Mobile,
                                Direccion: results.rows[i].Direccion,
                                Nro: results.rows[i].Nro,
                                Esquina: results.rows[i].Esquina,
                                Ciudad: results.rows[i].Ciudad,
                                Pais: results.rows[i].Pais,
                                Info: results.rows[i].Info,
                                DocenteId: results.rows[i].Docente_Id,
                                Profesion: results.rows[i].Profesion,
                                LocalizacionId: results.rows[i].Localizacion_Id,
                                Lat: results.rows[i].Lat,
                                Long: results.rows[i].Long,
                                Asignatura: results.rows[i].Asignatura,
                                AsignaturaId: results.rows[i].AsignaturaId,
                                Nivel: results.rows[i].Nivel,
                                Modalidad: results.rows[i].Modalidad
                            });
                            lastNivel = [];
                            lastModalidad = [];
                        } else {
                            objIndex = teacherAsig.findIndex((obj => obj.Id == idLastUser));
                            element = teacherAsig[objIndex];

                            if (!lastNivel.includes(results.rows[i].Nivel)) {
                                lastNivel.push(results.rows[i].Nivel)
                                nivelAsig = 'Nivel' + [contNivel];
                                element[nivelAsig] = results.rows[i].Nivel;
                                contNivel++;
                            }

                            if (!lastModalidad.includes(results.rows[i].Modalidad)) {
                                lastModalidad.push(results.rows[i].Modalidad)
                                modalidadAsig = 'Modalidad' + [contModalidad];
                                element[modalidadAsig] = results.rows[i].Modalidad;
                                contModalidad++;
                            }

                        }
                    } else {
                        teacherAsig.push({
                            Id: results.rows[i].Id,
                            Username: results.rows[i].Username,
                            NombreCompleto: results.rows[i].NombreCompleto,
                            Email: results.rows[i].Email,
                            Status: results.rows[i].Status,
                            Mobile: results.rows[i].Mobile,
                            Direccion: results.rows[i].Direccion,
                            Nro: results.rows[i].Nro,
                            Esquina: results.rows[i].Esquina,
                            Ciudad: results.rows[i].Ciudad,
                            Pais: results.rows[i].Pais,
                            Info: results.rows[i].Info,
                            DocenteId: results.rows[i].Docente_Id,
                            Profesion: results.rows[i].Profesion,
                            LocalizacionId: results.rows[i].Localizacion_Id,
                            Lat: results.rows[i].Lat,
                            Long: results.rows[i].Long,
                            Asignatura: results.rows[i].Asignatura,
                            AsignaturaId: results.rows[i].AsignaturaId,
                            Nivel: results.rows[i].Nivel,
                            Modalidad: results.rows[i].Modalidad
                        });
                        lastNivel.push(results.rows[i].Nivel);
                        lastModalidad.push(results.rows[i].Modalidad);
                    }
                    idLastUser = results.rows[i].Id;
                }
                response.status(200).json(teacherAsig);
            } else {
                return response.status(400).send({
                    message: 'No se encontraron cursos que cumplan con ese criterio'
                });
            }
        });
};

//Get getNotificationHire by teacher
const getNotificationHire = (request, response) => {
    console.log('entra en getNotificationHire');
    mobileEstudiante = request.params.mobileEstudiante;

    let notiMensjByStudent = [];

    pool.query('SELECT "Usuarios"."Id", "Usuarios"."Mobile"' +
        ' FROM "Usuarios"' +
        ' WHERE "Usuarios"."Mobile" = $1', [mobileEstudiante], (error, results) => {
            if (results.rowCount > 0) {
                let id_usu_estudiante = results.rows[0].Id;

                pool.query('Select "Notificaciones_cont"."Id", "Notificaciones_cont"."Mensaje"' +
                    ' from "Notificaciones_cont"' +
                    ' where "Notificaciones_cont"."IdUsuarioNotificar" = $1 and "Notificaciones_cont"."Estado" = $2', [id_usu_estudiante, 0], (error, results) => {
                        if (error) {
                            throw error;
                        }

                        for (var i = 0; i < results.rowCount; i++) {
                            notiMensjByStudent.push({
                                Id: results.rows[i].Id,
                                Mensaje: results.rows[i].Mensaje
                            });
                        }

                        response.status(200).json(notiMensjByStudent);
                    });
            } else {
                response.status(400).json('No hay notificaciones para móvil');
            }
        });
};

//Get getNotificationVal by teacher
const getNotificationVal = (request, response) => {
    console.log('entra en getNotificationVal');
    mobileEstudiante = request.params.mobileEstudiante;

    let notiValByStudent = [];
    let notiValStudent = false;
    let notiValByTeacher = [];
    let notiValTeacher = false;
    let allNotiVal = [];

    pool.query('SELECT "Usuarios"."Id", "Usuarios"."Mobile"' +
        ' FROM "Usuarios"' +
        ' WHERE "Usuarios"."Mobile" = $1', [mobileEstudiante], (error, results) => {
            if (results.rowCount > 0) {
                let id_usu_estudiante = results.rows[0].Id;

                pool.query('Select "Notificaciones_val"."Id", "Notificaciones_val"."IdUsuarioValorado", "Usuarios"."NombreCompleto", "Calendario"."FechaFin"' +
                    ' from "Notificaciones_val"' +
                    ' left join "Contratacion" on "Notificaciones_val"."IdContratacion" = "Contratacion"."id" ' +
                    ' left join "Calendario" on "Contratacion"."IdCalendario" = "Calendario"."Id" ' +
                    ' left join "Usuarios" on "Notificaciones_val"."IdUsuarioValorado" = "Usuarios"."Id" ' +
                    ' where "Notificaciones_val"."IdUsuarioDisparador" = $1 and "Notificaciones_val"."Estado" = $2 LIMIT 1', [id_usu_estudiante, 0], (error, results) => {
                        if (results.rowCount > 0) {
                            if (error) {
                                throw error;
                            }

                            for (var i = 0; i < results.rowCount; i++) {
                                const fechFin = new Date(results.rows[i].FechaFin).toLocaleString();

                                notiValByStudent.push({
                                    Id: results.rows[i].Id,
                                    IdUsuarioValorado: results.rows[i].IdUsuarioValorado,
                                    NombreUsuarioValorado: results.rows[i].NombreCompleto,
                                    FechaFin: fechFin

                                });
                            }

                            notiValStudent = true;
                        }

                        pool.query('Select "Notificaciones_val"."Id", "Notificaciones_val"."IdUsuarioDisparador", "Notificaciones_val"."Feedback", "Notificaciones_val"."FeedbackVal", "Usuarios"."NombreCompleto", "Calendario"."FechaFin"' +
                            ' from "Notificaciones_val"' +
                            ' left join "Contratacion" on "Notificaciones_val"."IdContratacion" = "Contratacion"."id" ' +
                            ' left join "Calendario" on "Contratacion"."IdCalendario" = "Calendario"."Id" ' +
                            ' left join "Usuarios" on "Notificaciones_val"."IdUsuarioDisparador" = "Usuarios"."Id" ' +
                            ' where "Notificaciones_val"."IdUsuarioValorado" = $1 and "Notificaciones_val"."Estado" = $2', [id_usu_estudiante, 1], (error, results) => {
                                if (results.rowCount > 0) {
                                    if (error) {
                                        throw error;
                                    }

                                    for (var i = 0; i < results.rowCount; i++) {
                                        const fechFin = new Date(results.rows[i].FechaFin).toLocaleString();

                                        notiValByTeacher.push({
                                            Id: results.rows[i].Id,
                                            IdUsuarioDisparador: results.rows[i].IdUsuarioDisparador,
                                            NombreUsuarioDisparador: results.rows[i].NombreCompleto,
                                            Feedback: results.rows[i].Feedback,
                                            FeedbackVal: results.rows[i].FeedbackVal,
                                            FechaFin: fechFin
                                        });
                                    }

                                    notiValTeacher = true;
                                }

                                if (notiValStudent && notiValTeacher) {
                                    allNotiVal.push({
                                        notifStudent: notiValByStudent,
                                        notifTeacher: notiValByTeacher
                                    });
                                    response.status(200).json(allNotiVal);
                                } else if (notiValStudent && !notiValTeacher) {
                                    allNotiVal.push({
                                        notifStudent: notiValByStudent
                                    });
                                    response.status(200).json(allNotiVal);
                                } else if (!notiValStudent && notiValTeacher) {
                                    allNotiVal.push({
                                        notifTeacher: notiValByTeacher
                                    });
                                    response.status(200).json(allNotiVal);
                                } else {
                                    response.status(400).json('No hay notificaciones de valoración para este usuario');
                                }
                            });
                    });
            } else {
                response.status(400).json('No hay notificaciones de valoración para móvil');
            }
        });
};

//Create a new student
const sendStudentSMS = (request, response) => {
    console.log('entra en send_sms');

    const { Username, Nombre, Email, Mobile } = request.body;

    let min = 100000;
    let max = 999999;

    let Otp = Math.floor(Math.random() * (max - min + 1) + min);
    let res;

    // res = studentFunctions.createStudent(Username, Nombre, Email, Mobile, Otp);

    studentFunctions.createStudent(Username, Nombre, Email, Mobile, Otp).then(function(result) {

        res = result;
        console.log(res);

        if (res == constants.User_created_successfully) {
            console.log('Usuario creado exitosamente');

            //send_sms(Mobile, Otp); //HACERLO
            send_smsNew(Mobile, Otp); //HACERLO

            return response.status(200).send({
                message: 'Pedido por SMS inicio, por favor aguarde!'
            });
        } else if (res == constants.User_create_failed) {
            console.log('error en el registro');
            return response.status(400).send({
                message: 'Se ha producido un error en el registro'
            });
        } else {
            console.log('Número móvil ya existe');
            return response.status(400).send({
                message: 'Número móvil ya existe'
            });
        }

    });
};

//Create a new contratacion
const setHire = (request, response) => {
    console.log('entra en setHire');

    const { idCalendario, mobileEstudiante, nameModalidad } = request.body;

    pool.query('SELECT "id" FROM "Modalidad" WHERE "nombre" = $1', [nameModalidad], (error, results) => {
        if (error) {
            throw error;
        }
        let id_modalidad = results.rows[0].id;

        pool.query('SELECT "Usuarios"."Id", "Usuarios"."Mobile", "Estudiantes"."Id" as "Estudiantes_Id"' +
            ' FROM "Usuarios"' +
            ' left join "Estudiantes" on "Usuarios"."Id" = "Estudiantes"."Id_Usuario"' +
            ' WHERE "Usuarios"."Mobile" = $1', [mobileEstudiante], (error, results) => {
                if (error) {
                    throw error;
                }
                let id_estudiante = results.rows[0].Estudiantes_Id;

                pool.query('INSERT INTO "Contratacion" ("IdCalendario", "IdEstudiante", "IdModalidad") VALUES ($1, $2, $3) RETURNING "id"', [idCalendario, id_estudiante, id_modalidad], (error, results) => {
                    if (error) {
                        throw error;
                    }
                    response.status(201).json(results.rows[0]);
                });
            });
    });
};

//Create a new contratacion
const setHireNotification = (request, response) => {
    console.log('entra en setHireNotification');

    const { idContratacion, mensaje, tipeNotification } = request.body;

    pool.query('INSERT INTO "Notificaciones_obj" ("TipoNotificacion") VALUES ($1) RETURNING "Id"', [tipeNotification], (error, results) => {
        if (error) {
            throw error;
        }
        let id_notObj = results.rows[0].Id;
        pool.query('INSERT INTO "Notificaciones" ("IdNotificacionObj") VALUES ($1)', [id_notObj], (error, results) => {
            if (error) {
                throw error;
            }
            pool.query('Select "Calendario"."IdUsuario" as "IdDocente", "Estudiantes"."Id_Usuario" as "IdEstudiante",' +
                ' "usE"."NombreCompleto" as "NombreEstudiante", "usD"."NombreCompleto" as "NombreDocente" ' +
                ' from "Contratacion" ' +
                ' left join "Estudiantes" on "Contratacion"."IdEstudiante" = "Estudiantes"."Id" ' +
                ' left join "Calendario" on "Contratacion"."IdCalendario" = "Calendario"."Id" ' +
                ' left join "Usuarios" as "usE" on "Estudiantes"."Id_Usuario" = "usE"."Id" ' +
                ' left join "Docentes" on "Calendario"."IdUsuario" = "Docentes"."Id_Usuario" ' +
                ' left join "Usuarios" as "usD" on "Docentes"."Id_Usuario" = "usD"."Id" ' +
                ' where "Contratacion"."id" = $1', [idContratacion], (error, results) => {
                    if (error) {
                        throw error;
                    }

                    let id_estudiante = results.rows[0].IdEstudiante;
                    let id_docente = results.rows[0].IdDocente;
                    let nombreEstudiante = results.rows[0].NombreEstudiante;
                    let nombreDocente = results.rows[0].NombreDocente;

                    pool.query('INSERT INTO "Notificaciones_cont" ("IdContratacion", "IdNotificacionObj", "Mensaje", "IdUsuarioDisparador", "IdUsuarioNotificar") VALUES ($1,$2,$3,$4,$5)', [idContratacion, id_notObj, 'El usuario: ' + nombreEstudiante + ' lo ha contratado', id_estudiante, id_docente], (error, results) => {
                        if (error) {
                            throw error;
                        }
                        pool.query('INSERT INTO "Notificaciones_cont" ("IdContratacion", "IdNotificacionObj", "Mensaje", "IdUsuarioDisparador", "IdUsuarioNotificar") VALUES ($1,$2,$3,$4,$5)', [idContratacion, id_notObj, 'Se ha realizado satisfactoriamente la contratacion del docente: ' + nombreDocente, id_estudiante, id_estudiante], (error, results) => {
                            if (error) {
                                throw error;
                            }
                            response.status(201).json('Se creó correctamente las notificaciones');
                        });
                    });


                });
        });
    });

};

//Create a new setNotificationVal
const setNotificationVal = (request, response) => {
    console.log('entra en setNotificationVal');

    const { idContratacion, tipeNotification } = request.body;

    pool.query('INSERT INTO "Notificaciones_obj" ("TipoNotificacion") VALUES ($1) RETURNING "Id"', [tipeNotification], (error, results) => {
        if (error) {
            throw error;
        }
        let id_notObj = results.rows[0].Id;
        pool.query('INSERT INTO "Notificaciones" ("IdNotificacionObj") VALUES ($1)', [id_notObj], (error, results) => {
            if (error) {
                throw error;
            }
            pool.query('Select "Calendario"."IdUsuario" as "IdDocente", "Estudiantes"."Id_Usuario" as "IdEstudiante",' +
                ' "usE"."NombreCompleto" as "NombreEstudiante", "usD"."NombreCompleto" as "NombreDocente" ' +
                ' from "Contratacion" ' +
                ' left join "Estudiantes" on "Contratacion"."IdEstudiante" = "Estudiantes"."Id" ' +
                ' left join "Calendario" on "Contratacion"."IdCalendario" = "Calendario"."Id" ' +
                ' left join "Usuarios" as "usE" on "Estudiantes"."Id_Usuario" = "usE"."Id" ' +
                ' left join "Docentes" on "Calendario"."IdUsuario" = "Docentes"."Id_Usuario" ' +
                ' left join "Usuarios" as "usD" on "Docentes"."Id_Usuario" = "usD"."Id" ' +
                ' where "Contratacion"."id" = $1', [idContratacion], (error, results) => {
                    if (error) {
                        throw error;
                    }

                    let id_estudiante = results.rows[0].IdEstudiante;
                    let id_docente = results.rows[0].IdDocente;

                    pool.query('INSERT INTO "Notificaciones_val" ("IdContratacion", "IdNotificacionObj", "IdUsuarioDisparador", "IdUsuarioValorado") VALUES ($1,$2,$3,$4)', [idContratacion, id_notObj, id_estudiante, id_docente], (error, results) => {
                        if (error) {
                            throw error;
                        }
                        pool.query('INSERT INTO "Notificaciones_val" ("IdContratacion", "IdNotificacionObj", "IdUsuarioDisparador", "IdUsuarioValorado") VALUES ($1,$2,$3,$4)', [idContratacion, id_notObj, id_docente, id_estudiante], (error, results) => {
                            if (error) {
                                throw error;
                            }
                            response.status(201).json('Se creó correctamente las notificaciones de valoración');
                        });
                    });


                });
        });
    });

};

//SetFilterCosto
const setFilterCosto = (request, response) => {
    console.log('entra en SetFilterCosto');

    const { nameAsig, costoInicial, costoFinal } = request.body;

    console.log(request.body);
    let nameAs = nameAsig;

    nameAs = nameAs.charAt(0).toUpperCase() + nameAs.slice(1);
    nameAs = "'%" + nameAs + "%'";
    console.log(nameAs);

    pool.query('Select "Calendario"."IdUsuario", "Localizacion_usuario"."Id"' +
        ' from "Calendario"' +
        ' left join "Localizacion_usuario" on "Calendario"."IdUsuario" = "Localizacion_usuario"."Id_Usuario"' +
        ' left join "Asignaturas" on "Calendario"."IdAsignatura" = "Asignaturas"."id"' +
        ' left join "Tipo_asignatura" on "Asignaturas"."id_tipo_asignatura" = "Tipo_asignatura"."id"' +
        ' where "Calendario"."CostoEstablecido" >= $1' +
        ' AND "Calendario"."CostoEstablecido" <= $2' +
        ' AND "Tipo_asignatura"."nombre" LIKE ' + nameAs, [costoInicial, costoFinal], (error, results) => {
            if (error) {
                throw error;
            }
            let arrayLoc = [];

            for (var i = 0; i < results.rowCount; i++) {
                arrayLoc.push({ IdUsuario: results.rows[i].IdUsuario, LocUsuario: results.rows[i].Id });
            }

            response.status(200).json(arrayLoc);
        });
};

//setFilterHorario
const setFilterHorario = (request, response) => {
    console.log('entra en setFilterHorario');

    const { nameAsig, dateStartTime, dateEndTime } = request.body;

    console.log(request.body);
    let nameAs = nameAsig;

    nameAs = nameAs.charAt(0).toUpperCase() + nameAs.slice(1);
    nameAs = "'%" + nameAs + "%'";
    console.log(nameAs);

    pool.query('Select "Calendario"."IdUsuario", "Localizacion_usuario"."Id"' +
        ' from "Calendario"' +
        ' left join "Localizacion_usuario" on "Calendario"."IdUsuario" = "Localizacion_usuario"."Id_Usuario"' +
        ' left join "Asignaturas" on "Calendario"."IdAsignatura" = "Asignaturas"."id"' +
        ' left join "Tipo_asignatura" on "Asignaturas"."id_tipo_asignatura" = "Tipo_asignatura"."id"' +
        ' where "Calendario"."FechaInicio" >= $1' +
        ' AND "Calendario"."FechaFin" <= $2' +
        ' AND "Tipo_asignatura"."nombre" LIKE ' + nameAs, [dateStartTime, dateEndTime], (error, results) => {
            if (error) {
                throw error;
            }
            let arrayLoc = [];

            for (var i = 0; i < results.rowCount; i++) {
                arrayLoc.push({ IdUsuario: results.rows[i].IdUsuario, LocUsuario: results.rows[i].Id });
            }

            response.status(200).json(arrayLoc);
        });
};

//setFeedbackTeacher
const setFeedbackTeacher = (request, response) => {
    console.log('entra en setFeedbackTeacher');

    const { idNotification, feedback, feedbackVal } = request.body;

    pool.query(
        'UPDATE "Notificaciones_val" SET "Estado" = $1, "Feedback" = $2, "FeedbackVal" = $3 WHERE "Id" = $4', [1, feedback, feedbackVal, idNotification], (error, results) => {
            if (error) {
                result_query = constants.User_updated_failed;
                throw error;
            }
            response.status(200).json(results.rows);
        }
    );
};


//Verify OTP student
const verifyOtp = (request, response) => {
    console.log('entra en verify otp');

    const { Otp } = request.body;

    let otp_int = parseInt(Otp, 10);

    studentFunctions.activateUser(otp_int).then(function(result) {

        let user = JSON.parse(result);

        if (!user['Nombre'] == '') {
            response.status(201).json(user);
        } else {
            return response.status(400).send({
                message: 'Lo sentimos!, en este momento no fue posible crear la cuenta'
            });
        }

    });
};

//Set location student
const updateLocation = (request, response) => {
    console.log('entra en updateLocation');

    const { mobile, lat, lng } = request.body;

    pool.query('SELECT "Id" FROM "Usuarios" WHERE "Mobile" = $1', [mobile], (error, results) => {
        if (error) {
            throw error;
        }
        user_id = results.rows[0].Id;

        pool.query('SELECT * FROM "Localizacion_usuario" WHERE "Id_Usuario" = $1', [user_id], (error, results) => {
            if (results.rowCount > 0) {
                pool.query(
                    'UPDATE "Localizacion_usuario" SET "Lat" = $1, "Long" = $2 WHERE "Id_Usuario" = $3', [lat, lng, user_id], (error, results) => {
                        if (error) {
                            throw error;
                        }
                        // response.status(201).json('Student location modified with ID: ' + results.rows[0].Id);
                        response.status(201).json(results.rows[0]);
                    }
                );
            } else {
                pool.query('INSERT INTO "Localizacion_usuario" ("Lat", "Long", "Id_Usuario") VALUES ($1, $2, $3)', [lat, lng, user_id],
                    (error, results) => {
                        if (error) {
                            throw error;
                        }
                        // response.status(201).json('Student location added with ID:' + user_id);
                        response.status(201).json(results);
                    }
                );
            }
        });
    });
};

//Update data in student
const updateStudent = (request, response) => {
    const id = parseInt(request.params.id)
    const { username, completeName, email, password } = request.body;

    pool.query('SELECT "Username" FROM "Usuarios" WHERE "Username" = $1', [username], (error, results) => {
        if (results.rowCount > 0) {
            return response.status(400).send({
                message: 'Username "' + username + '" no se encuentra disponible'
            });
        } else {
            pool.query(
                'UPDATE "Usuarios" SET "Username" = $1, "NombreCompleto" = $2, "Email" = $3, "Password" = $4 WHERE "Id" = $5', [username, completeName, email, password, id],
                (error, results) => {
                    if (error) {
                        throw error;
                    }
                    response.status(200).json('Student modified with ID: ' + results.rows[0].Id);
                }
            );
        }
    });
};

// Update updateStudentNotifMensjCont
const updateStudentNotifMensjCont = (request, response) => {
    console.log('entra en updateStudentNotifMensjCont');
    const { idNotif } = request.body;

    pool.query(
        'UPDATE "Notificaciones_cont" SET "Estado" = $1 WHERE "Id" = $2', [1, idNotif], (error, results) => {
            if (error) {
                result_query = constants.User_updated_failed;
                throw error;
            }
            response.status(200).json(results.rows);
        }
    );
};

//Update data in student
const startCallCheckout = (request, response) => {
    const { email, money, teacher } = request.body;

    // let intMoney = parseInt(money, 10);

    console.log(money);
    console.log(email);
    console.log(teacher);
    let intMoney = parseFloat(money);

    mercadopago.configure({
        access_token: tkMercado.accessTk
    });

    var preference = {}

    var item = {
        title: 'Contratacion HireATeacher',
        description: 'Contratacion clases particulares dictada por:' + teacher,
        quantity: 1,
        currency_id: 'UYU',
        unit_price: intMoney
    }

    console.log(item);

    var payer = {
        email: email
    }

    preference.items = [item]
    preference.payer = payer

    mercadopago.preferences.create(preference).then(function(data) {
        response.status(200).json(data);
    }).catch(function(error) {
        response.status(400).json(error);
    });
};

//Delete a student
const deleteStudent = (request, response) => {
    const id = parseInt(request.params.id);

    pool.query('DELETE FROM "Usuarios" WHERE "Id" = $1', [id], (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).json(`Student deleted with ID:` + results.rows[0].Id);
    });
};

module.exports = {
    getStudents,
    getStudentById,
    getlocationAsig,
    getNotificationHire,
    getNotificationVal,
    sendStudentSMS,
    setHireNotification,
    setNotificationVal,
    setFilterCosto,
    setFilterHorario,
    setFeedbackTeacher,
    verifyOtp,
    updateLocation,
    updateStudentNotifMensjCont,
    startCallCheckout,
    setHire,
    updateStudent,
    deleteStudent,
};