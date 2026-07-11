import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, GuardResult, MaybeAsync, Router, RouterStateSnapshot } from "@angular/router";
import { AuthService } from "../services/auth.service";

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
    
    constructor(
        private authService: AuthService,
        private router: Router
    ){}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        if(!this.authService.isLoggedIn()) {
            this.router.navigate(['/login']);
            return false;
        }

        const requiredRoles = route.data['roles'] as string[];
        const userRole = this.authService.getUserRole();

        if(requiredRoles && !requiredRoles.includes(userRole!)) {
            this.router.navigate(['/unauthorized']);
            return false;
        }

        return true;
    }
}