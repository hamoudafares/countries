import { Component, OnInit } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { MapService } from './map.service';
import { environment } from 'src/environments/environment'; 

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  map: mapboxgl.Map | undefined;
  selectedCountries = [];

  countriesList = [{ 'id' : 'test' , 'name' :'test'}];

  constructor( private mapService: MapService) { 
    this.getCountries()
  }
  ngOnInit() {
    // initialize the map
      this.map = new mapboxgl.Map({
        accessToken: environment.mapbox.accessToken,
        container: 'map', 
        style: 'mapbox://styles/mapbox/light-v10', // style URL
        center: [-68.137343, 45.137451], // starting position
        zoom: 1 // starting zoom
    });
    //get all the names of countries to use in the ng select to optimize the UX
    this.getCountries()
  }
  
   getCountries() {
     this.mapService.getCountriesList().subscribe( (data) => {
      this.countriesList = data.countries
    })

  }
  //this function is called in case we want to plot all the countries
  plotAllGeometries() {
    this.mapService.getAllgeometries().subscribe(data => {
     data.geometries.forEach((element: any) => {
              this.plotCountry(element)
     });
    })
  }
//removes a country if already plot in the map
  removeSource(name : string){

    for (let index in this.countriesList) {         
      if ( this.countriesList[index]['name'] ==  name) {
        var id = this.countriesList[index]['id'] ; 
        // this.map?.removeLayer(this.countriesList[index]['id']);
        // this.map?.removeLayer('outline' + this.countriesList[index]['id']);
        // this.map?.removeSource(this.countriesList[index]['id']);
        // this.map?.removeSource('outline' + this.countriesList[index]['id']);
        var mapLayer = this.map?.getLayer(id);
        if(typeof mapLayer !== 'undefined') {
        // Remove map layer & source.
        this.map?.removeLayer('outline' + id);
        this.map?.removeLayer(id).removeSource(id);
        
      }

}
    }
  }
  //checks the countries in the ng select and plots all the list 
  plotCountries() {
    this.selectedCountries.forEach(country => {

      this.removeSource(country)
      
    })
  

    var pages = Math.floor(this.selectedCountries.length/5) + 1; 
      for (let page = 1 ; page <= pages ; page++) {
        this.mapService.getCountriesDetails(this.selectedCountries,true,page).subscribe(data => {
        for (const index in data.countries.items) {
        var country =  data.countries.items[index].details;
        this.plotCountry(country)
    }
    })}
  }


  // takes the country geojson data and plots it in the map 
  plotCountry(country : any){
    this.map?.addSource(country.id, 
      {
          'type': 'geojson',
          data : country
      });

      // Add a new layer to visualize the polygon.
      this.map?.addLayer({
          'id': country.id,
          'type': 'fill',
          'source': country.id, // reference the data source
          'layout': {},
          'paint': {
              'fill-color': '#0080ff', // blue color fill
              'fill-opacity': 0.5
          }
      });
      // Add a black outline around the polygon.
      this.map?.addLayer({
          'id': 'outline'+ country.id ,
          'type': 'line',
          'source': country.id,
          'layout': {},
          'paint': {
              'line-color': '#000',
              'line-width': 3
          }
      });
  }

}