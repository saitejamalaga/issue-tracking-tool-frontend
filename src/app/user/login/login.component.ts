import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { AppService } from './../../app.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {

  public email: any;
  public password: any;

  ngOnInit(): void { }

  constructor(public appService: AppService,public router: Router, private toastr: ToastrService ) {  }

  public getIn: any = () => {

    let data = {
      email: this.email,
      password: this.password
    }

    this.appService.signInFunction(data)
      .subscribe((apiResponse) => {

        if (apiResponse.status === 200) {

          Cookie.set('authToken', apiResponse.data.authToken);

          Cookie.set('receiverId', apiResponse.data.userDetails.userId);

          Cookie.set('receiverName', apiResponse.data.userDetails.firstName+' '+apiResponse.data.userDetails.lastName);

          this.appService.setUserInfoInLocalStorage(apiResponse.data.userDetails)

          this.toastr.success(apiResponse.message)

          setTimeout(() => {

            this.router.navigate(['/dashboard']);
          }, 2000);

        } else {

          this.toastr.error(apiResponse.message)

        }

      }, (err) => {

        this.toastr.error('Error Occured!')

      });

  } // end condition

} // end signinFunction

