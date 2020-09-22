import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { FeatureService } from '../services/feature/feature.service';
import { AuthService } from '../auth/auth.service';
import firebase from 'firebase/app';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: [
    './styles/forgot-password.page.scss'
  ]
})

export class ForgotPasswordPage implements OnInit {
  forgotPasswordForm: FormGroup;

  validation_messages = {
    'email': [
      { type: 'required', message: this.featureService.translations.EmailRequired },
      { type: 'pattern', message: this.featureService.translations.EnterValidEmail }
    ]
  };

  constructor(
    public router: Router,
    public menu: MenuController,
    private featureService: FeatureService,
    private authService: AuthService
  ) {
    this.forgotPasswordForm = new FormGroup({
      'email': new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
      ]))
    });
  }

  ngOnInit(): void {
    this.menu.enable(false);
  }

  recoverPassword(): void {
/*     var actionCodeSettings = {
      url: "http://www.google.com",
      // This must be true.
      handleCodeInApp: true
    }; */
    this.authService.angularFire.sendPasswordResetEmail(this.forgotPasswordForm.value.email).then((res) => {
      this.featureService.presentToast(this.featureService.translations.EmailResetPasswordSent, 2000);
      console.log(res);
      this.router.navigate(['/auth/sign-in'], { replaceUrl: true });
    }
    ).catch(
      err => {
        this.featureService.presentToast(err.message, 2000);
        console.log(err)
      }
    )
    
  }

}
