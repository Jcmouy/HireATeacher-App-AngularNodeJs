const token = require('../_helpers/utils');
const constants = require('../_helpers/constants');
const pool = require('../config');

//Create a new student
async function createStudent(Username, Nombre, Email, Mobile, Otp) {
    console.log('entra en createStudent');

    let api_key;
    let new_user_id;
    let response;
    let res;

    let promise = new Promise((resolve, reject) => {

        let check_user = isUserExist(Mobile);

        if (!check_user) {

            api_key = token(16);

            pool.query('INSERT INTO "Usuarios" ("Username", "NombreCompleto", "Email", "Mobile") VALUES ($1, $2, $3, $4) RETURNING "Id"', [Username, Nombre, Email, Mobile], (error, results) => {
                if (error) {
                    response = constants.User_create_failed;
                }

                new_user_id = results.rows[0].Id;

                pool.query('INSERT INTO "Estudiantes" ("Apikey", "Id_Usuario") VALUES ($1, $2) RETURNING "Id"', [api_key, new_user_id], (error, results) => {
                    if (error) {
                        response = constants.User_create_failed;
                        resolve(response);
                    }

                    student_id = results.rows[0].Id;

                    createOtp(student_id, Otp);

                    console.log('Id estudiante ' + student_id);
                    console.log('Estudiante creado satisfactoriamente' + constants.User_created_successfully);

                    response = constants.User_created_successfully;
                    resolve(response);
                });
            });
        } else {
            console.log('Estudiante ya existe en el sistema' + User_alredy_existed);
            response = constants.User_alredy_existed;
            resolve(response);
        }

    });

    res = await promise;
    return res;

}

function isUserExist(mobile) {
    console.log('entra en isUserExist');

    pool.query('SELECT "Id" FROM "Usuarios" WHERE "Mobile" = $1 AND "Status" = $2', [mobile, 1], (error, results) => {
        if (results.rowCount > 0) {
            return true;
        } else {
            return false;
        }
    });
}

function createOtp(student_id, otp) {
    console.log('entra en createOtp');

    pool.query('SELECT "Estudiante_Id" FROM "Sms_codigos" WHERE "Estudiante_Id" = $1', [student_id], (error, results) => {
        if (results.rowCount > 0) {
            pool.query('DELETE FROM "Sms_codigos" WHERE "Estudiante_Id" = $1', [student_id], (error, results) => {
                if (error) {
                    throw error;
                }
            });
        }
    });

    pool.query('INSERT INTO "Sms_codigos" ("Estudiante_Id", "Codigo", "Status") VALUES ($1, $2, $3)', [student_id, otp, 0], (error, results) => {
        if (error) {
            throw error;
        }
    });
}

async function activateUser(otp_int) {
    console.log('entra en activateUser');

    let result_query;
    let res;

    let promise = new Promise((resolve, reject) => {

        pool.query('SELECT "Usuarios"."Id", "Sms_codigos"."Estudiante_Id", "Usuarios"."Username", "Usuarios"."NombreCompleto", "Usuarios"."Email", "Usuarios"."Mobile", "Estudiantes"."Apikey", "Sms_codigos"."Status", "Usuarios"."Fecha_creado" ' +
            ' FROM "Usuarios" left join "Estudiantes" on "Estudiantes"."Id_Usuario" = "Usuarios"."Id" left join "Sms_codigos" on "Sms_codigos"."Estudiante_Id" = "Estudiantes"."Id" WHERE "Sms_codigos"."Codigo" =  $1', [otp_int], (error, results) => {
                if (error) {
                    throw error;
                }

                let id_user = results.rows[0].Id;
                let id_student = results.rows[0].Estudiante_Id;
                id_user = id_user.toString();
                id_student = id_student.toString();

                activateUserStatus(id_user, id_student);

                let Status;
                if (activateUserStatus(id_user, id_student)) {
                    Status = true;
                } else {
                    Status = true;
                }

                let user = JSON.stringify({ Id: results.rows[0].Id, Username: results.rows[0].Username, Nombre: results.rows[0].NombreCompleto, Email: results.rows[0].Email, Mobile: results.rows[0].Mobile, Api_key: results.rows[0].Api_key, Status: Status, Fecha_creado: results.rows[0].Fecha_creado });

                resolve(user);
            });
    });

    result_query = await promise;
    return result_query;
}

function getUser(otp_int) {
    pool.query('SELECT "Usuarios"."Id", "Sms_codigos"."Estudiante_Id", "Usuarios"."Username", "Usuarios"."NombreCompleto", "Usuarios"."Email", "Usuarios"."Mobile", "Estudiantes"."Apikey", "Sms_codigos"."Status", "Usuarios"."Fecha_creado" ' +
        ' FROM "Usuarios" left join "Estudiantes" on "Estudiantes"."Id_Usuario" = "Usuarios"."Id" left join "Sms_codigos" on "Sms_codigos"."Estudiante_Id" = "Estudiantes"."Id" WHERE "Sms_codigos"."Codigo" =  $1', [otp_int], (error, results) => {
            if (error) {
                throw error;
            }
            console.log('entra aqui1');
            console.log(results);
            return results;
        });
}

function activateUserStatus(id_user, id_student) {
    console.log('entra en activateUserStatus');

    pool.query('UPDATE "Usuarios" set "Status"=($1) where "Id"=($2)', [1, id_user], (error, results) => {
        if (error) {
            throw error;
        }
    });

    pool.query('UPDATE "Sms_codigos" set "Status"=($1) where "Estudiante_Id"=($2)', [1, id_student], (error, results) => {
        if (error) {
            throw error;
        }
    });

}

module.exports = {
    createStudent,
    activateUser,
};