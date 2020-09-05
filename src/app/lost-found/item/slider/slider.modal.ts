import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController, IonSlides } from '@ionic/angular';

@Component({
  selector: 'modal-slider',
  templateUrl: './slider.modal.html',
  styleUrls: [
    './styles/slider.modal.scss'
  ],
})

export class SliderModal implements OnInit {
  @Input() photoSlider: any[];
  slidesOptions = {
  zoom: {
      maxRatio: 3 
    }
  }; 

  @ViewChild('sliderRef', { static: true }) protected slides: IonSlides;
  
  constructor(
    private modalController: ModalController
  ) { 
  }
  
  ngOnInit() {
    this.slides.update();
  }

  dismissModal() {
   this.modalController.dismiss();
  }

}