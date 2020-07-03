import { NgModule } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatListModule } from '@angular/material/list';

const modules = [
  DragDropModule,
  MatInputModule,
  MatButtonModule,
  MatProgressSpinnerModule,
  MatDialogModule,
  MatSnackBarModule,
  MatListModule
];

@NgModule({
  imports: modules,
  exports: modules
})
export class MaterialModule { }
