import {ChangeDetectorRef, Component, inject, OnInit} from '@angular/core';
import {BuildService} from "../../service/build.service";

@Component({
    selector: 'app-footer',
    imports: [],
    templateUrl: './footer.component.html',
    styleUrl: './footer.component.scss'
})
export class FooterComponent implements OnInit {
  lastUpdate = '';

  private buildService = inject(BuildService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.buildService.getBuildTime().subscribe(res=>{
      if(res){
        this.lastUpdate = res.split('T')[0] + " " + res.split('T')[1].split('.')[0];
        this.cdr.markForCheck()
      }
    });
  }

}
