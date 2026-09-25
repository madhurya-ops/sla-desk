import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth/auth.service';
import { Role } from '../core/models';

interface NavLink {
  path: string;
  label: string;
  icon: string;
  roles?: Role[];
}

const NAV_LINKS: NavLink[] = [
  { path: '/tickets', label: 'Tickets', icon: 'confirmation_number' },
  { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { path: '/sla-policies', label: 'SLA Policies', icon: 'timer', roles: ['MANAGER'] },
];

@Component({
  selector: 'app-shell',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatMenuModule,
    MatToolbarModule,
  ],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {
  private readonly auth = inject(AuthService);

  protected readonly user = this.auth.currentUser;
  protected readonly links = computed(() => {
    const role = this.auth.role();
    return NAV_LINKS.filter((link) => !link.roles || (role !== null && link.roles.includes(role)));
  });

  protected logout(): void {
    this.auth.logout();
  }
}
