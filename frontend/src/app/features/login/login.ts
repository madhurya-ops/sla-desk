import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { Role } from '../../core/models';

interface DemoAccount {
  label: string;
  email: string;
  role: Role;
  icon: string;
}

const DEMO_PASSWORD = 'Demo@123';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly demoAccounts: DemoAccount[] = [
    { label: 'Infra Agent', email: 'agent.infra@sladesk.dev', role: 'AGENT', icon: 'dns' },
    { label: 'App Agent', email: 'agent.app@sladesk.dev', role: 'AGENT', icon: 'apps' },
    { label: 'Lead', email: 'lead@sladesk.dev', role: 'LEAD', icon: 'supervisor_account' },
    { label: 'Manager', email: 'manager@sladesk.dev', role: 'MANAGER', icon: 'insights' },
  ];

  protected readonly loading = signal(false);
  protected readonly hidePassword = signal(true);

  protected readonly form = inject(NonNullableFormBuilder).group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  protected demoLogin(account: DemoAccount): void {
    this.form.setValue({ email: account.email, password: DEMO_PASSWORD });
    this.submit();
  }

  protected submit(): void {
    if (this.form.invalid || this.loading()) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/tickets';
        this.router.navigateByUrl(returnUrl);
      },
      // The error interceptor shows ProblemDetail.detail in a snackbar.
      error: () => this.loading.set(false),
    });
  }
}
