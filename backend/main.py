from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel
from fastapi_pagination import  paginate , Params, Page
from typing import Optional
import json

#load the file only once 
with open("./countries.geojson") as file:
    data = json.load(file)

#change the format of data so the we can access it in an optimized way 
changedData = {element['properties']["name"] : element for (element) in data['features']}


app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#pydantic model for "Iso_code" route reponse
class Iso_codeResp(BaseModel):
    countries: Page


#pydantic model for "Iso_code" route request
class Iso_codeReq(BaseModel):
    countries : list
    params : Params = Params(size = 5)
    details : Optional[bool]
    
#pydantic model for "All_geometries" route response
class All_geometriesResp(BaseModel):
    geometries : list

class CountriesResp(BaseModel):
    countries : list

@app.post("/iso_code", response_model=Iso_codeResp)
async def getIsoCodes(req : Iso_codeReq ):
    countries = []

    for country in req.countries:
        if country in changedData.keys():
            countryData = changedData[country]
            if(req.details):
                countries.append({'iso_code' : countryData["id"], 'details' : countryData } )
            else:
                countries.append({'iso_code' : countryData["id"]} )
                
    
    #forcing the size of pagination to be 5 even if passed in the request 
    req.params.size = 5
    # adding pagination
    response = Iso_codeResp(countries = paginate(countries,req.params) )
    
    return response


@app.post("/all_geometries", response_model=All_geometriesResp)
async def getAllGeometries():
    response = All_geometriesResp(geometries = data['features'])
    return response


@app.get("/countries", response_model=CountriesResp)
async def getCountries():
    res = []
    for i in changedData:
        res.append({"name": i , "id" : changedData[i]['id'] })
    response = CountriesResp(countries = res)
    return response

