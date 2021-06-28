import { Component, ViewEncapsulation, ViewChild, OnInit, Input } from '@angular/core';
import {
  remove, Browser, L10n, loadCldr, Internationalization, extend, createElement } from '@syncfusion/ej2-base';
import { Query, Predicate, DataManager } from '@syncfusion/ej2-data';
import { ToastComponent } from '@syncfusion/ej2-angular-notifications';
import { ClickEventArgs } from '@syncfusion/ej2-angular-buttons';
import { ItemModel, TreeViewComponent } from '@syncfusion/ej2-angular-navigations';
import {
  WeekService, ResizeService, DragAndDropService, EventSettingsModel, ActionEventArgs,
  ToolbarActionArgs, ScheduleComponent, CellClickEventArgs, TimeScaleModel,
  PopupOpenEventArgs, EJ2Instance, NavigatingEventArgs, WorkHoursModel
} from '@syncfusion/ej2-angular-schedule';
import { QuickPopups } from '@syncfusion/ej2-schedule/src/schedule/popups/quick-popups';
import { FieldValidator } from '@syncfusion/ej2-schedule/src/schedule/popups/form-validator';
import { DropDownList} from '@syncfusion/ej2-angular-dropdowns';
import { TranslateService } from '@ngx-translate/core';

import { InputObject, TextBox, NumericTextBox } from '@syncfusion/ej2-inputs';

import { CalendarSettings } from './calendar-settings';
import { DataService } from './data.service';

import * as numberingSystems from 'cldr-data/supplemental/numberingSystems.json';
import * as gregorian from 'cldr-data/main/es/ca-gregorian.json';
import * as numbers from 'cldr-data/main/es/numbers.json';
import * as timeZoneNames from 'cldr-data/main/es/timeZoneNames.json';

loadCldr(numberingSystems['default'], gregorian['default'], numbers['default'], timeZoneNames['default']);


L10n.load({
  'es': {
    'schedule': {
      'newEvent': 'Añadir Asignatura',
      "edit": "Editar",
      "editSeries": "Editar Serie",
      'editEvent': 'Editar Asignatura',
      "saveButton": "Guardar",
      "cancelButton": "Cancelar",
      "cancel": "Cancelar",
      "delete": "Eliminar",
      "deleteButton": "Eliminar",
      "deleteEvent": "Eliminar Evento",
      "deleteMultipleEvent": "Eliminar multiple Eventos",
      "deleteRecurrenceContent": "Quieres eliminar solamente este evento, o toda la serie?",
      "deleteContent": "Estas seguro que quieres eliminar este evento?",
      "deleteMultipleContent": "Estas seguro que quieres eliminar los eventos seleccionados?",
      "previous": "Anterior",
      "next": "Siguiente",
      "today": "Hoy"
    },
    'recurrenceeditor': {
      "none": "Ninguno",
      "daily": "Diario",
      "weekly": "Semanal",
      "monthly": "Mensual",
      "month": "Mes",
      "yearly": "Anual",
      "never": 'Nunca',
      "until": "Hasta",
      "count": "Contador",
      "first": "Primero",
      "second": "Segundo",
      "third": "Tercero",
      "fourth": "Cuarto",
      "last": "Ultimo",
      "repeat": "Repetir",
      "repeatEvery": "Repetir cada",
      "on": "Repetir en",
      "end": "Fin",
      "onDay": "Dia",
      "days": "Dia(s)",
      "weeks": "Semana(s)",
      "months": "Mes(s)",
      "years": "Año(s)",
      "every": "Cada",
      "summaryTimes": "tiempo(s)",
      "summaryOn": "en",
      "summaryUntil": "hasta",
      "summaryRepeat": "Repetir",
      "summaryDay": "dia(s)",
      "summaryWeek": "semana(s)",
      "summaryMonth": "mes(s)",
      "summaryYear": "año(s)"
  }
  }
});

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
  providers: [
    WeekService, ResizeService, DragAndDropService
  ],
  encapsulation: ViewEncapsulation.None
})
export class CalendarComponent implements OnInit {

