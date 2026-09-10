import {Component, OnInit} from '@angular/core';
import {BuildService} from "../../service/build.service";

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent implements OnInit {
  lastUpdate ="";


  constructor(private buildService: BuildService) {
  }

  ngOnInit() {
    this.buildService.getBuildTime().subscribe(res=>{
      if(res){
        this.lastUpdate = res.split('T')[0] + " " + res.split('T')[1].split('.')[0];
      }
    });
  }

}
