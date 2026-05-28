import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Api } from '../../services/api';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit {

  username = '';
  password = '';

  constructor(
    private api: Api,
    private router: Router
  ) {}

  ngOnInit(): void {

    const user = localStorage.getItem('user');

    if (user) {
      this.router.navigate(['/dashboard']);
    }
  }

  login() {

    console.log('Login clicked');

    const data = {
      username: this.username,
      password: this.password
    };

    this.api.login(data).subscribe({

      next: (res) => {

        console.log('Login success', res);

        // full user object
        localStorage.setItem('user', JSON.stringify(res));

        // username
        localStorage.setItem('username', res.username);
        localStorage.setItem('userName', res.username);

        // user type
        localStorage.setItem('userType', res.userTypeName);

        // token if available
        if (res.token) {
          localStorage.setItem('token', res.token);
        }

        // redirect
        this.router.navigate(['/dashboard']);
      },

      error: (err) => {

        console.error('Login error', err);

        alert('Invalid username or password');
      }

    });
  }
}