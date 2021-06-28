import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup} from '@angular/forms';
import { CreateMap } from '../_helpers/getGeoLocation';
import { UserService} from '../_services';
import { AlertService } from '../_alert';
import { first } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

declare const google: any;

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  direccion: string;
  nro: string;
  ciudad: string;
  disabled: boolean;
  formData: boolean;

  teacher: any;
  teacherUser: any;

  form: FormGroup;

  address: string;
  dir: string;
  num: string;
  ciu: string;
  lat: any;
  lng: any;

  nextAddress: any;
  delay: any;

  options = {
    autoClose: true,
    keepAfterRouteChange: true
  };

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    protected alertService: AlertService,
    public translate: TranslateService
    ) {
      translate.addLangs([localStorage.getItem('translationCurrentLang')]);
      translate.setDefaultLang(localStorage.getItem('translationCurrentLang'));
  }

  ngOnInit() {

    this.form = this.formBuilder.group({
      direccion: '',
      nro: '',
      ciudad: '',
      profesion: '',
      completeName: '',
      mobile: '',
      esquina: '',
      pais: '',
      info: '',
      username: '',
      email: ''
    });

    this.nextAddress = 0;
    this.delay = 100;

    let user = JSON.parse(localStorage.getItem('currentUser'));
    this.getDataTeacher(user);

    this.onChanges();
    var idMap = document.getElementById("map");
    CreateMap(idMap, null, null, 13);
  }

  getDataTeacher(user) {
    this.userService.getById(user['IdDocente'])
        .pipe(first())
        .subscribe(

            data => {

              this.teacherUser = data[0];
              this.completeForm(user);
            },
            error => {

              this.alertService.error(error, this.options);
            });
  }

  completeForm(user) {
    const formData = {
      username: user['Username'],
      email: user['Email'],

      direccion: this.teacherUser != null ? this.teacherUser['Direccion'] : '',
      nro: this.teacherUser != null ? this.teacherUser['Nro'] : '',
      ciudad: this.teacherUser != null ? this.teacherUser['Ciudad'] : '',
      profesion: this.teacherUser != null ? this.teacherUser['Profesion'] : '',
      completeName: this.teacherUser != null ? this.teacherUser['NombreCompleto'] : '',
      mobile: this.teacherUser != null ? this.teacherUser['Mobile'] : '',
      esquina: this.teacherUser != null ? this.teacherUser['Esquina'] : '',
      pais: this.teacherUser != null ? this.teacherUser['Pais'] : '',
      info: this.teacherUser != null ? this.teacherUser['Info'] : '',
    };
    this.form.patchValue(formData);

    document.getElementById('card_category').innerHTML = this.teacherUser != null ? this.teacherUser['Profesion'] : 'En este campo' +
    ' se incluira la profesión del docente';
    document.getElementById('card_title').innerHTML = this.teacherUser != null ? this.teacherUser['NombreCompleto'] : 'En este campo' +
    ' se incluira el nombre completo del docente';
    document.getElementById('card_description').innerHTML = this.teacherUser != null ? this.teacherUser['Info'] : 'En este campo' +
    ' se incluira la información del docente';

    this.loadData();
  }

  loadData() {
    this.form.get('username').disable();
    this.form.get('email').disable();
  }

  onChanges(): void {
    this.form.get('direccion').valueChanges.subscribe(data => {
      if (data != null) {
        const valueKeys = Object.keys(data).map(key => data[key]);
        this.address = valueKeys.join('');
        this.getCompleteString(this.address, 1);
      }
    });

    this.form.get('nro').valueChanges.subscribe(data => {
      if (data != null) {
        this.address = data;
        this.getCompleteString(this.address, 2);
      }
    });

    this.form.get('ciudad').valueChanges.subscribe(data => {
      if (data != null) {
        const valueKeys = Object.keys(data).map(key => data[key]);
        this.address = valueKeys.join('');
        this.getCompleteString(this.address, 3);
      }
    });
  }

  getCompleteString(search, origen) {
    if (origen === 1) {
      this.dir = search;
    } else if (origen === 2) {
     this.num = search;
    } else {
     this.ciu = search;
    }

    const completeAdress = this.dir + ' ' + this.num + ' ' + this.ciu;

    this.getAddress(completeAdress);
 }


  getAddress(search) {
   var geo = new google.maps.Geocoder();
   geo.geocode({address: search}, function (results, status){
       // If that was successful
       if (status === google.maps.GeocoderStatus.OK) {
         // Lets assume that the first marker is the one we want
         var p = results[0].geometry.location;
         this.lat = p.lat();
         this.lng = p.lng();

         console.log(this.lat);
         console.log(this.lng);

         var idMap = document.getElementById("map");

         localStorage.setItem('lat', this.lat );
         localStorage.setItem('lng', this.lng );

         CreateMap(idMap, this.lat, this.lng, 18);

       } else {
         if (status === google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
           this.nextAddress--;
           this.delay++;
         } else {
           console.log(status);
         }
       }
     }
   );
   }


  onSubmit() {

    // stop here if form is invalid
    if (this.form.invalid) {
        return;
    }

    this.lat = localStorage.getItem('lat');
    this.lng = localStorage.getItem('lng');

    let user = JSON.parse(localStorage.getItem('currentUser'));

    this.userService.update(user['Id'], this.form.value,  this.lat, this.lng)
        .pipe(first())
        .subscribe(

            data => {

                localStorage.removeItem('lat');
                localStorage.removeItem('lng');

                console.log('response: ' + data);

                this.alertService.success('Registro exitoso. Bienvenido a nuestra comunidad!', this.options);
            },
            error => {

              this.alertService.error(error, this.options);
            });

  }

}
