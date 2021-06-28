import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpHeaders } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class UserService {
    constructor(private http: HttpClient) { }

    getAll() {
        return this.http.get<any[]>(`/teachers`);
    }

    getById(id) {
      return this.http.get(`/teachers/${id}`);
    }

    getTeacherById(id) {
      return this.http.get(`/teachers/user/${id}`);
    }

    getAsigByTeacher(id) {
      return this.http.get(`/teachers/teachAsig/${id}`);
    }

    getDataCalendar(id) {
      return this.http.get(`/teachers/teachCal/${id}`);
    }

    getTeacherFiles(userName) {
      return this.http.get(`/teachers/teachFiles/${userName}`);
    }

    getTimeAsigCalendar(id, nameAsig, nameNivel) {
      return this.http.get(`/teachers/teachCalTime/${id}/${nameAsig}/${nameNivel}`);
    }

    getModByTeacher(id) {
      return this.http.get(`/teachers/teachMod/${id}`);
    }

    getNotifContByTeacher(id) {
      return this.http.get(`/teachers/teachNotifCont/${id}`);
    }

    getNotifContMensjByTeacher(id, notified) {
      return this.http.get(`/teachers/teachNotifContMensj/${id}/${notified}`);
    }

    // Fijarse si la razon por la cual no anda es / lo que viene despues no sabe, por lo cual entra en el otro
    getTipoAsignaturas() {
      return this.http.get<any[]>(`/teachers/tipoAsignaturas`);
    }

    getModalidad() {
      return this.http.get<any[]>(`/teachers/modalidad`);
    }

    getNivel() {
      return this.http.get<any[]>(`/teachers/nivel`);
    }

    register(user) {
        return this.http.post(`/teachers/register`, user);
    }

    registerAsignatura(idTypeAsig, idNivel, idTeacher) {
      return this.http.post(`/teachers/registerAsignatura`, {idTypeAsig, idNivel, idTeacher});
    }

    registerModalidad(idMod, idTeacher) {
      return this.http.post(`/teachers/registerModalidad`, {idMod, idTeacher});
    }

    addDataCalendar(dataCalendar, idUsuario) {
      return this.http.post(`/teachers/addDataCalendar`, {dataCalendar, idUsuario});
    }

    verification(email, token) {
      return this.http.post(`/teachers/verification`, {email, token});
    }

    update(id, user, lat, lng) {
      return this.http.post(`/teachers/update/${id}`, {user, lat, lng});
    }

    updateNotifCont(element) {
      return this.http.post(`/teachers/updateNotifCont`, {element});
    }

    uploadFileStatus(fileId, nameFile, sizeFile, userName) {
      return this.http.post(`/teachers/uploadFileStatus`, {fileId, nameFile, sizeFile, userName});
    }

    uploadFileUpload(fileId, uploadedBytes, nameU, userName, selectedFile) {
      const headers2 = new HttpHeaders({
        size: selectedFile.size.toString(),
        "x-file-id": fileId,
        "x-start-byte": uploadedBytes.toString(),
        name: nameU,
        "userName": userName
      });

      return new HttpRequest(
        "POST",
        "/teachers/uploadFileUpload",
        selectedFile.slice(uploadedBytes, selectedFile.size + 1),
        {
          headers: headers2,
          reportProgress: true
        }
      );
    }

    modifyTeacherFiles(obj, userName, oldName) {
      return this.http.post(`/teachers/teachModifyFiles`, {obj, userName, oldName});
    }

    delete(id) {
        return this.http.delete(`/teachers/${id}`);
    }

    deleteAsig(id) {
      return this.http.delete(`/teachers/asig/${id}`);
    }

    deleteMod(id) {
      return this.http.delete(`/teachers/mod/${id}`);
    }

    deleteTeacherFiles(obj, userName) {
      return this.http.delete(`/teachers/teachDeleteFiles/${obj}/${userName}`);
    }
}