  constructor(public dataService: DataService, public translate: TranslateService) {
    (QuickPopups.prototype as any).applyFormValidation = () => { };
    (FieldValidator.prototype as any).errorPlacement = this.dataService.errorPlacement;
    translate.addLangs([localStorage.getItem('translationCurrentLang')]);
    translate.setDefaultLang(localStorage.getItem('translationCurrentLang'));
  }

  @ViewChild('scheduleObj') scheduleObj: ScheduleComponent;
  @ViewChild('treeObj') treeObj: TreeViewComponent;
  @ViewChild('calendarToast') toastObj: ToastComponent;
  public position: Object = { X: 'Right', Y: 'Bottom' };
  public toastContent: string;
  public toastWidth = '580px';
  public calendarSettings: CalendarSettings;
  public isTreeItemDropped = false;
  public draggedItemId = '';
  public instance: Internationalization = new Internationalization();
  public initialLoad = true;
  public currentDate: Date;
  public selectedDate: Date;
  public locale: string = 'es';
  public eventSettings: EventSettingsModel;
  public resourceDataSource: Object[];
  public specialistCategory: { [key: string]: Object }[];
  public firstDayOfWeek: Number = 1;
  public startHour: string;
  public endHour: string;
  public timeScale: TimeScaleModel = { enable: true, interval: 60 };
  public currentView: string;
  public hospitalData: { [key: string]: Object }[];
  public activeDoctorData: Object[];
  public data: any = [];
  public eventData: Object[];
  public editBox: NumericTextBox;

  public workHours: WorkHoursModel = { start: '07:00', end: '23:30' };

  public teacherId: any;
  public userId: any;
  public nivelData: any;
  public calData: any;
  public calDataB: any;
  public tipoAsignaturaData: any;
  public asigData: any;

  loading = true;

  public nameValidation: (args: { [key: string]: string }) => boolean = (args: { [key: string]: string; }) => {
    return this.editBox.value !== null;
  }

  ngOnInit() {
    console.log('entra en ngOnInit');
    const user = JSON.parse(localStorage.getItem('currentUser'));
    this.userId = user['Id'];
    this.teacherId = user['IdDocente'];

    this.asigData = this.dataService.getAsignaturasTeacher(this.teacherId);
    this.calData = this.dataService.getDBDataCalendar(this.userId);
    setTimeout(() => {
      if (this.dataService.getTipoAsignaturas()) {
        this.tipoAsignaturaData = this.dataService.getTipoAsignaturas();
      } else {
        this.tipoAsignaturaData = [];
      }

      console.log(this.tipoAsignaturaData);
      this.loading = false;

      this.nivelData = this.dataService.getNivel();
      this.eventData = this.hospitalData = this.dataService.getDataCalendar();

      console.log(this.dataService.getDataCalendar());
      console.log(this.eventData);

      this.calendarSettings = this.dataService.getCalendarSettings();
      this.eventSettings = {
        dataSource: this.eventData,
        query: new Query(),
        fields: {
          subject: {
            name: 'Name'
          },
          description: {
            name: 'Description',
            validation: {
              required: [true, 'Por favor ingrese un costo para la clase'],
              range: [this.nameValidation, 'No se ingreso costo para la clase, por favor ingrese uno']
            }
          },
          startTime: { title: 'Desde', validation: { required: true } },
          endTime: { title: 'Hasta', validation: { required: true } }
        },
        resourceColorField: this.calendarSettings.bookingColor
      };
      this.specialistCategory = this.tipoAsignaturaData;
      this.activeDoctorData = [];
      this.resourceDataSource = this.nivelData;
      this.startHour = <string>this.calendarSettings.calendar['start'];
      this.endHour = <string>this.calendarSettings.calendar['end'];
      this.timeScale.interval = this.calendarSettings.interval;
      this.currentView = this.calendarSettings.currentView;
      this.firstDayOfWeek = this.calendarSettings.firstDayOfWeek;
      this.selectedDate = new Date();
      this.currentDate = this.selectedDate;
      if (Browser.isDevice) {
        this.toastWidth = '300px';
      }
    }, 500);

  }

