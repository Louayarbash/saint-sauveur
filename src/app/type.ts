//import { stripGeneratedFileSuffix } from "@angular/compiler/src/aot/util"

export interface LoginCredential{
    email: string;
    password: string;
}
export interface PhotosArray{
    isCover : boolean;
    photo : string;
    photoStoragePath : string;
}
export interface FileUpload{    
    fileName : string;   
    fileData:string; 
    filePath:string;
    fileStoragePath : string;
}


