//import { stripGeneratedFileSuffix } from "@angular/compiler/src/aot/util"

export interface LoginCredential{
    email: string;
    password: string;
}
export interface PhotosData{
    isCover : boolean;
    photo : string;
    storagePath : string;
}

export interface Images{
    isCover : boolean;
    storagePath : string;
}

export interface FileUpload{    
    fileName : string;   
    fileData:string; 
    filePath:string;
    fileStoragePath : string;
}