  onActionBegin(args: ActionEventArgs & ToolbarActionArgs): void {
    console.log('entra en onActionBegin');
    if (args.requestType === 'eventCreate' || args.requestType === 'eventChange') {
      this.eventData = this.dataService.getDataCalendar();
      if (this.isTreeItemDropped) {
        const treeViewdata: { [key: string]: Object }[] = this.treeObj.fields.dataSource as { [key: string]: Object }[];
        this.treeObj.fields.dataSource = treeViewdata.filter((item: { [key: string]: Object }) =>
        item.Id !== parseInt(this.draggedItemId, 10));
        const elements: NodeListOf<HTMLElement> = document.querySelectorAll('.e-drag-item.treeview-external-drag');
        elements.forEach((node: HTMLElement) => remove(node));
      }
      const data: { [key: string]: Object } = (args.requestType === 'eventCreate' ? args.data[0] : args.data) as { [key: string]: Object };
      console.log(data);
      console.log(this.specialistCategory);
      console.log(this.nivelData);
      if (this.specialistCategory) {
        for (const n of this.nivelData) {
          if (data['DoctorId'] === n['Id']) {
            data['PatientId'] = n['IdAsig'];
          }
        }
        let text: string;
        for (const asig of this.specialistCategory) {
          if (data['DepartmentId'] === asig['DepartmentId']){
            data['Name'] = asig['Text'];
          }
        }
      }

      if (args.requestType === 'eventCreate') {
        data['Description']  = this.editBox.value;
      } else if (args.requestType === 'eventChange') {
        if (this.editBox.value != null) {
          data['Description']  = this.editBox.value;
        } else {
          for (const event of this.eventData) {
            if (data['Id'] === event['Id']) {
              data['Description'] = event['Description'];
            }
          }
        }
      }

      let eventCollection: Object[] = this.scheduleObj.eventBase.filterEvents(data.StartTime as Date, data.EndTime as Date);
      const predicate: Predicate = new Predicate('Id', 'notequal', data.Id as number)
        .and(new Predicate('DepartmentId', 'equal', data.DepartmentId as number))
        .and(new Predicate('DoctorId', 'equal', data.DoctorId as number));
      eventCollection = new DataManager({ json: eventCollection }).executeLocal(new Query().where(predicate));

      if (args.requestType === 'eventCreate') {
        if (this.isTreeItemDropped && this.activeDoctorData.length > 0) {
          this.hospitalData.push(data);
        }
      }
      this.isTreeItemDropped = false;
    }
    if (args.requestType === 'toolbarItemRendering') {
      console.log('entra en toolbarItemRendering');
      if (Browser.isDevice) {
        const doctorIcon: ItemModel = {
          align: 'Center',
          cssClass: 'app-doctor-icon',
          overflow: 'Show',
          prefixIcon: 'doctor-icon',
          showAlwaysInPopup: true
        };
        args.items.unshift(doctorIcon);
        args.items.splice(5, 1);
      } else {
        const specialistItem: ItemModel = { align: 'Center', cssClass: 'app-doctors' };
        args.items.unshift(specialistItem);
        args.items.splice(4, 2);
      }
    }
  }

