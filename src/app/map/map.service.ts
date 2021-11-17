import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  backend_url : string
  backend_port : string


  constructor(private http: HttpClient) { 
    this.backend_url = environment.backend_url ; 
    this.backend_port = environment.backend_port ; 
  }

  getCountriesDetails(countries : string[] , details : boolean , page : number) {
    var requestBody = {
      "countries": countries,
      "params": {
        "page": page,
      },
      "details": details
    }

    return this.http.post<any>(this.backend_url + ":" + this.backend_port+ '/iso_code', requestBody) ;
  }

  getAllgeometries(){
    var requestBody = {}
    return this.http.post<any>(this.backend_url + ":" + this.backend_port+ '/all_geometries',requestBody) ;
  }

  getCountriesList(){
    return this.http.get<any>(this.backend_url + ":" + this.backend_port+ '/countries') ;
  }
}
