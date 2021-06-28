import { Component, LOCALE_ID, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFireDatabase } from 'angularfire2/database';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent {
  title = 'Contact';
  form: FormGroup;
  success = false;
  submitted = false;
  res_message = '';
  constructor(private fb: FormBuilder, public db: AngularFireDatabase, @Inject(LOCALE_ID) protected localeId: string) {
    this.createForm();
  }
  createForm() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', Validators.required],
      message: ['', [Validators.required, Validators.minLength(20)]],
    });
  }
  get name() { return this.form.get('name'); }
  get email() { return this.form.get('email'); }
  get message() { return this.form.get('message'); }
  onSubmit() {
    this.submitted = true;
    const {name, email, message} = this.form.value;
    if (this.form.valid) {
      const date = Date();
      const html = `
        <div>From: ${name}</div>
        <div>Email: <a href="mailto:${email}">${email}</a></div>
        <div>Date: ${date}</div>
        <div>Message: ${message}</div>
      `;
      const formRequest = { name, email, message, date, html };
      this.submitted = false;
      // this.db.list('/messages').push(formRequest);
      this.db.list('/messages').push(formRequest)
          .then(resolve => {
            console.log('all good');
            this.form.reset();
            this.res_message = 'Mensaje enviado con éxito, te contactaremos pronto.';
            this.success = true;
          }, reject => {
            console.log('error');
            this.res_message = 'Este mensaje no puede ser enviado en este momento. Por favor contacta a info@hireateacher.com.';
            this.success = false;
          }) ;
    }
  }
}
