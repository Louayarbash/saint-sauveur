import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { FirebaseAuthService } from '../firebase-auth.service';

@Injectable()
export class FirebaseProfilePageGuard implements CanActivate {

  constructor(
    private firebaseAuthService: FirebaseAuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    // check if user is authenticated
    if (this.firebaseAuthService.getLoggedInUser() != null) {
      return true;
    } else {
      // Navigate to the login page
      this.router.navigate(['firebase/auth/sign-in']);
      return false;
    }
  }
}
