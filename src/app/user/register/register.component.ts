import { Component, OnInit } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  
  public firstName: any;
  public lastName: any;
  public mobile: any;
  public email: any;
  public password: any;
  public confirmPassword:any;

  constructor(public appService: AppService, public router: Router, private toastr: ToastrService) { }

  ngOnInit() {
  }

  public goToSignIn: any = () => {

    this.router.navigate(['/']);

  } // end goToSignIn

  onSubmit() {

    let data = {
      firstName: this.firstName,
      lastName: this.lastName,
      mobileNumber: this.mobile,
      email: this.email,
      password: this.password,
      createdOn: Date.now()
    }

    // console.log(data);

    this.appService.signUpFunction(data).subscribe((apiResponse) => {

      // console.log(apiResponse);

      if (apiResponse.status === 200) {

        this.toastr.success('Registerd Successfully!');

        setTimeout(() => {

          this.goToSignIn();

        }, 2000);

      } else {

        this.toastr.error(apiResponse.message);

      }

    }, (err) => {

      this.toastr.error('Error Occured!');

    });
  }
}