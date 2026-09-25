import { Component } from '@angular/core';
import { PageStub } from '../../shared/page-stub';

@Component({
  selector: 'app-dashboard',
  imports: [PageStub],
  template: `<app-page-stub heading="Dashboard" />`,
})
export class Dashboard {}
