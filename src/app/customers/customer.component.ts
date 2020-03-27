import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { Customer } from './customer';

function emailMatcher(c: AbstractControl): { [key: string]: boolean } | null {
    const emailControl = c.get('email');
    const confirmEmailControl = c.get('confirmedEmail');
    if (emailControl.pristine || confirmEmailControl.pristine) {
      return;
    }
    if (emailControl.value === confirmEmailControl.value) {
      return null
    }
    return { 'match': true }
  }

function ratingRange(min: number, max: number): ValidatorFn {
  return (c: AbstractControl): { [key: string]: boolean } | null => {
    let cV = c.value
    if(cV !== null && (isNaN(cV) || cV < min || cV > max)){
      return { 'range' : true }
    }
    return null;
  }
}
@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.css']
})

export class CustomerComponent implements OnInit {

  customer = new Customer();
  customerForm: FormGroup;
  emailMessage: string;

  private validationMessages = {
    required: 'Please enter your email address.',
    email: 'Please enter a valid email address.'
  }

  constructor(private fb : FormBuilder) {}

  ngOnInit() {
    this.customerForm = this.fb.group({
      firstName: ['', [ Validators.required, Validators.minLength(3) ]],
      lastName: ['', [Validators.required, Validators.maxLength(50) ]],
      emailGroup: this.fb.group({
        email: ['', [ Validators.required, Validators.email ]],
        confirmedEmail: ['', [ Validators.required ]],
      }, { validator: emailMatcher }),
      phone: '',
      notification: 'email',
      rating: [null, ratingRange(1, 5)],
      sendCatalog: true,
      addressType: 'home',
      street1: '',
      street2: '',
      city: '',
      state: '',
      zip: ''
    });

    this.customerForm.get('notification').valueChanges.subscribe(value => this.setNotification(value))
    const emailControl = this.customerForm.get('emailGroup.email');
    emailControl.valueChanges.pipe(
      debounceTime(1000)
    ).subscribe(
      value => this.setMessage(emailControl)
    )
  }

  populateTestData(): void {
    this.customerForm.patchValue({
      firstName: 'Jack',
      lastName: 'Harkness',
      email: 'jack@theHill.tumble',
      sendCatelog: true
    })
  }

  setMessage(c: AbstractControl): void {
    this.emailMessage = "";
    if( (c.touched || c.dirty) &&  c.errors ) {
      this.emailMessage = Object.keys(c.errors).map(
        key => this.validationMessages[key]).join(' ')
    }
  }

  setNotification(notifyVia: string): void {
    const phoneControl = this.customerForm.get('phone');
    if (notifyVia === 'text') {
      phoneControl.setValidators(Validators.required)
    } else {
      phoneControl.clearValidators()
    }
    phoneControl.updateValueAndValidity();
  }

  save() {
    console.log(this.customerForm);
  }
}