  onActionComplete(args: ActionEventArgs): void {
    console.log('entra en onActionComplete');
    if (args.requestType === 'toolBarItemRendered') {
      console.log('entra en toolbarItemRendering onActionComplete');
      setTimeout(() => {
        const doctorsElement: HTMLElement = this.scheduleObj.element.querySelector('.app-doctors') as HTMLElement;
        const listObj: DropDownList = new DropDownList({
          cssClass: 'planner-dropdown',
          placeholder: 'Elija Asignatura',
          dataSource: this.tipoAsignaturaData,
          fields: { text: 'Text', value: 'Id' },
          popupHeight: 'auto',
          popupWidth: '195px',
          showClearButton: true,
          change: this.onDoctorSelect.bind(this),
          itemTemplate: '<div class="specialist-item">' +
            '<div class="doctor-details"><div class="name">${Text}</div></div></div>',
          width: '195px',
          // open: this.onMultiSelectOpen.bind(this)
        });
        listObj.appendTo(doctorsElement);
      }, 1000);
    }

    if (args.requestType === 'eventCreated' || args.requestType === 'eventChanged' || args.requestType === 'eventRemoved') {
      console.log('entra en eventCreated onActionComplete');

      this.dataService.addDateCalendar(this.hospitalData, this.userId);
    }
  }

  onPopupOpen(args: PopupOpenEventArgs) {
    console.log('entra en onPopupOpen');
    if (args.type === 'Editor') {
      this.scheduleObj.eventSettings.fields.subject = { name: 'Name', validation: { required: [true, 'Enter valid Patient Name'] } };
      console.log(this.scheduleObj.eventSettings.fields.subject);
      if (!Browser.isDevice) {
        const selectors: Array<string> = ['.e-DepartmentId-container .e-DepartmentId', '.e-DoctorId-container .e-DoctorId'];
        selectors.forEach((selector: string) => {
          const dropdownObj: DropDownList = (args.element.querySelector(selector) as EJ2Instance).ej2_instances[0] as DropDownList;
          dropdownObj.popupWidth = '224px';
        });
      }
      const formElement: HTMLElement = args.element.querySelector('.e-schedule-form');

      if (!args.element.querySelector('.custom-field-row')) {
        const row: HTMLElement = createElement('div', { className: 'custom-field-row' });
        formElement.firstChild.insertBefore(row, args.element.querySelector('.e-start-end-row'));
        const container: HTMLElement = createElement('div', { attrs: { class: 'control-label'} });
        container.innerHTML = 'Costo clase/hora';
        container.style.fontSize = '12px';
        container.style.fontWeight = 'bold';
        row.style.paddingBottom = '5px';
        row.appendChild(container);

        const rowtwo: HTMLElement = createElement('div', { className: 'custom-field-row-field' });
        formElement.firstChild.insertBefore(rowtwo, args.element.querySelector('.e-start-end-row'));

        const editBoxElement: HTMLInputElement = createElement('input', { attrs: { id: 'Description'} }) as HTMLInputElement;
        rowtwo.appendChild(editBoxElement);

        this.editBox = new NumericTextBox({
          format: 'c2',
          decimals: 2,
          validateDecimalOnType: true
        });
        this.editBox.appendTo(editBoxElement);
        const hid: HTMLElement = args.element.querySelector('.e-numeric-hidden');
        hid.hidden = true;
      }

      if (args.data['Description'] !== 0) {
        this.editBox.value = args.data['Description'];
      } else {
        args.data['Description'] = 0;
      }

      // const formElement: HTMLElement = args.element.querySelector('.e-schedule-form');
      const resor = document.getElementsByClassName('e-resources-row') as HTMLCollectionOf<HTMLElement>;
      for (var i = 0; i < resor.length; i++){
        formElement.firstChild.insertBefore(resor[i], args.element.querySelector('.e-title-location-row'));
      }
      const description = document.getElementsByClassName('e-description-row') as HTMLCollectionOf<HTMLElement>;
      for (var i = 0; i < description.length; i++){
        description[i].style.display = 'none';
      }
    }
    if (args.type === 'QuickInfo') {
      if (args.target.classList.contains('e-work-cells') || args.target.classList.contains('e-header-cells')) {
        this.scheduleObj.quickPopup.quickPopupHide(true);
        args.cancel = true;
      } else if (args.target.classList.contains('e-appointment')) {
        (<HTMLElement>args.element).style.boxShadow = `1px 2px 5px 0 ${(<HTMLElement>args.target).style.backgroundColor}`;
      }
    }
    if (args.type === 'EventContainer') {
      const eventElements: NodeListOf<HTMLElement> = args.element.querySelectorAll('.e-appointment');
      eventElements.forEach((element: HTMLElement) => {
        const colors: Array<string> = ['rgb(96, 242, 56)', 'rgb(254, 194, 0)'];
        if (colors.indexOf(element.style.backgroundColor) !== -1) {
          (element.querySelector('.e-subject') as HTMLElement).style.color = 'black';
        }
      });
    }
  }

