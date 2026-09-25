import { Component } from '@angular/core';
import { PageStub } from '../../shared/page-stub';

@Component({
  selector: 'app-ticket-new',
  imports: [PageStub],
  template: `<app-page-stub heading="New ticket" />`,
})
export class TicketNew {}
