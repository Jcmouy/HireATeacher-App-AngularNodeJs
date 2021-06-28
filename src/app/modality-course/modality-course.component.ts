import { Component, OnInit, AfterViewInit } from '@angular/core';
import { UserService} from '../_services';
import { first } from 'rxjs/operators';
import { AlertService } from '../_alert';
import { FormBuilder, FormGroup} from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-table-list',
  templateUrl: './modality-course.component.html',
  styleUrls: ['./modality-course.component.css']
})
export class ModalityCourseComponent implements OnInit, AfterViewInit {

  tipoAsignatuas: any;
  modalidades: any;
  niveles: any;
  teacherId: any;
  teacherAsig: any;
  teacherMod: any;

  asigTable: FormGroup;
  modTable: FormGroup;

  checkedIDs = [];
  checkedMods = [];

  selectedNivItemsList = [];
  test = [];
  testM = [];

  inserta = false;
  loading = true;

  options = {
    autoClose: true,
    keepAfterRouteChange: true
  };

  constructor(
    private userService: UserService,
    protected alertService: AlertService,
    private formBuilder: FormBuilder,
    public translate: TranslateService
  ) {
    translate.addLangs([localStorage.getItem('translationCurrentLang')]);
    translate.setDefaultLang(localStorage.getItem('translationCurrentLang'));
  }

  ngOnInit() {

    // Solo con fines de inicializar el form
    this.asigTable = this.formBuilder.group({
    test: this.formBuilder.array([])
    });

    this.modTable = this.formBuilder.group({
    testM: this.formBuilder.array([])
    });

    let user = JSON.parse(localStorage.getItem('currentUser'));
    this.teacherId = user['IdDocente'];

    this.getTAsignaturas();
    this.getModalidades();
    this.getNiveles();
    this.getAsigByTeacher();
    this.getModByTeacher();
  }

  ngAfterViewInit() {

  }

  getTAsignaturas() {
    this.userService.getTipoAsignaturas()
        .pipe(first())
        .subscribe(

            data => {

                this.tipoAsignatuas = data;

            },
            error => {

              this.alertService.error(error, this.options);
            });
  }

  getModalidades() {
    this.userService.getModalidad()
        .pipe(first())
        .subscribe(

            data => {

              this.modalidades = data;

            },
            error => {

              this.alertService.error(error, this.options);
            });
  }

  getNiveles() {
    this.userService.getNivel()
        .pipe(first())
        .subscribe(

            data => {

                this.niveles = data;
            },
            error => {

              this.alertService.error(error, this.options);
            });
  }

  getAsigByTeacher() {
    this.userService.getAsigByTeacher(this.teacherId)
        .pipe(first())
        .subscribe(

            data => {

              this.teacherAsig = data;
              console.log(this.teacherAsig);

              for (const tAsig of this.teacherAsig) {
                setTimeout(() => {
                  this.loadValueAsigBD(tAsig['Id_TipoAsig'], tAsig['Id_Nivel']);
                }, 100);
              }
            },
            error => {

              this.alertService.error(error, this.options);
            });
  }

  getModByTeacher() {
    this.userService.getModByTeacher(this.teacherId)
        .pipe(first())
        .subscribe(

            data => {

              this.teacherMod = data;

              for (const tMod of this.teacherMod) {
                setTimeout(() => {
                  this.loadValueModBD(tMod['Id_modalidad']);
                }, 100);
              }


            },
            error => {

              this.alertService.error(error, this.options);
            });
  }

  changeAsigSelection() {
    this.fetchAsigItems();
  }

  changeModSelection() {
    this.fetchModItems();
  }

  fetchAsigItems() {
    console.log('entro en checked Asig');
    this.checkedIDs = [];
    this.tipoAsignatuas.forEach((value, index) => {
      if (value.isChecked) {
        this.checkedIDs.push(value.Id);
      }
    });
  }

  loadValueAsigBD(valueA, valueB) {
    this.tipoAsignatuas.forEach((value, index) => {
      if (value['Id'] === valueA) {
        value['isChecked'] = true;

        this.niveles.forEach((valueN, indexN) => {
          if (valueN['Id'] === valueB) {
            valueA = valueA - 1;
            valueB = valueB - 3;
            let nameId = 'check_asig_' + valueA + '' + valueB + '';
            setTimeout(() => {
              document.getElementById(nameId).click();
            }, 500);
          }
        });
      }
    });
  }

  loadValueModBD(valueA) {
    this.modalidades.forEach((value, index) => {
      if (value['Id'] === valueA) {
        value['isChecked'] = true;
      }
    });
    this.loading = false;
  }

  fetchModItems() {
    console.log('entro en checked Mod');
    this.checkedMods = [];
    this.modalidades.forEach((value, index) => {
      if (value.isChecked) {
        this.checkedMods.push(value.Id);
        console.log(this.checkedMods);
      }
    });
  }

