import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export interface HoldDialogResult {
  note: string;
}

/** Closes with a HoldDialogResult on confirm; anything else means cancelled. */
@Component({
  selector: 'app-hold-dialog',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  template: `
    <h2 mat-dialog-title>Put ticket on hold</h2>
    <mat-dialog-content>
      <p>The SLA clock pauses while the ticket is on hold.</p>
      <mat-form-field appearance="outline" class="full">
        <mat-label>Note (optional)</mat-label>
        <textarea matInput [formControl]="note" rows="3" cdkFocusInitial></textarea>
        <mat-hint>e.g. Waiting for client</mat-hint>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close type="button">Cancel</button>
      <button mat-flat-button [mat-dialog-close]="{ note: note.value }" type="button">
        Put on hold
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    .full {
      width: 100%;
    }
    p {
      margin-top: 0;
    }
  `,
})
export class HoldDialog {
  protected readonly note = new FormControl('', { nonNullable: true });
}
