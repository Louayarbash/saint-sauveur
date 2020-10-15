//import { stripGeneratedFileSuffix } from "@angular/compiler/src/aot/util"

export interface LoginCredential{
    email: string;
    password: string;
}
/* export interface PhotosData111{
    isCover: boolean;
    photo: string;
    storagePath: string;
} */

export interface Images{
    photoData: string;
    isCover: boolean;
    storagePath: string;
}

export interface Files{     
    fileName: string;   
    fileData: string; 
    filePath: string;
    storagePath : string;
}

export interface Parkings{     
    id: string;
    description: string;   
    note: string; 
    active: boolean; 
}

export interface ParkingInfo {
    id: string, 
    number: string,
    description: string,
    active: boolean
}

export interface Services{     
    id: string;
    description: string;
    active: boolean; 
}



