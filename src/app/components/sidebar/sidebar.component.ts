import { Component, OnInit, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import { UserService} from '../../_services';
import { first, isEmpty } from 'rxjs/operators';
import { AuthenticationService } from '../../_services';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';

declare const $: any;
declare interface RouteInfo {
    path: string;
    title: string;
    icon: string;
    class: string;
}
export let ROUTES: RouteInfo[] = [

    /*
    { path: '/dashboard', title: 'Dashboard',  icon: 'dashboard', class: '' },
    { path: '/user-profile', title: 'Perfil de Usuario',  icon:'person', class: '' },
    { path: '/modality-course', title: 'Modalidad/Asignaturas',  icon:'library_books', class: '' },
    { path: '/calendar', title: 'Cronograma',  icon:'calendar_today', class: '' },
    { path: '/grading', title: 'Certificación',  icon:'post_add', class: '' },


    { path: '/table-list', title: 'Table List',  icon:'content_paste', class: '' },
    { path: '/typography', title: 'Typography',  icon:'library_books', class: '' },
    { path: '/icons', title: 'Icons',  icon:'bubble_chart', class: '' },
    { path: '/maps', title: 'Maps',  icon:'location_on', class: '' },
    { path: '/notifications', title: 'Notifications',  icon:'notifications', class: '' },
    */

];

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit, AfterViewInit {
  menuItems: any[];
  private dropdownMenu: HTMLElement;
  private dropdownMenuIconMsj: HTMLElement;

  user: any;
  notificationList: any;
  previousNotiList: any;
  loadPreviusList: boolean;

  perfil: any;
  modAsig: any;
  crono: any;
  certif: any;

  loading = true;

  constructor(private element: ElementRef, private userService: UserService, public translate: TranslateService,
              private authenticationService: AuthenticationService, private router: Router) {
    this.loadPreviusList = false;
    translate.getDefaultLang();
   }

  @ViewChild('dropDownIcon') dropDownIcon: ElementRef;
  @ViewChild('dropDownMenuIcon') dropDownMenuIcon: ElementRef;

  ngOnInit() {
      let test = [];

      this.translate.get('SidebarProfile').subscribe((translated: string) => {

        this.loading = false;

        console.log(translated);
        this.perfil = translated;
        this.modAsig = this.translate.instant('SidebarModAsig');
        this.crono = this.translate.instant('SidebarCrono');
        this.certif = this.translate.instant('SidebarCertif');

        test.push( { path: '/dashboard', title: 'Dashboard',  icon: 'dashboard', class: '' },
          { path: '/user-profile', title: this.perfil,  icon:'person', class: '' },
          { path: '/modality-course', title: this.modAsig,  icon:'library_books', class: '' },
          { path: '/calendar', title: this.crono,  icon:'calendar_today', class: '' },
          { path: '/grading', title: this.certif,  icon:'post_add', class: '' });
          ROUTES = test;

        this.user = JSON.parse(localStorage.getItem('currentUser'));
        this.getNotificaciones(this.user['Id'], false);
        this.menuItems = ROUTES.filter(menuItem => menuItem);
      });
  }

  ngAfterViewInit() {

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
                  if (this.dropdownMenu !== undefined) {
                    this.dropdownMenu.appendChild(dateSpan);
                    this.setLastNotification();
                  }
                  localStorage.setItem('notificactionlist', JSON.stringify(this.notificationList));
                } else if (notified === true) {
                  localStorage.setItem('notificactionlist', JSON.stringify(this.notificationList));
                  this.setLastNotification();
                }
            },
            error => {

                console.log(error);

            });
  }

  setLastNotification() {
    this.notificationList.forEach(element => {
      const option = document.createElement('a');
      option.classList.add('dropdown-item');
      option.innerHTML = element['Mensaje'];
      this.dropdownMenuIconMsj.appendChild(option);
    });
  }

  checkState() {
    console.log('checkState');
    this.dropdownMenu = this.dropDownIcon.nativeElement;
    this.dropdownMenuIconMsj = this.dropDownMenuIcon.nativeElement;

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



  isMobileMenu() {
      if ($(window).width() > 991) {
          return false;
      }
      return true;
  };
}
