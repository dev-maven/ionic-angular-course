import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { MapModalComponent } from './map-modal/map-modal.component';
import { LocationPickerComponent } from './pickers/location-picker/location-picker.component';
import { CommonModule } from '@angular/common';
@NgModule({
  declarations: [MapModalComponent, LocationPickerComponent],
  imports: [CommonModule, IonicModule],
  exports: [MapModalComponent, LocationPickerComponent],
  entryComponents: [MapModalComponent],
})
export class SharedModule {}
