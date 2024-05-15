import { Component, AfterViewInit } from '@angular/core';
// import Quagga from 'quagga';
import * as Quagga from 'quagga'; 

import Swal from 'sweetalert2';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit {
  codevailabel: boolean = false;
  cameraOpen: boolean = false;

  ngAfterViewInit() {
    // setTimeout(() => {
    //   const targetElement :any= document.querySelector('#scanner-container') as HTMLElement;
    //   if (targetElement) {
    //     this.initializeQuagga(targetElement);
    //   } else {
    //     console.error('Scanner container element not found.');
    //   }
    // }, 1000);
    this.requestPermissions(); // Assuming this method is defined elsewhere for permissions.
  }
  
  openCamera() {
    this.cameraOpen = true;
    // this.codevailabel = true;
    setTimeout(() => {
    if (typeof Quagga === 'object' && typeof Quagga.init === 'function') {
      this.initializeQuagga('');
    } else {
      console.error('Quagga initialization function is not available.');
    }
  }, 1000);
  }
  
  initializeQuagga(data:any) {
    const targetElement = document.querySelector('#scanner-container') as HTMLElement;
    if (!targetElement) {
      console.error('Scanner container element not found.');
      return;
    }
  
    Quagga.init(
      {
        inputStream: {
          name: 'Live',
          type: 'LiveStream',
          target: targetElement,
        },
        decoder: {
          readers: ['ean_reader', 'code_128_reader', 'upc_reader'],
        },
      },
      (err: any) => {
        if (err) {
          console.error('Failed to initialize scanner:', err);
          return;
        }
        Quagga.start();
        Quagga.onDetected((result: any) => {
          this.showBarcodeInfo(result);
        });
      }
    );
  }
  

  requestPermissions() {
    // && navigator.mediaDevices.getUserMedia
    if (navigator.mediaDevices) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.requestMediaPermissions();
        },
        (geoError) => {
          if (geoError.code === geoError.PERMISSION_DENIED) {
            this.showPermissionDialog('location');
          }
        }
      );
    } else {
      this.showPermissionDialog('media devices');
    }
  }

  requestMediaPermissions() {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        // console.log('Media permission granted!', stream);
      })
      .catch((mediaError) => {
        console.error('Error accessing media devices:', mediaError);
        if (
          mediaError.name === 'NotAllowedError' ||
          mediaError.name === 'PermissionDismissedError'
        ) {
          this.showPermissionDialog('camera and microphone');
        }
      });
  }

  showPermissionDialog(permission: string) {
    alert(`Please allow access to ${permission} to use this application.`);
  }

  showBarcodeInfo(result: any) {
    const code = result?.codeResult?.code;
    if (code) {
      Swal.fire('Barcode scanned','','success')
      // this.cameraOpen = false;
      this.codevailabel = true;
      const barcodeValue = document.getElementById('barcode-value');
      if (barcodeValue) {
        barcodeValue.textContent = 'Value : ' + code;
      }

      const canvas = Quagga.canvas.dom.image;
      if (canvas) {
        const imageData = canvas.toDataURL();
        const barcodeImage = document.getElementById(
          'barcode-image'
        ) as HTMLImageElement;
        if (barcodeImage) {
          barcodeImage.src = imageData;
        }
      }
    } else {
      this.codevailabel = false;
    }
  }
}
