import { createElement } from '@syncfusion/ej2-base';
import { Component, ViewChild, OnInit, ElementRef, AfterViewInit } from '@angular/core';
import { ROUTES } from '../sidebar/sidebar.component';
import {Location, LocationStrategy, PathLocationStrategy} from '@angular/common';
import { Router } from '@angular/router';
import { UserService} from '../../_services';
import { first, isEmpty } from 'rxjs/operators';
import { AuthenticationService } from '../../_services';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, AfterViewInit {
    private listTitles: any[];
    location: Location;
    mobile_menu_visible: any = 0;
    private toggleButton: any;
    private sidebarVisible: boolean;
    private navbar: HTMLElement;
    private dropdownMenu: HTMLElement;
    private dropdownMenuIconMsj: HTMLElement;
    private dropdownMenuProf: HTMLElement;

    user: any;
    notificationList: any;
    previousNotiList: any;
    loadPreviusList: boolean;


    constructor(location: Location,  private element: ElementRef, private router: Router, public translate: TranslateService,
                private userService: UserService, private authenticationService: AuthenticationService ) {
      translate.addLangs([localStorage.getItem('translationCurrentLang')]);
      translate.setDefaultLang(localStorage.getItem('translationCurrentLang'));
      console.log(translate);
      this.location = location;
      this.sidebarVisible = false;
      this.loadPreviusList = false;
    }

    @ViewChild('dropDownIcon') dropDownIcon: ElementRef;
    @ViewChild('dropDownMenuIcon') dropDownMenuIcon: ElementRef;
    @ViewChild('dropDownMenuProfile') dropDownMenuProfile: ElementRef;

    ngOnInit(){

      this.translate.get('Exit').subscribe((translated: string) => {

        this.user = JSON.parse(localStorage.getItem('currentUser'));
        this.getNotificaciones(this.user['Id'], false);

        this.listTitles = ROUTES.filter(listTitle => listTitle);
        this.navbar = this.element.nativeElement;
        this.toggleButton = this.navbar.getElementsByClassName('navbar-toggler')[0];
        this.router.events.subscribe((event) => {
        this.sidebarClose();
        var $layer: any = document.getElementsByClassName('close-layer')[0];
        if ($layer) {
          $layer.remove();
          this.mobile_menu_visible = 0;
        }
       });
      });
    }

    ngAfterViewInit() {
      this.dropdownMenu = this.dropDownIcon.nativeElement;
      this.dropdownMenuIconMsj = this.dropDownMenuIcon.nativeElement;

      this.dropdownMenuProf = this.dropDownMenuProfile.nativeElement.querySelector('#optionExit').innerHTML;

      if (this.translate.getDefaultLang() === 'es') {
        this.dropDownMenuProfile.nativeElement.querySelector('#optionExit').innerHTML = 'Salir';
      } else if ((this.translate.getDefaultLang() === 'en')) {
        this.dropDownMenuProfile.nativeElement.querySelector('#optionExit').innerHTML = 'Exit';
      }
    }

    getNotificaciones(id, notified) {
      this.userService.getNotifContMensjByTeacher(id, notified)
          .pipe(first())
          .subscribe(

              data => {

                  this.notificationList = data;
                  console.log(this.notificationList);
                  if (this.notificationList.length > 0 && notified === false) {
                    localStorage.removeItem('notificactionlist');
                    const dateSpan = document.createElement('span');
                    const countNoti = this.notificationList.length;
                    dateSpan.innerHTML = countNoti.toString();
                    dateSpan.classList.add('notification');
                    this.dropdownMenu.appendChild(dateSpan);

                    this.setLastNotification();
                    localStorage.setItem('notificactionlist', JSON.stringify(this.notificationList));
                    this.dropdownMenuIconMsj.hidden = false;
                  } else if (notified === true) {
                    if (this.notificationList.length > 0) {
                      this.dropdownMenuIconMsj.hidden = false;
                      localStorage.setItem('notificactionlist', JSON.stringify(this.notificationList));
                      this.setLastNotification();
                    } else {
                      this.dropdownMenuIconMsj.hidden = true;
                    }
                  }
              },
              error => {

                  console.log(error);

              });
    }

    setLastNotification() {
      this.notificationList.forEach(element => {
        this.dropdownMenuIconMsj.hidden = false;
        const option = document.createElement('a');
        option.classList.add('dropdown-item');
        option.innerHTML = element['Mensaje'];
        this.dropdownMenuIconMsj.appendChild(option);
      });
    }

    sidebarOpen() {
        const toggleButton = this.toggleButton;
        const body = document.getElementsByTagName('body')[0];
        setTimeout(function(){
            toggleButton.classList.add('toggled');
        }, 500);

        body.classList.add('nav-open');

        this.sidebarVisible = true;
    };
    sidebarClose() {
        const body = document.getElementsByTagName('body')[0];
        this.toggleButton.classList.remove('toggled');
        this.sidebarVisible = false;
        body.classList.remove('nav-open');
    };
    sidebarToggle() {
        // const toggleButton = this.toggleButton;
        // const body = document.getElementsByTagName('body')[0];
        var $toggle = document.getElementsByClassName('navbar-toggler')[0];

        if (this.sidebarVisible === false) {
            this.sidebarOpen();
        } else {
            this.sidebarClose();
        }
        const body = document.getElementsByTagName('body')[0];

        if (this.mobile_menu_visible == 1) {
            // $('html').removeClass('nav-open');
            body.classList.remove('nav-open');
            if ($layer) {
                $layer.remove();
            }
            setTimeout(function() {
                $toggle.classList.remove('toggled');
            }, 400);

            this.mobile_menu_visible = 0;
        } else {
            setTimeout(function() {
                $toggle.classList.add('toggled');
            }, 430);

            var $layer = document.createElement('div');
            $layer.setAttribute('class', 'close-layer');


            if (body.querySelectorAll('.main-panel')) {
                document.getElementsByClassName('main-panel')[0].appendChild($layer);
            }else if (body.classList.contains('off-canvas-sidebar')) {
                document.getElementsByClassName('wrapper-full-page')[0].appendChild($layer);
            }

            setTimeout(function() {
                $layer.classList.add('visible');
            }, 100);

            $layer.onclick = function() { //asign a function
              body.classList.remove('nav-open');
              this.mobile_menu_visible = 0;
              $layer.classList.remove('visible');
              setTimeout(function() {
                  $layer.remove();
                  $toggle.classList.remove('toggled');
              }, 400);
            }.bind(this);

            body.classList.add('nav-open');
            this.mobile_menu_visible = 1;

        }
    };

    getTitle(){
      var titlee = this.location.prepareExternalUrl(this.location.path());
      if(titlee.charAt(0) === '#'){
          titlee = titlee.slice( 1 );
      }

      for(var item = 0; item < this.listTitles.length; item++){
          if(this.listTitles[item].path === titlee){
              return this.listTitles[item].title;
          }
      }
      return 'Dashboard';
    }

    checkState() {
      console.log('checkState');

      if (this.dropdownMenu.querySelector('.notification')) {
        let test = this.dropdownMenu.querySelector('.notification');
        test.innerHTML = '';
        test.classList.remove('notification');
        this.notificationList.forEach(element => {
          this.updateNotificaciones(element);
        });
      }

      if (this.notificationList.length === 0 && this.loadPreviusList === false) {
        this.getNotificaciones(this.user['Id'], true);
      }
    }

    updateNotificaciones(element) {
      this.userService.updateNotifCont(element)
          .pipe(first())
          .subscribe(

              data => {
                  console.log(data);
              },
              error => {
                  console.log(error);
              });
    }

    exitDashboard() {
      this.authenticationService.logout();

      setTimeout(() => {
        this.router.navigate(['/']);
      }, 1000);
    }
}
