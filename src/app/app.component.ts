import { Component } from '@angular/core';
import { CustomImage, theme } from './models/index';
import exifr from 'exifr';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import { faTrash, faImages, faUpload, faMapMarkedAlt } from '@fortawesome/free-solid-svg-icons';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  // Icons
  faTrash = faTrash;
  faImages = faImages;
  faUpload = faUpload;
  faMapMarkedAlt = faMapMarkedAlt;
  // List Variables
  images: Array<typeof CustomImage> = [];
  errors: Array<string> = [];
  // Map Variables
  styles = theme;
  zoom: number = 15;
  lng = -6.17458380;
  lat = 57.50690079;
  markers = [];

  constructor() { }

  // Delete File
  deleteFile(image) {
    this.images = this.images.filter( img => {
      return img.base64 !== image.base64 ? img : null;
    })
    this.markers = this.markers.filter( marker => {
      return marker.base64 !== image.base64 ? marker : null;
    })
  }

  // Zoom to marker
  moveToBounds(img) {
    this.markers.map( m => {
      if(img.base64===m.base64){
        this.lat = m.lat;
        this.lng = m.lng;
        this.zoom = 18;
      }
    })
  }

  // Get Exif Data on Load
  async loaded(e, image) {
    let gps = await exifr.gps(e.target.src);
    if( gps ) {
      let {latitude, longitude} = gps;
      image = {
        ...image, 
        lat: latitude, 
        lng: longitude
      }
      this.lat = latitude;
      this.lng = longitude;
      this.markers.push(image); 
    } else {
      this.errors.push('Please upload image with GPS data.');
    };
  }

  // Change Order in List by Drag and Drop
  drop(event: CdkDragDrop<{title: string, poster: string}[]>) {
    moveItemInArray(this.images, event.previousIndex, event.currentIndex);
  }
  
  // Create base64 object
  private getBase64File = file => {
    return new Promise((resolve,reject) => {
      const reader = new FileReader();
        reader.onload = () => {
        resolve(reader.result);
        let newFile = { file, base64: reader.result};
        this.images.push( newFile ); 
      };
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  } 

  // Onload validation
  onFileChange = e => {
    const errors = [];
    let files = Array.from(e.target.files)
    files = files.filter( file => {
      if (file.size > 1000000) {
        errors.push('File is too large');
        return;
      } else if (file.type !== "image/jpeg"){
        errors.push('Please upload JPEG image');
        return;
      } else {
        this.getBase64File(file);
      }
    })  
    this.errors = errors;
  };

}
