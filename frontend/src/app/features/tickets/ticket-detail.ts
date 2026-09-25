import { Component } from '@angular/core';
import { PageStub } from '../../shared/page-stub';

@Component({
  selector: 'app-ticket-detail',
  imports: [PageStub],
  template: `<app-page-stub heading="Ticket" />`,
})
export class TicketDetail {}
