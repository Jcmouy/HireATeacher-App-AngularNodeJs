import { Component, OnInit } from '@angular/core';
import Typed from 'typed.js';
import { TranslateService } from '@ngx-translate/core';

import { first } from 'rxjs/operators';

import { UserService, AuthenticationService } from '../_services';

@Component({
                selector: 'app-home',
                templateUrl: 'home.component.html',
                styleUrls: ['./home.component.css'] })
// export class HomeComponent implements OnInit {
export class HomeComponent implements OnInit {
    title = 'Home';
    translateCurrentLang: any;
    typed: any;
    textLang: any;

    constructor(
      public translate: TranslateService
    ) {
      translate.addLangs(['es', 'en']);
      translate.setDefaultLang('es');
      translate.use('es');
      this.translateCurrentLang = 'es';
      this.textLang = [];
    }


    ngOnInit() {
      for (const t of this.translate.getLangs()) {
        if (t === 'es') {
          this.textLang.push({
            code: 'es',
            label: 'LATAM',
            icon: 'assets/img/spanish.svg'
          });
        } else if (t === 'en') {
          this.textLang.push({
            code: 'en',
            label: 'INTERNACIONAL',
            icon: 'assets/img/english.svg'
          });
        }
      }
      this.setTypedText();
    }

    switchLang(lang: string) {
      this.typed.destroy();
      this.translate.setDefaultLang(lang);
      this.translate.use(lang);
      setTimeout(() => {
        console.log(this.translate.currentLang);
        this.translateCurrentLang = this.translate.currentLang;
        console.log(this.translateCurrentLang);
        console.log(this.translate);
        this.setTypedText();
      }, 100);
    }

    setTypedText() {

      let stringsText = [];

      if (this.translateCurrentLang === 'es') {
        stringsText = ['HireATeacher fue desarrollado pensando en usted y sus necesidades', 'Construyendo la educación del futuro',
        'Conectando estudiantes y docentes alrededor de todo el mundo', 'Permitanos ayudarlo!'];
      } else if (this.translateCurrentLang === 'en') {
        stringsText = ['HireATeacher was developed with you and your needs in mind', 'Building the education of the future',
        'Connecting students and teachers around the world', 'Let us help you!'];
      }

      console.log(stringsText);

      const options = {
        strings: stringsText,
        typeSpeed: 80,
        backSpeed: 10,
        showCursor: true,
        cursorChar: '',
        loop: true
      };

      this.typed = new Typed('.typing-element', options);
      this.typed.reset(true);
    }

    changeAction(obj) {
        console.log(obj);
        this.switchLang(obj);
    }

    /*
    currentUser: any;
    users = [];

    constructor(
        private authenticationService: AuthenticationService,
        private userService: UserService
    ) {
        this.currentUser = this.authenticationService.currentUserValue;
    }

    ngOnInit() {
        this.loadAllUsers();
    }

    deleteUser(id: number) {
        this.userService.delete(id)
            .pipe(first())
            .subscribe(() => this.loadAllUsers());
    }

    private loadAllUsers() {
        this.userService.getAll()
            .pipe(first())
            .subscribe(users => this.users = users);
    }
    */
}
