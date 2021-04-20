import { AfterViewInit, Component, ElementRef, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import { IonCard } from '@ionic/angular';
import { MediaListItem } from 'src/app/models/MediaListItem';

@Component({
  selector: 'media-item',
  templateUrl: './media-item.component.html',
  styleUrls: ['./media-item.component.scss'],
})
export class MediaItemComponent implements OnInit, AfterViewInit {
  @Input() item: MediaListItem;
  @Input() visible: boolean = true;
  @ViewChild('card', {read: ElementRef, static: false}) cardLabel: ElementRef

  constructor(private renderer: Renderer2) { }

  ngOnInit() {

  }

  ngAfterViewInit() {
    this.setVisibility(false);
  }

  getVisibleStatus() {
    if (this.visible) {
      return "none"
    }
    return "block";
  }

  setVisibility(status: boolean) {
    console.log("called")
    var vis = status ? "visible" : "hidden";
    this.renderer.setStyle(this.cardLabel.nativeElement, 'visibility', vis);
  }

}
