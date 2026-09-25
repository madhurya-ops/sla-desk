import { Component } from '@angular/core';
import { PageStub } from '../../shared/page-stub';

@Component({
  selector: 'app-ticket-list',
  imports: [PageStub],
  template: `<app-page-stub heading="Tickets" />`,
})
export class TicketList {}
