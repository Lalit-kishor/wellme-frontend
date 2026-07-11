import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private router: Router
  ) { }
  
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    
    // Ensures cookie always sent
    const clonedReq = req.clone({ withCredentials: true });

    return next.handle(clonedReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if(error.status === 401) {
          this.router.navigate(['/login']);
        }

        return throwError(() => error);
      })
    )

  }
}
