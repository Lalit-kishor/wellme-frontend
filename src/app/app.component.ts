import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'appointment-ui';

  constructor(private authService: AuthService){}

  ngOnInit(): void {
    // This runs once when the app loads/refreshes, silently re-authenticating using the cookie
      this.authService.fetchCurrentUser().subscribe({
        next: () => {}, // role now populated if cookie is valid
        error: () => {} // not logged in - ignore, guards will handle redirect
      });
  }
}
