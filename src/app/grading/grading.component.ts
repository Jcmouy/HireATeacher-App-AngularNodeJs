import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { UserService} from '../_services';
import { first } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { AlertService } from '../_alert';
import {
  HttpClient,
  HttpHeaders,
  HttpRequest,
  HttpEventType
} from '@angular/common/http';
import { DialogBoxComponent } from '../dialog-box/dialog-box.component';
import { MatDialog } from '@angular/material/dialog';
import { UploadedFilesDirective } from '@syncfusion/ej2-angular-inputs';

@Component({
  selector: 'app-table-list',
  templateUrl: './grading.component.html',
  styleUrls: ['./grading.component.scss']
})
export class GradingComponent implements OnInit, AfterViewInit {
  title = "resumable-upload-file";

  selectedFile; //Resumable File Upload Variable
  name; //Resumable File Upload Variable
  uploadPercent; //Resumable File Upload Variable
  completeUpload;
  color = "primary"; //Mat Spinner Variable (Resumable)
  mode = "determinate"; //Mat Spinner Variable (Resumable)
  value = 50.25890809809; //Mat Spinner Variable (Resumable)

  res: any;
  req: any;
  user: any;
  userN: any;
  alertNumber: any;

  fileList: any;
  checkFiles: any;
  oldObject: any;

  tableFilesMenu: any;

  options = {
    autoClose: true,
    keepAfterRouteChange: true
  };

  constructor(
    private userService: UserService,
    protected alertService: AlertService,
    private http: HttpClient,
    public dialog: MatDialog,
    public translate: TranslateService
  ) {
    translate.addLangs([localStorage.getItem('translationCurrentLang')]);
    translate.setDefaultLang(localStorage.getItem('translationCurrentLang'));
  }

  ngOnInit() {
    this.checkFiles = false;

    let userD = JSON.parse(localStorage.getItem('currentUser'));
    this.userN = userD['Username'];
    this.getFiles(this.userN);
  }

  onFileSelect(event) {
    this.selectedFile = event.target.files[0];
    this.name = this.selectedFile.name;
  }

  ngAfterViewInit() {
    this.tableFilesMenu = document.getElementById('tableRow') as HTMLElement;
  }

  getFiles(userN) {
    this.userService.getTeacherFiles(userN)
        .pipe(first())
        .subscribe(

            data => {
                this.fileList = data;
                if (this.fileList.length > 0) {
                  this.checkFiles = true;
                  this.tableFilesMenu.hidden = false;
                } else {
                  this.tableFilesMenu.hidden = true;
                }
            },
            error => {

              this.alertService.error(error, this.options);
            });
  }

  resumableUpload() {
    //checks file id exists or not, checks on name and last modified
    this.completeUpload = false;
    this.alertNumber = 0;
    const userName = this.userN;
    const fileId = `${this.selectedFile.name}-${this.selectedFile.lastModified}`;
    const sizeFile = this.selectedFile.size.toString();
    const nameFile = this.name;
    this.userService.uploadFileStatus(fileId, nameFile, sizeFile, userName)
    .pipe(first())
    .subscribe(

        (res: any) => {

          if (res.status === "file is present") {
            this.alertService.error('Archivo previamente subido. Por favor, elija otro archivo.', this.options);
            this.completeUpload = true;
            return;
          }
          this.uploadFile(res, fileId, userName);
        },
        error => {

          this.alertService.error(error, this.options);
        });
  }

  uploadFile(resB, fileId, userName) {
    let uploadedBytes = resB.uploaded; //GET response how much file is uploaded
    const req = this.userService.uploadFileUpload(fileId, uploadedBytes, this.name, userName, this.selectedFile);
    this.http.request(req).subscribe(
      (res: any) => {
        if (res.type === HttpEventType.UploadProgress) {
          this.uploadPercent = Math.round((100 * res.loaded) / res.total);
          if (this.uploadPercent >= 100) {
            setTimeout(() => {
              this.completeUpload = true;
              if (this.alertNumber === 0) {
                this.alertService.success('Archivo subido correctamente!', this.options);
                this.getFiles(this.userN);
              }
              this.alertNumber = 1;
            }, 3000);
            // this.completeUpload = true;
            this.name = "";
            this.selectedFile = null;
          }
        } else {
          if (this.uploadPercent >= 100) {
            setTimeout(() => {
              this.completeUpload = true;
              if (this.alertNumber === 0) {
                this.alertService.success('Archivo subido correctamente!', this.options);
                this.getFiles(this.userN);
              }
              this.alertNumber = 1;
            }, 3000);
            this.name = "";
            this.selectedFile = null;
          }
        }
      },
      err => {}
    );
  }


  openDialog(action, obj) {
    this.oldObject = obj.Archivo;
    obj.action = action;
    const dialogRef = this.dialog.open(DialogBoxComponent, {
      width: '400px',
      data:obj
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.event == 'Actualizar'){
        this.updateRowData(result.data);
      }else if (result.event == 'Eliminar'){
        this.deleteRowData(result.data);
      }
    });
  }

  updateRowData(row_obj){
    let userName = this.userN;
    let oldName = this.oldObject;
    this.userService.modifyTeacherFiles(row_obj.Archivo, userName, oldName)
    .pipe(first())
    .subscribe(

        data => {
            this.getFiles(this.userN);
        },
        error => {

          this.alertService.error(error, this.options);
        });

  }
  deleteRowData(row_obj){
    let userName = this.userN;
    this.userService.deleteTeacherFiles(row_obj.Archivo, userName)
    .pipe(first())
    .subscribe(

        data => {
            this.getFiles(this.userN);
        },
        error => {

          this.alertService.error(error, this.options);
        });
  }

}