  getSelected(event, modItem: string, item: string, itemId: number) {
    let arrayTest = [];
    if (event.target.checked) {
       console.log('checked: ' + event.target.id);
       arrayTest.push(event.target.id, itemId, item, modItem['Id'], modItem['Nombre']);
       this.selectedNivItemsList.push(arrayTest);
    } else {
       console.log('unchecked: ' + event.target.id);

       // Se busca elemento de array a eliminar
       var result = this.selectedNivItemsList.filter(obj => {
        return obj[0] === event.target.id
       })

       // Se lo elimina del array
       this.selectedNivItemsList = this.selectedNivItemsList.filter(function(item) {
        return result.indexOf(item) === -1;
       });
    }
    console.log(this.selectedNivItemsList);
 }

 submitAsigTable() {
  console.log('entro en submitAsigTable');

  let selectedNiveles = [];
  let hasNiveles = true;
  let dbAsig;
  let asigSelected = [];
  let nivSeleceted = [];
  let callText = 'asignaturas';

  if (this.checkedIDs.length === 0) {
    this.fetchAsigItems();
  }

  for (const idNivel of this.selectedNivItemsList) {
    selectedNiveles.push(idNivel[1]);
  }

  for (const idAsig of this.checkedIDs) {
    if (!selectedNiveles.includes(idAsig)) {
      for (const tipoAsig of this.tipoAsignatuas) {
        if (tipoAsig['Id'] === idAsig) {
          this.alertService.error('Debe seleccionar por lo menos un nivel para: ' + tipoAsig['Nombre'], this.options);
          hasNiveles = false;
        }
      }
    }
  }

  let i = 0;

  if (hasNiveles) {
    for (const idAsig of this.checkedIDs) {
      for (const idNivel of this.selectedNivItemsList) {
        if (idAsig === idNivel[1]) {

          console.log('submitAsigTable2');
          i = 1;

          asigSelected.push(idAsig);
          nivSeleceted.push(idNivel[3]);

          this.registerAsig(idAsig, idNivel[3], this.teacherId);
          setTimeout(() => {
            if (i === 1) {
              i = i - 1;

              if (this.inserta) {
                this.getAlert(true, callText);
                this.inserta = false;
              } else {
                this.getAlert(false, callText);
              }
            }
          }, 3000);
        }
      }
    }
    this.checkAsig(this.teacherId, dbAsig, asigSelected, nivSeleceted);
  }
 }

 submitModTable() {
  console.log('entro en submitAsigTable');
  console.log(this.checkedMods);
  console.log(this.modalidades);

  let modSeleceted = [];
  let dbMod;
  let callText = 'modalidades';

  if (this.checkedMods.length === 0) {
    this.fetchModItems();
  }

  let i = 0;

  for (const idModalidad of this.checkedMods) {

    i = 1;

    modSeleceted.push(idModalidad);

    this.registerMod(idModalidad, this.teacherId);
    setTimeout(() => {
      if (i === 1) {
        i = i - 1;

        console.log('Entra una vez aqui');
        if (this.inserta) {
          this.getAlert(true, callText);
          this.inserta = false;
        } else {
          this.getAlert(false, callText);
        }
      }
    }, 3000);

  }
  this.checkMod(this.teacherId, dbMod, modSeleceted);
 }

 registerAsig(idAsig, idNivel, teacherId) {

  this.userService.registerAsignatura(idAsig, idNivel,  teacherId)
          .pipe(first())
          .subscribe(

              data => {

                console.log('response: ' + data);

                this.inserta = true;
              },
              error => {

                console.log('entra');

              });

 }

 checkAsig(teacherId, dbAsig, asigSelected, nivSeleceted) {
  this.userService.getAsigByTeacher(teacherId)
  .pipe(first())
  .subscribe(

      data => {

        dbAsig = data;
        for (const t of dbAsig) {
          if (asigSelected.includes(t['Id_TipoAsig'])) {
            if (!nivSeleceted.includes(t['Id_Nivel'])) {
              this.removeAsig(t['Id']);
            }
          } else {
            this.removeAsig(t['Id']);
          }
        }

      },
      error => {

        console.log(error);
      });
 }

 registerMod(idModalidad, teacherId) {

  this.userService.registerModalidad(idModalidad, teacherId)
      .pipe(first())
      .subscribe(

          data => {

            console.log('response: ' + data);

            this.inserta = true;
          },
          error => {
            console.log(error);
          });
 }

 checkMod(teacherId, dbMod, modSeleceted) {
  this.userService.getModByTeacher(teacherId)
    .pipe(first())
    .subscribe(

        data => {

          dbMod = data;
          for (const m of dbMod) {
            if (!modSeleceted.includes(m['Id_modalidad'])) {
                this.removeMod(m['Id']);
            }
          }
        },
        error => {

          console.log(error)
        });
 }

 getAlert(alertType, call) {

  let mensajeS = 'Actualización de ' + call + ' satisfactorio!';
  let mensajeW = 'Se modificaron las ' + call + ' previamente asignadas!';

  if (alertType) {
    this.alertService.success(mensajeS, this.options);
  } else {
    this.alertService.warn(mensajeW, this.options);
  }

 }

 removeAsig(id) {

  this.userService.deleteAsig(id)
    .pipe(first())
    .subscribe(

        dataA => {
          console.log(dataA);
        },
        error => {

          this.alertService.error(error, this.options);
        });
 }

 removeMod(Id) {

  this.userService.deleteMod(Id)
    .pipe(first())
    .subscribe(

        data => {
          console.log(data);
        },
        error => {

          this.alertService.error(error, this.options);
        });
 }

}
