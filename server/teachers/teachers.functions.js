const pool = require('../config');
const constants = require('../_helpers/constants');

async function checkTeacherStatus(username) {

    console.log('entra en checkTeacherStatus');

    let promise = new Promise((resolve, reject) => {
        pool.query('SELECT "Status" FROM "Usuarios" WHERE "Username" = $1', [username], (error, results) => {
            if (results.rowCount > 0) {
                if (results.rows[0].Status == 1) {
                    test = constants.User_activited;
                } else {
                    test = constants.User_not_activited;
                }
            } else {
                test = constants.User_not_exist;
            }
        });
        setTimeout(() => resolve(test), 1000) // resolve
    });

    let result = await promise;

    console.log('valor');
    console.log(result);

    return result;
}

async function dataCalendar(d, idUsuario, idDataCalendar) {

    console.log('test');

    let test;

    let promise = new Promise((resolve, reject) => {

        pool.query('SELECT * FROM "Calendario" WHERE "FechaInicio" = $1 AND "FechaFin" = $2 AND "IdAsignatura" = $3 AND "IdData" = $4 AND "IdUsuario" = $5 AND "CostoEstablecido" = $6', [d['StartTime'], d['EndTime'], d['PatientId'], d['Id'], idUsuario, d['Description']], (error, results) => {
            if (results.rowCount > 0) {
                console.log('No se Modifica');
                console.log('entra en rowCount');

                test = results.rows[0].Id;
                console.log(test);
                // console.log(results.rows[0].CostoEstablecido, results.rows[0].IdUsuario, results.rows[0].IdData, results.rows[0].IdAsignatura, results.rows[0].FechaFin, results.rows[0].FechaInicio);

            } else {
                pool.query('SELECT * FROM "Calendario" WHERE "IdAsignatura" = $1 AND "IdData" = $2 AND "IdUsuario" = $3', [d['PatientId'], d['Id'], idUsuario], (error, results) => {
                    if (results.rowCount > 0) {

                        pool.query('UPDATE "Calendario" SET "FechaInicio" = $1, "FechaFin" = $2, "CostoEstablecido" = $3  WHERE "IdUsuario" = $4 AND "IdData" = $5 RETURNING "Id"', [d['StartTime'], d['EndTime'], d['Description'], idUsuario, d['Id']], (error, results) => {
                            if (error) {
                                throw error;
                            }

                            console.log('Se Modifica');

                            console.log(results);
                            test = results.rows[0].Id;
                        });
                    } else {
                        pool.query('INSERT INTO "Calendario" ("FechaInicio", "FechaFin", "IdAsignatura", "IdData", "IdUsuario", "CostoEstablecido") VALUES ($1, $2, $3, $4, $5, $6) RETURNING "Id"', [d['StartTime'], d['EndTime'], d['PatientId'], d['Id'], idUsuario, d['Description']], (error, results) => {
                            if (error) {
                                throw error;
                            }

                            console.log('Inserta');

                            test = results.rows[0].Id;
                        });
                    }
                });
            }
        });

        setTimeout(() => resolve(test), 1000) // resolve
    });

    let result = await promise;

    return result;
}

module.exports = {
    checkTeacherStatus,
    dataCalendar,
};