  onEventRendered(args: any) {
    console.log('entra en onEventRendered');

    if (args.element.classList.contains('e-appointment')) {
      const data: { [key: string]: Object } = args.data as { [key: string]: Object };
      const eventStart = data.StartTime as Date;
      const eventEnd = data.EndTime as Date;
      let eventCollection = this.scheduleObj.blockProcessed;
      eventCollection = this.scheduleObj.eventBase.filterEvents(eventStart, eventEnd, eventCollection);
      if (eventCollection.length > 0) {
        args.cancel = true;
        return;
      }
      const colors: Array<string> = ['#60F238', '#fec200'];
      let eventColor: string;
      let result: { [key: string]: Object }[];

      if (this.eventSettings.resourceColorField === 'Doctors') {
        result = this.nivelData.filter((item: any) => item.Id === args.data.DoctorId);
      }
      /* else {
        result = this.specialistCategory.filter((item: any) => item.DepartmentId === args.data.DepartmentId);
      }
      */
      if (result && result.length > 0) {
        // eventColor = <string>result[0]['Color'];
      } else {
        eventColor = 'white';
      }
      if (colors.indexOf(eventColor) !== -1) {
        args.element.style.color = 'black';
      }
    }

  }

  onDataBound() {
    console.log('entra en onDataBound');
    if (this.initialLoad) {
      this.initialLoad = !this.initialLoad;
    }
  }

  getEventDetails(data: Object) {
    return (this.instance.formatDate(new Date(data['StartTime']), { type: 'date', skeleton: 'long' }) +
      '(' + this.getString(new Date(data['StartTime']), 'hm') + '-' + this.getString(new Date(data['EndTime']), 'hm') + ')');
  }

  getDoctorName(data: Object) {
    return this.nivelData.filter((item: { [key: string]: Object }) => item['Id'] === data['DoctorId'])[0]['Name'].toString();
  }

  getDepartmentName(id: number) {
    let text;
    for (const asig of this.specialistCategory) {
      if (id['DepartmentId'] === asig['DepartmentId']){
        text = asig['Text'];
      }
    }
    return text.toUpperCase();
  }

  onDoctorSelect(args: any): void {
    console.log('entra en onDoctorSelect');
    if (args.value) {
      this.refreshDataSource(args.itemData.DepartmentId, args.itemData.Id);
    } else {
      this.setDefaultData();
    }
  }

  refreshDataSource(deptId: string, doctorId: string) {
    console.log('entra en refreshDataSource');
    let filteredItems: any;
    for (const tipo of this.specialistCategory) {
      if (doctorId === tipo['Id']){
          filteredItems = tipo;
      }
    }
    this.activeDoctorData = filteredItems;
    // this.workHours = { start: filteredItems[0]['StartHour'], end: filteredItems[0]['EndHour'] };
    this.scheduleObj.workHours = this.workHours;
    if (filteredItems) {
      this.eventData = this.generateEvents(this.activeDoctorData);
    } else {
      this.eventData = this.hospitalData;
    }

    this.scheduleObj.resources[0].query = new Query().where('DepartmentId', 'equal', parseInt(deptId, 10));
    // this.scheduleObj.resources[1].query = new Query().where('Id', 'equal', parseInt(doctorId, 10));
    this.scheduleObj.eventSettings.dataSource = this.eventData;
  }

