import { AfterViewInit, ChangeDetectorRef, Component } from '@angular/core';
import { SidebarService } from '../services/sidebar/sidebar.service';
import { SpinnerService } from '../services/spinner/spinner.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent  {
  isSidebarVisible = true;
  constructor(private sidebarService: SidebarService, public _spinnerService:SpinnerService) {
    }

  ngOnInit() {
    this.sidebarService.sidebarVisibility$.subscribe((isVisible) => {
      console.log(isVisible)
      this.isSidebarVisible = isVisible;
    });
  }


}
