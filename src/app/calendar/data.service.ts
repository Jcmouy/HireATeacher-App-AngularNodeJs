import { Injectable } from '@angular/core';
import { CalendarSettings } from './calendar-settings';
import { createElement } from '@syncfusion/ej2-base';
import { UserService} from '../_services';
import { first } from 'rxjs/operators';
import { AlertService } from '../_alert';
import { niveles } from '../_helpers/constants';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  asignaturas: any;

  public nivelList = [];
  public tipoAsignaturaList = [];
  public nombretipoAsignaturaSave: any;
  public calendarSettings: CalendarSettings;
  public activityData: { [key: string]: Object }[];
  public tipoAsignaturaData: { [key: string]: Object }[];
  public nivelDataT: { [key: string]: Object }[];
  public calTeacherData: { [key: string]: Object }[];
  public calTeacherDataT: any;

  options = {
    autoClose: true,
    keepAfterRouteChange: true
  };

  constructor(
    private userService: UserService,
    protected alertService: AlertService
    ) {
    this.calendarSettings = {
      bookingColor: 'Doctors',
      calendar: {
        start: '07:00',
        end: '23:30'
      },
      currentView: 'Week',
      interval: 60,
      firstDayOfWeek: 0
    };
  }

  getAsignaturasTeacher(id) {
    return this.userService.getAsigByTeacher(id)
    .pipe(first())
    .subscribe(

        data => {

            this.asignaturas = data;
            for (const asig of this.asignaturas) {
              this.setTipoAsignaturas(asig['Id_TipoAsig'], asig['TipoAsignaturaNombre'], asig['Id']);
              this.setNivel(asig['Id_Nivel'], asig['NivelNombre'], asig['Id_TipoAsig'], asig['TipoAsignaturaNombre'], asig['Id']);
            }
        },
        error => {

          this.alertService.error(error, this.options);
        });
  }

  getDBDataCalendar(userId) {
    let calData = [];
    this.userService.getDataCalendar(userId)
    .pipe(first())
    .subscribe(
        data => {

            console.log('llego acá getDBDataCalendar');

            let dataCalendar: any;
            dataCalendar = data;

            for (const t of dataCalendar) {
              const n = {
                Id: t['Id'],
                Name: t['NombreTipoAsignatura'],
                StartTime: t['FechaInicio'],
                EndTime: t['FechaFin'],
                Description: t['CostoEstablecido'],
                DepartmentName: '',
                DepartmentId: t['IdTipoAsignatura'],
                DoctorId: t['IdNivel'],
                PatientId: t['IdAsignatura'],
                Symptoms: ''
              };
              calData.push(n);
            }

            this.calTeacherData = calData;
        },
        error => {
          this.alertService.error(error, this.options);
        });
  }

  setTipoAsignaturas(idTipoAsig, nombreTipoAsig, idAsig) {
    let names = [];

    let tipoAsignatura = {
      DepartmentId: idTipoAsig,
      Id: nombreTipoAsig,
      Text: nombreTipoAsig,
      Color: this.getRandomColor(),
      IdAsig: idAsig
    };

    if (this.tipoAsignaturaList.length === 0 ) {
      this.insertTipoAsignatura(tipoAsignatura);
    } else {
      for (const t of this.tipoAsignaturaList) {
        names.push(t.Text);
      }
      if (!names.includes(nombreTipoAsig)) {
        this.insertTipoAsignatura(tipoAsignatura);
      }
    }
  }

  insertTipoAsignatura(tipoAsignatura) {
    this.tipoAsignaturaList.push(tipoAsignatura);
    this.tipoAsignaturaData = this.tipoAsignaturaList;
  }

  setNivel(idNivel, nombreNivel, idtipoAsig, tipoAsig, idAsig) {
    let n = {
      Id: idNivel,
      DepartmentId: idtipoAsig,
      Name: nombreNivel,
      Text: nombreNivel,
      Color: this.getColorNivel(nombreNivel),
      Specialization: tipoAsig,
      IdAsig: idAsig
    };

    this.nivelList.push(n);
    this.nivelDataT = this.nivelList;
  }

  getTipoAsignaturas() {
    this.tipoAsignaturaList = [];
    return this.tipoAsignaturaData;
  }

  getNivel() {
    this.nivelList = [];
    return this.nivelDataT;
  }

  addDateCalendar(dataCalendar: { [key: string]: Object }[], userId) {
    console.log(dataCalendar);
    this.userService.addDataCalendar(dataCalendar, userId)
    .pipe(first())
    .subscribe(
        data => {

            const response = data;
            console.log(response);
            console.log('insert correctly');
            this.getDBDataCalendar(userId);
        },
        error => {
          this.alertService.error(error, this.options);
        });
  }

  getDataCalendar() {
    console.log('getDataCalendar');
    console.log(this.calTeacherData);
    return this.calTeacherData;
  }

  getCalendarSettings() {
    return this.calendarSettings;
  }

  getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  getColorNivel(nameNivel) {

    switch (nameNivel) {
      case niveles[0]:
        return '#ea7a57';
      case niveles[1]:
        return '#7fa900';
      case niveles[2]:
        return '#fec200';
      case niveles[3]:
        return '#865fcf';
      default:
        break;
    }
  }

  addActivityData(data: { [key: string]: Object }) {
    this.activityData.unshift(data);
  }

  getActivityData() {
    return this.activityData;
  }

  errorPlacement(inputElement: HTMLElement, error: HTMLElement): void {
    const id: string = error.getAttribute('for');
    const elem: Element = inputElement.parentElement.querySelector('#' + id + '_Error');
    if (!elem) {
      const div: HTMLElement = createElement('div', {
        className: 'field-error',
        id: inputElement.getAttribute('name') + '_Error'
      });
      const content: Element = createElement('div', { className: 'error-content' });
      content.appendChild(error);
      div.appendChild(content);
      inputElement.parentElement.parentElement.appendChild(div);
    }
  }

}