  getEventTime(data: any) {
    console.log('entra en getEventTime');
    return (this.getString(new Date(data.StartTime), 'MMMd') + ',' + this.getString(new Date(data.StartTime), 'hm') +
      '-' + this.getString(new Date(data.EndTime), 'hm'));
  }

  getString(value: Date, type: string) {
    return this.instance.formatDate(new Date(value), { type: 'dateTime', skeleton: type });
  }

  createNewEvent(args: ClickEventArgs) {
    console.log('entra en createNewEvent');
    let data: CellClickEventArgs;
    const isSameTime: boolean =
      this.scheduleObj.activeCellsData.startTime.getTime() === this.scheduleObj.activeCellsData.endTime.getTime();
    if (this.scheduleObj.activeCellsData && !isSameTime) {
      data = this.scheduleObj.activeCellsData;
    } else {
      const interval: number = this.scheduleObj.activeViewOptions.timeScale.interval;
      const slotCount: number = this.scheduleObj.activeViewOptions.timeScale.slotCount;
      const msInterval: number = (interval * 60000) / slotCount;
      const startTime: Date = new Date(this.scheduleObj.selectedDate.getTime());
      startTime.setHours(new Date().getHours(), Math.round(startTime.getMinutes() / msInterval) * msInterval, 0);
      const endTime: Date = new Date(new Date(startTime.getTime()).setMilliseconds(startTime.getMilliseconds() + msInterval));
      data = { startTime: startTime, endTime: endTime, isAllDay: false };
    }
    this.scheduleObj.openEditor(extend(data, { cancel: false, event: args.event }), 'Add');
  }

  getBackGroundColor(data: any) {
    let color: string;
    let fontColor: string;
    if (this.eventSettings.resourceColorField === 'Doctors') {
      color = this.nivelData.filter((item: { [key: string]: Object }) => item.Id === data.DoctorId)[0]['Color'] as string;
    } else {
      color = this.specialistCategory.filter((item: { [key: string]: Object }) =>
        item.DepartmentId === data.DepartmentId)[0]['Color'] as string;
    }
    const colors: Array<string> = ['#60F238', '#fec200'];
    if (colors.indexOf(color) !== -1) {
      fontColor = '#333333';
    } else {
      fontColor = '#FFFFFF';
    }
    return { 'background-color': color, color: fontColor };
  }

  onNavigation(args: NavigatingEventArgs) {
    console.log('entra en onNavigation');
    this.currentDate = args.currentDate || this.selectedDate;
    if (this.activeDoctorData.length > 0) {
      this.eventData = this.generateEvents(this.activeDoctorData);
      this.scheduleObj.eventSettings.dataSource = this.eventData;
    }
  }

  generateEvents(activeData: Object): Object[] {
    console.log('entra en generateEvents');
    const filteredEvents: Object[] = [];
    const datas: Object[] = this.hospitalData.filter((item: any) =>
    item['DepartmentId'] === activeData['DepartmentId']
            || (Array.isArray(item['DepartmentId']) && item['DepartmentId'].indexOf(activeData['IdAsig']) !== -1));
    datas.forEach((element: Object) => filteredEvents.push(element));
    return filteredEvents;
  }

  setDefaultData() {
    console.log('entra en setDefaultData');
    this.scheduleObj.resources[0].dataSource = this.specialistCategory;
    this.scheduleObj.resources[1].dataSource = this.resourceDataSource;
    this.scheduleObj.resources[0].query = new Query();
    this.scheduleObj.resources[1].query = new Query();
    this.eventData = this.hospitalData;
    this.scheduleObj.eventSettings.dataSource = this.eventData;
    this.scheduleObj.refreshEvents();
    this.startHour = '07:00';
    this.endHour = '23:30';
    this.workHours = { start: '07:00', end: '23:30' };
    this.scheduleObj.workHours = this.workHours;
    this.activeDoctorData = [];
  }
}
