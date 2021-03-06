import { Injectable } from '@angular/core';
import { ToastController,LoadingController, ActionSheetController, AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { AngularFirestore, DocumentReference } from '@angular/fire/firestore';
import { AngularFireStorage, AngularFireUploadTask } from "@angular/fire/storage";
//import { RatingUser } from '../../deals/item/firebase-item.model';
//import { VotingPublication } from '../../regulations/item/firebase-item.model';
import { EmailComposer } from '@ionic-native/email-composer/ngx';
import { Images } from '../../type';
import { CameraOptions, Camera } from '@ionic-native/camera/ngx';
import { ImagePickerOptions, ImagePicker } from '@ionic-native/image-picker/ngx';
//import { File } from "@ionic-native/file/ngx";
import { FormGroup } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LanguageService } from '../../language/language.service';
import { first } from 'rxjs/operators';
import { Crop, CropOptions } from '@ionic-native/crop/ngx';
//import { Camera, CameraDirection, CameraOptions } from '@capacitor/core';
import { Plugins } from '@capacitor/core';
import { Observable, fromEvent, merge, of } from 'rxjs';
import { mapTo } from 'rxjs/operators';


const { Filesystem,Clipboard, Share } = Plugins;


@Injectable({
  providedIn: 'root'
})
export class FeatureService {
  translations: any;
  userLanguage: any;
  buildingLevels: any;
  availableLanguages = [];
  online: Observable<boolean>; 
  currentLang: string;
  // parking: Parkings[] =[{id: '1', description: 'P1', note: '', active: true}, {id: '2', description: 'P2', note: '', active: true}, {id: '3', description: 'P3', note: '', active: true}];
  // services: Services[]= [{id: '1', description: 'ElevatorBooking', active: true}, {id: '2', description: 'NewKeyRequest', active: true}];


  constructor(    
    private toastController : ToastController,
    private loadingController : LoadingController,
    public translate : TranslateService,
    private afs: AngularFirestore,
    public afstore : AngularFireStorage,
    public emailComposer: EmailComposer,
    private camera: Camera,  
    private actionSheetController : ActionSheetController,
    private imagePicker : ImagePicker,
    //private file: File,
    private http: HttpClient,
    private alertController: AlertController,
    public languageService : LanguageService,
    private crop: Crop
    // private Transporter: Transporter
    
    ) {
      this.online = merge(
        of(navigator.onLine),
        fromEvent(window, 'online').pipe(mapTo(true)),
        fromEvent(window, 'offline').pipe(mapTo(false))
       );
    }
  getCountryList() : any[] {
    return [
      {"code": "DZ", "code3": "DZA", "name": "Algeria", "number": "012"},
      {"code": "BE", "code3": "BEL", "name": "Belgium", "number": "056"},
      {"code": "CA", "code3": "CAN", "name": "Canada", "number": "124"},
      {"code": "EG", "code3": "EGY", "name": "Egypt", "number": "818"},
      {"code": "FR", "code3": "FRA", "name": "France", "number": "250"},
      {"code": "DE", "code3": "DEU", "name": "Germany", "number": "276"},
      {"code": "IR", "code3": "IRN", "name": "Iran (Islamic Republic of)", "number": "364"},
      {"code": "IQ", "code3": "IRQ", "name": "Iraq", "number": "368"},
      {"code": "IT", "code3": "ITA", "name": "Italy", "number": "380"},
      {"code": "LB", "code3": "LBN", "name": "Lebanon", "number": "422"},
      {"code": "MX", "code3": "MEX", "name": "Mexico", "number": "484"},
      {"code": "MA", "code3": "MAR", "name": "Morocco", "number": "504"},
      {"code": "OM", "code3": "OMN", "name": "Oman", "number": "512"},
      {"code": "QA", "code3": "QAT", "name": "Qatar", "number": "634"},
      {"code": "SA", "code3": "SAU", "name": "Saudi Arabia", "number": "682"},
      {"code": "SS", "code3": "SSD", "name": "South Sudan", "number": "728"},
      {"code": "ES", "code3": "ESP", "name": "Spain", "number": "724"},
      {"code": "SD", "code3": "SDN", "name": "Sudan (the)", "number": "729"},
      {"code": "SE", "code3": "SWE", "name": "Sweden", "number": "752"},
      {"code": "CH", "code3": "CHE", "name": "Switzerland", "number": "756"},
      {"code": "SY", "code3": "SYR", "name": "Syrian Arab Republic", "number": "760"},
      {"code": "TN", "code3": "TUN", "name": "Tunisia", "number": "788"},
      {"code": "TR", "code3": "TUR", "name": "Turkey", "number": "792"},
      {"code": "AE", "code3": "ARE", "name": "United Arab Emirates (the)", "number": "784"},
      {"code": "US", "code3": "USA", "name": "United States of America (the)", "number": "840"}
    ]; 
/*     return [
      {"code": "AF", "code3": "AFG", "name": "Afghanistan", "number": "004"},
      {"code": "AL", "code3": "ALB", "name": "Albania", "number": "008"},
      {"code": "DZ", "code3": "DZA", "name": "Algeria", "number": "012"},
      {"code": "AS", "code3": "ASM", "name": "American Samoa", "number": "016"},
      {"code": "AD", "code3": "AND", "name": "Andorra", "number": "020"},
      {"code": "AO", "code3": "AGO", "name": "Angola", "number": "024"},
      {"code": "AI", "code3": "AIA", "name": "Anguilla", "number": "660"},
      {"code": "AQ", "code3": "ATA", "name": "Antarctica", "number": "010"},
      {"code": "AG", "code3": "ATG", "name": "Antigua and Barbuda", "number": "028"},
      {"code": "AR", "code3": "ARG", "name": "Argentina", "number": "032"},
      {"code": "AM", "code3": "ARM", "name": "Armenia", "number": "051"},
      {"code": "AW", "code3": "ABW", "name": "Aruba", "number": "533"},
      {"code": "AU", "code3": "AUS", "name": "Australia", "number": "036"},
      {"code": "AT", "code3": "AUT", "name": "Austria", "number": "040"},
      {"code": "AZ", "code3": "AZE", "name": "Azerbaijan", "number": "031"},
      {"code": "BS", "code3": "BHS", "name": "Bahamas (the)", "number": "044"},
      {"code": "BH", "code3": "BHR", "name": "Bahrain", "number": "048"},
      {"code": "BD", "code3": "BGD", "name": "Bangladesh", "number": "050"},
      {"code": "BB", "code3": "BRB", "name": "Barbados", "number": "052"},
      {"code": "BY", "code3": "BLR", "name": "Belarus", "number": "112"},
      {"code": "BE", "code3": "BEL", "name": "Belgium", "number": "056"},
      {"code": "BZ", "code3": "BLZ", "name": "Belize", "number": "084"},
      {"code": "BJ", "code3": "BEN", "name": "Benin", "number": "204"},
      {"code": "BM", "code3": "BMU", "name": "Bermuda", "number": "060"},
      {"code": "BT", "code3": "BTN", "name": "Bhutan", "number": "064"},
      {"code": "BO", "code3": "BOL", "name": "Bolivia (Plurinational State of)", "number": "068"},
      {"code": "BQ", "code3": "BES", "name": "Bonaire, Sint Eustatius and Saba", "number": "535"},
      {"code": "BA", "code3": "BIH", "name": "Bosnia and Herzegovina", "number": "070"},
      {"code": "BW", "code3": "BWA", "name": "Botswana", "number": "072"},
      {"code": "BV", "code3": "BVT", "name": "Bouvet Island", "number": "074"},
      {"code": "BR", "code3": "BRA", "name": "Brazil", "number": "076"},
      {"code": "IO", "code3": "IOT", "name": "British Indian Ocean Territory (the)", "number": "086"},
      {"code": "BN", "code3": "BRN", "name": "Brunei Darussalam", "number": "096"},
      {"code": "BG", "code3": "BGR", "name": "Bulgaria", "number": "100"},
      {"code": "BF", "code3": "BFA", "name": "Burkina Faso", "number": "854"},
      {"code": "BI", "code3": "BDI", "name": "Burundi", "number": "108"},
      {"code": "CV", "code3": "CPV", "name": "Cabo Verde", "number": "132"},
      {"code": "KH", "code3": "KHM", "name": "Cambodia", "number": "116"},
      {"code": "CM", "code3": "CMR", "name": "Cameroon", "number": "120"},
      {"code": "CA", "code3": "CAN", "name": "Canada", "number": "124"},
      {"code": "KY", "code3": "CYM", "name": "Cayman Islands (the)", "number": "136"},
      {"code": "CF", "code3": "CAF", "name": "Central African Republic (the)", "number": "140"},
      {"code": "TD", "code3": "TCD", "name": "Chad", "number": "148"},
      {"code": "CL", "code3": "CHL", "name": "Chile", "number": "152"},
      {"code": "CN", "code3": "CHN", "name": "China", "number": "156"},
      {"code": "CX", "code3": "CXR", "name": "Christmas Island", "number": "162"},
      {"code": "CC", "code3": "CCK", "name": "Cocos (Keeling) Islands (the)", "number": "166"},
      {"code": "CO", "code3": "COL", "name": "Colombia", "number": "170"},
      {"code": "KM", "code3": "COM", "name": "Comoros (the)", "number": "174"},
      {"code": "CD", "code3": "COD", "name": "Congo (the Democratic Republic of the)", "number": "180"},
      {"code": "CG", "code3": "COG", "name": "Congo (the)", "number": "178"},
      {"code": "CK", "code3": "COK", "name": "Cook Islands (the)", "number": "184"},
      {"code": "CR", "code3": "CRI", "name": "Costa Rica", "number": "188"},
      {"code": "HR", "code3": "HRV", "name": "Croatia", "number": "191"},
      {"code": "CU", "code3": "CUB", "name": "Cuba", "number": "192"},
      {"code": "CW", "code3": "CUW", "name": "Cura??ao", "number": "531"},
      {"code": "CY", "code3": "CYP", "name": "Cyprus", "number": "196"},
      {"code": "CZ", "code3": "CZE", "name": "Czechia", "number": "203"},
      {"code": "CI", "code3": "CIV", "name": "C??te d'Ivoire", "number": "384"},
      {"code": "DK", "code3": "DNK", "name": "Denmark", "number": "208"},
      {"code": "DJ", "code3": "DJI", "name": "Djibouti", "number": "262"},
      {"code": "DM", "code3": "DMA", "name": "Dominica", "number": "212"},
      {"code": "DO", "code3": "DOM", "name": "Dominican Republic (the)", "number": "214"},
      {"code": "EC", "code3": "ECU", "name": "Ecuador", "number": "218"},
      {"code": "EG", "code3": "EGY", "name": "Egypt", "number": "818"},
      {"code": "SV", "code3": "SLV", "name": "El Salvador", "number": "222"},
      {"code": "GQ", "code3": "GNQ", "name": "Equatorial Guinea", "number": "226"},
      {"code": "ER", "code3": "ERI", "name": "Eritrea", "number": "232"},
      {"code": "EE", "code3": "EST", "name": "Estonia", "number": "233"},
      {"code": "SZ", "code3": "SWZ", "name": "Eswatini", "number": "748"},
      {"code": "ET", "code3": "ETH", "name": "Ethiopia", "number": "231"},
      {"code": "FK", "code3": "FLK", "name": "Falkland Islands (the) [Malvinas]", "number": "238"},
      {"code": "FO", "code3": "FRO", "name": "Faroe Islands (the)", "number": "234"},
      {"code": "FJ", "code3": "FJI", "name": "Fiji", "number": "242"},
      {"code": "FI", "code3": "FIN", "name": "Finland", "number": "246"},
      {"code": "FR", "code3": "FRA", "name": "France", "number": "250"},
      {"code": "GF", "code3": "GUF", "name": "French Guiana", "number": "254"},
      {"code": "PF", "code3": "PYF", "name": "French Polynesia", "number": "258"},
      {"code": "TF", "code3": "ATF", "name": "French Southern Territories (the)", "number": "260"},
      {"code": "GA", "code3": "GAB", "name": "Gabon", "number": "266"},
      {"code": "GM", "code3": "GMB", "name": "Gambia (the)", "number": "270"},
      {"code": "GE", "code3": "GEO", "name": "Georgia", "number": "268"},
      {"code": "DE", "code3": "DEU", "name": "Germany", "number": "276"},
      {"code": "GH", "code3": "GHA", "name": "Ghana", "number": "288"},
      {"code": "GI", "code3": "GIB", "name": "Gibraltar", "number": "292"},
      {"code": "GR", "code3": "GRC", "name": "Greece", "number": "300"},
      {"code": "GL", "code3": "GRL", "name": "Greenland", "number": "304"},
      {"code": "GD", "code3": "GRD", "name": "Grenada", "number": "308"},
      {"code": "GP", "code3": "GLP", "name": "Guadeloupe", "number": "312"},
      {"code": "GU", "code3": "GUM", "name": "Guam", "number": "316"},
      {"code": "GT", "code3": "GTM", "name": "Guatemala", "number": "320"},
      {"code": "GG", "code3": "GGY", "name": "Guernsey", "number": "831"},
      {"code": "GN", "code3": "GIN", "name": "Guinea", "number": "324"},
      {"code": "GW", "code3": "GNB", "name": "Guinea-Bissau", "number": "624"},
      {"code": "GY", "code3": "GUY", "name": "Guyana", "number": "328"},
      {"code": "HT", "code3": "HTI", "name": "Haiti", "number": "332"},
      {"code": "HM", "code3": "HMD", "name": "Heard Island and McDonald Islands", "number": "334"},
      {"code": "VA", "code3": "VAT", "name": "Holy See (the)", "number": "336"},
      {"code": "HN", "code3": "HND", "name": "Honduras", "number": "340"},
      {"code": "HK", "code3": "HKG", "name": "Hong Kong", "number": "344"},
      {"code": "HU", "code3": "HUN", "name": "Hungary", "number": "348"},
      {"code": "IS", "code3": "ISL", "name": "Iceland", "number": "352"},
      {"code": "IN", "code3": "IND", "name": "India", "number": "356"},
      {"code": "ID", "code3": "IDN", "name": "Indonesia", "number": "360"},
      {"code": "IR", "code3": "IRN", "name": "Iran (Islamic Republic of)", "number": "364"},
      {"code": "IQ", "code3": "IRQ", "name": "Iraq", "number": "368"},
      {"code": "IE", "code3": "IRL", "name": "Ireland", "number": "372"},
      {"code": "IM", "code3": "IMN", "name": "Isle of Man", "number": "833"},
      {"code": "IL", "code3": "ISR", "name": "Israel", "number": "376"},
      {"code": "IT", "code3": "ITA", "name": "Italy", "number": "380"},
      {"code": "JM", "code3": "JAM", "name": "Jamaica", "number": "388"},
      {"code": "JP", "code3": "JPN", "name": "Japan", "number": "392"},
      {"code": "JE", "code3": "JEY", "name": "Jersey", "number": "832"},
      {"code": "JO", "code3": "JOR", "name": "Jordan", "number": "400"},
      {"code": "KZ", "code3": "KAZ", "name": "Kazakhstan", "number": "398"},
      {"code": "KE", "code3": "KEN", "name": "Kenya", "number": "404"},
      {"code": "KI", "code3": "KIR", "name": "Kiribati", "number": "296"},
      {"code": "KP", "code3": "PRK", "name": "Korea (the Democratic People's Republic of)", "number": "408"},
      {"code": "KR", "code3": "KOR", "name": "Korea (the Republic of)", "number": "410"},
      {"code": "KW", "code3": "KWT", "name": "Kuwait", "number": "414"},
      {"code": "KG", "code3": "KGZ", "name": "Kyrgyzstan", "number": "417"},
      {"code": "LA", "code3": "LAO", "name": "Lao People's Democratic Republic (the)", "number": "418"},
      {"code": "LV", "code3": "LVA", "name": "Latvia", "number": "428"},
      {"code": "LB", "code3": "LBN", "name": "Lebanon", "number": "422"},
      {"code": "LS", "code3": "LSO", "name": "Lesotho", "number": "426"},
      {"code": "LR", "code3": "LBR", "name": "Liberia", "number": "430"},
      {"code": "LY", "code3": "LBY", "name": "Libya", "number": "434"},
      {"code": "LI", "code3": "LIE", "name": "Liechtenstein", "number": "438"},
      {"code": "LT", "code3": "LTU", "name": "Lithuania", "number": "440"},
      {"code": "LU", "code3": "LUX", "name": "Luxembourg", "number": "442"},
      {"code": "MO", "code3": "MAC", "name": "Macao", "number": "446"},
      {"code": "MG", "code3": "MDG", "name": "Madagascar", "number": "450"},
      {"code": "MW", "code3": "MWI", "name": "Malawi", "number": "454"},
      {"code": "MY", "code3": "MYS", "name": "Malaysia", "number": "458"},
      {"code": "MV", "code3": "MDV", "name": "Maldives", "number": "462"},
      {"code": "ML", "code3": "MLI", "name": "Mali", "number": "466"},
      {"code": "MT", "code3": "MLT", "name": "Malta", "number": "470"},
      {"code": "MH", "code3": "MHL", "name": "Marshall Islands (the)", "number": "584"},
      {"code": "MQ", "code3": "MTQ", "name": "Martinique", "number": "474"},
      {"code": "MR", "code3": "MRT", "name": "Mauritania", "number": "478"},
      {"code": "MU", "code3": "MUS", "name": "Mauritius", "number": "480"},
      {"code": "YT", "code3": "MYT", "name": "Mayotte", "number": "175"},
      {"code": "MX", "code3": "MEX", "name": "Mexico", "number": "484"},
      {"code": "FM", "code3": "FSM", "name": "Micronesia (Federated States of)", "number": "583"},
      {"code": "MD", "code3": "MDA", "name": "Moldova (the Republic of)", "number": "498"},
      {"code": "MC", "code3": "MCO", "name": "Monaco", "number": "492"},
      {"code": "MN", "code3": "MNG", "name": "Mongolia", "number": "496"},
      {"code": "ME", "code3": "MNE", "name": "Montenegro", "number": "499"},
      {"code": "MS", "code3": "MSR", "name": "Montserrat", "number": "500"},
      {"code": "MA", "code3": "MAR", "name": "Morocco", "number": "504"},
      {"code": "MZ", "code3": "MOZ", "name": "Mozambique", "number": "508"},
      {"code": "MM", "code3": "MMR", "name": "Myanmar", "number": "104"},
      {"code": "NA", "code3": "NAM", "name": "Namibia", "number": "516"},
      {"code": "NR", "code3": "NRU", "name": "Nauru", "number": "520"},
      {"code": "NP", "code3": "NPL", "name": "Nepal", "number": "524"},
      {"code": "NL", "code3": "NLD", "name": "Netherlands (the)", "number": "528"},
      {"code": "NC", "code3": "NCL", "name": "New Caledonia", "number": "540"},
      {"code": "NZ", "code3": "NZL", "name": "New Zealand", "number": "554"},
      {"code": "NI", "code3": "NIC", "name": "Nicaragua", "number": "558"},
      {"code": "NE", "code3": "NER", "name": "Niger (the)", "number": "562"},
      {"code": "NG", "code3": "NGA", "name": "Nigeria", "number": "566"},
      {"code": "NU", "code3": "NIU", "name": "Niue", "number": "570"},
      {"code": "NF", "code3": "NFK", "name": "Norfolk Island", "number": "574"},
      {"code": "MP", "code3": "MNP", "name": "Northern Mariana Islands (the)", "number": "580"},
      {"code": "NO", "code3": "NOR", "name": "Norway", "number": "578"},
      {"code": "OM", "code3": "OMN", "name": "Oman", "number": "512"},
      {"code": "PK", "code3": "PAK", "name": "Pakistan", "number": "586"},
      {"code": "PW", "code3": "PLW", "name": "Palau", "number": "585"},
      {"code": "PS", "code3": "PSE", "name": "Palestine, State of", "number": "275"},
      {"code": "PA", "code3": "PAN", "name": "Panama", "number": "591"},
      {"code": "PG", "code3": "PNG", "name": "Papua New Guinea", "number": "598"},
      {"code": "PY", "code3": "PRY", "name": "Paraguay", "number": "600"},
      {"code": "PE", "code3": "PER", "name": "Peru", "number": "604"},
      {"code": "PH", "code3": "PHL", "name": "Philippines (the)", "number": "608"},
      {"code": "PN", "code3": "PCN", "name": "Pitcairn", "number": "612"},
      {"code": "PL", "code3": "POL", "name": "Poland", "number": "616"},
      {"code": "PT", "code3": "PRT", "name": "Portugal", "number": "620"},
      {"code": "PR", "code3": "PRI", "name": "Puerto Rico", "number": "630"},
      {"code": "QA", "code3": "QAT", "name": "Qatar", "number": "634"},
      {"code": "MK", "code3": "MKD", "name": "Republic of North Macedonia", "number": "807"},
      {"code": "RO", "code3": "ROU", "name": "Romania", "number": "642"},
      {"code": "RU", "code3": "RUS", "name": "Russian Federation (the)", "number": "643"},
      {"code": "RW", "code3": "RWA", "name": "Rwanda", "number": "646"},
      {"code": "RE", "code3": "REU", "name": "R??union", "number": "638"},
      {"code": "BL", "code3": "BLM", "name": "Saint Barth??lemy", "number": "652"},
      {"code": "SH", "code3": "SHN", "name": "Saint Helena, Ascension and Tristan da Cunha", "number": "654"},
      {"code": "KN", "code3": "KNA", "name": "Saint Kitts and Nevis", "number": "659"},
      {"code": "LC", "code3": "LCA", "name": "Saint Lucia", "number": "662"},
      {"code": "MF", "code3": "MAF", "name": "Saint Martin (French part)", "number": "663"},
      {"code": "PM", "code3": "SPM", "name": "Saint Pierre and Miquelon", "number": "666"},
      {"code": "VC", "code3": "VCT", "name": "Saint Vincent and the Grenadines", "number": "670"},
      {"code": "WS", "code3": "WSM", "name": "Samoa", "number": "882"},
      {"code": "SM", "code3": "SMR", "name": "San Marino", "number": "674"},
      {"code": "ST", "code3": "STP", "name": "Sao Tome and Principe", "number": "678"},
      {"code": "SA", "code3": "SAU", "name": "Saudi Arabia", "number": "682"},
      {"code": "SN", "code3": "SEN", "name": "Senegal", "number": "686"},
      {"code": "RS", "code3": "SRB", "name": "Serbia", "number": "688"},
      {"code": "SC", "code3": "SYC", "name": "Seychelles", "number": "690"},
      {"code": "SL", "code3": "SLE", "name": "Sierra Leone", "number": "694"},
      {"code": "SG", "code3": "SGP", "name": "Singapore", "number": "702"},
      {"code": "SX", "code3": "SXM", "name": "Sint Maarten (Dutch part)", "number": "534"},
      {"code": "SK", "code3": "SVK", "name": "Slovakia", "number": "703"},
      {"code": "SI", "code3": "SVN", "name": "Slovenia", "number": "705"},
      {"code": "SB", "code3": "SLB", "name": "Solomon Islands", "number": "090"},
      {"code": "SO", "code3": "SOM", "name": "Somalia", "number": "706"},
      {"code": "ZA", "code3": "ZAF", "name": "South Africa", "number": "710"},
      {"code": "GS", "code3": "SGS", "name": "South Georgia and the South Sandwich Islands", "number": "239"},
      {"code": "SS", "code3": "SSD", "name": "South Sudan", "number": "728"},
      {"code": "ES", "code3": "ESP", "name": "Spain", "number": "724"},
      {"code": "LK", "code3": "LKA", "name": "Sri Lanka", "number": "144"},
      {"code": "SD", "code3": "SDN", "name": "Sudan (the)", "number": "729"},
      {"code": "SR", "code3": "SUR", "name": "Suriname", "number": "740"},
      {"code": "SJ", "code3": "SJM", "name": "Svalbard and Jan Mayen", "number": "744"},
      {"code": "SE", "code3": "SWE", "name": "Sweden", "number": "752"},
      {"code": "CH", "code3": "CHE", "name": "Switzerland", "number": "756"},
      {"code": "SY", "code3": "SYR", "name": "Syrian Arab Republic", "number": "760"},
      {"code": "TW", "code3": "TWN", "name": "Taiwan", "number": "158"},
      {"code": "TJ", "code3": "TJK", "name": "Tajikistan", "number": "762"},
      {"code": "TZ", "code3": "TZA", "name": "Tanzania, United Republic of", "number": "834"},
      {"code": "TH", "code3": "THA", "name": "Thailand", "number": "764"},
      {"code": "TL", "code3": "TLS", "name": "Timor-Leste", "number": "626"},
      {"code": "TG", "code3": "TGO", "name": "Togo", "number": "768"},
      {"code": "TK", "code3": "TKL", "name": "Tokelau", "number": "772"},
      {"code": "TO", "code3": "TON", "name": "Tonga", "number": "776"},
      {"code": "TT", "code3": "TTO", "name": "Trinidad and Tobago", "number": "780"},
      {"code": "TN", "code3": "TUN", "name": "Tunisia", "number": "788"},
      {"code": "TR", "code3": "TUR", "name": "Turkey", "number": "792"},
      {"code": "TM", "code3": "TKM", "name": "Turkmenistan", "number": "795"},
      {"code": "TC", "code3": "TCA", "name": "Turks and Caicos Islands (the)", "number": "796"},
      {"code": "TV", "code3": "TUV", "name": "Tuvalu", "number": "798"},
      {"code": "UG", "code3": "UGA", "name": "Uganda", "number": "800"},
      {"code": "UA", "code3": "UKR", "name": "Ukraine", "number": "804"},
      {"code": "AE", "code3": "ARE", "name": "United Arab Emirates (the)", "number": "784"},
      {"code": "GB", "code3": "GBR", "name": "United Kingdom of Great Britain and Northern Ireland (the)", "number": "826"},
      {"code": "UM", "code3": "UMI", "name": "United States Minor Outlying Islands (the)", "number": "581"},
      {"code": "US", "code3": "USA", "name": "United States of America (the)", "number": "840"},
      {"code": "UY", "code3": "URY", "name": "Uruguay", "number": "858"},
      {"code": "UZ", "code3": "UZB", "name": "Uzbekistan", "number": "860"},
      {"code": "VU", "code3": "VUT", "name": "Vanuatu", "number": "548"},
      {"code": "VE", "code3": "VEN", "name": "Venezuela (Bolivarian Republic of)", "number": "862"},
      {"code": "VN", "code3": "VNM", "name": "Viet Nam", "number": "704"},
      {"code": "VG", "code3": "VGB", "name": "Virgin Islands (British)", "number": "092"},
      {"code": "VI", "code3": "VIR", "name": "Virgin Islands (U.S.)", "number": "850"},
      {"code": "WF", "code3": "WLF", "name": "Wallis and Futuna", "number": "876"},
      {"code": "EH", "code3": "ESH", "name": "Western Sahara", "number": "732"},
      {"code": "YE", "code3": "YEM", "name": "Yemen", "number": "887"},
      {"code": "ZM", "code3": "ZMB", "name": "Zambia", "number": "894"},
      {"code": "ZW", "code3": "ZWE", "name": "Zimbabwe", "number": "716"},
      {"code": "AX", "code3": "ALA", "name": "??land Islands", "number": "248"}
    ]; */
    
  }
  getCountryName(code:string):string {
    let country = this.getCountryList().find(res => res.code3 == code)
    
    return country ? country.name : "";
  }
    
getTranslationParams(key : string, params : Object)
{
  return this.translate.instant(key,params)
}

async presentLoadingWithOptions(duration) {
  const loading = await this.loadingController.create({
    spinner: "bubbles",
    duration: duration,
    message: this.translations.PleaseWait,
    translucent: true,    
    cssClass: 'custom-class custom-loading'
  });
  await loading.present();
  return loading;
}
async presentToast(message : string, duration : number){
  const toast = await this.toastController.create({
    message : message,
    duration : duration,
    position: 'middle'
  });
  await toast.present();  
}

getTranslations(lang: any) {
  // get translations for this page to use in the Language Chooser Alert
/*   this.translate.getTranslation(lang)
  .subscribe((translations) => { */
    // console.log("inside getTranslationss",translations);
    this.translations = lang.translations;
    //console.log("lolo getTranslationss",this.translations);
  // });
} 
/* async DownloadAndOpenPDF(item: FirebaseListingItemModel ){
  const options: DocumentViewerOptions = {
    title: 'My PDF'
  }
  let filePath : string;
  await this.firebaseService.afstore.ref(item.fileFullPath[0].filePath).getDownloadURL()
  .toPromise()
  .then((a)=>{  console.log('getDownloadURL',a); filePath = a;}).catch(err=>{console.log('Error:',err); });
  console.log("filePath",filePath);
  //this.document.viewDocument(filePath, 'application/pdf', options);

 //let fakeName = Date.now();
 //this.file.copyFile(filePath,item.fileFullPath[0].fileName+".pdf",this.file.dataDirectory,`${fakeName}.pdf`).then(result => {
 //this.fileOpener.open(result.nativeURL,'application/pdf');
}); 
const fileTransfer = this.transfer.create();
fileTransfer.download(filePath, this.file.dataDirectory + 'file.pdf').then((entry) => {
  console.log('download complete: ' + entry.toURL());
  let url = entry.toURL();
  //this.document.viewDocument(url, 'application/pdf', {});
  this.fileOpener.open(url,'application/pdf');
}, (error) => {
  // handle error
  console.log('error: ' + error);

});

} */

/* public getBuildingInfo(buildingId : string): Observable<Array<any>> {
  return this.afs.collection<any>('building' , ref => ref.where('building')).valueChanges({ idField: 'id' });
} */

getItem(tableName : string, itemId: string): Observable<any> {
  //console.log("getItem", itemId);
  return this.afs.doc<any>( tableName + '/' + itemId).valueChanges();
/*  .snapshotChanges()
   .pipe(
    map(a => {
      const postData = a.payload.data();
      const id = a.payload.id;
      return { id, ...postData };
    })
  ); */
}

/* async getBuildingLevels(){
  if (this.buildingLevels){
    return this.getBuildingLevels;
  }
  else{
    // await this.getUserInfo().then(() => {console.log("boo");}).catch((err)=> console.log("connection problem:",err));
  }

} */
sendEmail(email : any){
  return this.emailComposer.open(email);
}

// images operations

async selectImageSource(maxLength: number, currentLength: number, postImages: Images[], form: FormGroup) {
  const cameraOptions: CameraOptions = {

    //allowEdit:true,
    quality: 100,
    cameraDirection: this.camera.Direction.BACK,
    // targetWidth: 500,
    // targetHeight: 600,
    // destinationType: this.camera.DestinationType.DATA_URL,
    destinationType: this.camera.DestinationType.FILE_URI,
    encodingType: this.camera.EncodingType.JPEG,
    mediaType: this.camera.MediaType.PICTURE,
    correctOrientation: true,
    sourceType: this.camera.PictureSourceType.CAMERA
  };
  
  const pickerOptions: ImagePickerOptions = {
    
    maximumImagesCount: maxLength - currentLength,
    outputType: 0,
    quality: 100,
    // disable_popover: false,
    width:500,
    height:500// ,
    // message:"aywa",
    // title:"boooo"
  };

  const actionSheet = await this.actionSheetController.create({
    header: this.translations.SelectImagesSource,
    // cssClass: 'my-custom-class',
    buttons: [{
      text: this.translations.PhotoGallery,
      icon: 'images',
      handler: () => {
        //console.log("louay debug camera11", postImages);
        // if((3 - this.postImages.length) !== 1 ){            
          //this.imagePicker.hasReadPermission().then((permission)=> {console.log('Louay',permission);});
           this.imagePicker.getPictures(pickerOptions).then( async (imageData : string[]) => {
             //console.log(imageData) 
            //const loading = this.featureService.presentLoadingWithOptions(5000);
             for (let i = 0; i < imageData.length; i++) {
                //const filename = imageData[i].substring(imageData[i].lastIndexOf('/') + 1);
                //const path = imageData[i].substring(0,imageData[i].lastIndexOf('/') + 1);
                //console.log("filename",filename)
                //console.log("path",path)
                  let contents = await Filesystem.readFile({
                    path: imageData[i]
                  });
                  const photos : Images = {isCover:false, photoData: '', storagePath:''};
                  photos.isCover = false;
                  photos.photoData = "data:image/jpeg;base64," + contents.data;
                  postImages[postImages.length] = photos;
                  console.log("Louay ", photos.photoData)
                  if(form){
                    form.markAsDirty();
                  }
                }
          }
        ).catch((err) => { console.log('Error get pics',err)});  
    }
  }, {
      text: this.translations.Camera,
      icon: 'camera',
      handler: () => {
        
        this.camera.getPicture(cameraOptions).then(async (imageData: string)=> {
          //const filename = imageData.substring(imageData.lastIndexOf('/') + 1);
          //const path = imageData.substring(0,imageData.lastIndexOf('/') + 1);
          //let image = await this.file.readAsDataURL(path, filename);//.then((image)=> {
          //let image = await this.file.readAsDataURL(path, filename);
            let contents = await Filesystem.readFile({
              path: imageData
            });
            const photos : Images = {isCover:false, photoData:'', storagePath:''};
            photos.isCover = false;
            photos.photoData = "data:image/jpeg;base64," + contents.data;
            postImages[postImages.length] = photos;
            console.log("louay postImages", postImages);
            if(form){
              form.markAsDirty();
            }
            // this.changeRef.detectChanges(); // Louay
        }).catch(err => console.log(err));
      
    }
    }, {
      text: this.translations.Cancel,
      icon: 'close',
      role: 'cancel',
      handler: () => {
        console.log('Cancel clicked');
      }
    }]
  });
  // console.log("SelectPhotos",postImages);
  await actionSheet.present();
  // return postImages;
}

public createItemWithImages(itemData: any,itemImages: Images[], tableName: string)/* : Promise<DocumentReference> */ : any {    
  return this.afs.collection(tableName).add({...itemData}).then(async (res)=>{
    console.log("post id :",res.id);
    let images : any[] = [];
    if( itemImages.length > 0 ){
    for (var i = 0; i < itemImages.length; i++) {
      try {
        let uploaded = await this.uploadToStorage(itemImages[i].photoData,res.id, 'image/jpeg', '.jpeg', 'images/' /*+ this.loginService.getBuildingId() */+ '/' + tableName + '/');

        if( uploaded.state === "success"){
          images.push({ isCover: itemImages[i].isCover, storagePath: uploaded.metadata.fullPath });
      }
      }
      catch (err) {
        console.log("Error uploading pdf: ", err);
      }
  }
  if (images.length !== 0){
    itemData.images = images;  
  }
  //return this.afs.collection(this.tableName).doc(res.id).update({...itemData});
  return this.afs.collection(tableName).doc(res.id).update({images: images});
}
} 
).catch(err=> {console.log("Error insert item into DB",err)}); 
}


public async updateItemWithImages(itemData: any, itemImages : Images[], tableName: string, path:string): Promise<void> {
    
  let images : any[] = [];
  if( itemImages.length > 0 ){
  for (var i = 0; i < itemImages.length; i++) {
      if (itemImages[i].storagePath == '') {

        try {
          const uploaded = await this.uploadToStorage(itemImages[i].photoData, itemData.id, 'image/jpeg', '.jpeg', path);

          if( uploaded.state === 'success'){
            
              images.push({ isCover : itemImages[i].isCover, storagePath : uploaded.metadata.fullPath });
          }
        }
        catch (err) {
          console.log('Error uploading pdf: ', err);
        }
    }
    else{ //old photos
      images.push({ isCover : itemImages[i].isCover, storagePath : itemImages[i].storagePath });
    }
  }
  if (images.length > 0){
    //itemData.images.push(...images);
    itemData.images = images;
  }
}
return this.afs.collection(tableName).doc(itemData.id).update({...itemData});
}

public updateItemWithoutOptions(itemData: any, tableName: string): Promise<void> {
  return this.afs.collection(tableName).doc(itemData.id).update({...itemData});
}

public deleteItem(itemFiles: Array<any>, itemId: string, tableName: string): Promise<void> {
  if(itemFiles){
    if(itemFiles.length >= 0){
    this.deleteItemFromStorage(itemFiles).then(()=> console.log('success')).catch(err=> console.log(err));
  }
  }
  return this.afs.collection(tableName).doc(itemId).delete();
}

private async deleteItemFromStorage(files : any[]) {
  const storageRef = this.afstore.storage.ref();
  files.forEach(item => {
    storageRef.child(item.storagePath).delete().then(function() {
  }).catch(function(error) {
    console.log(error,"problem deleting storage" + item);
  });
});
}

public deleteFromStorage(itemPath : string){        
  //return this.afstore.ref(`${itemPath}`).delete().toPromise();
  return this.afstore.storage.ref().child(itemPath).delete();
}

public getDownloadURL(storagePath : string) : Promise<any> {
  return this.afstore.storage.ref(storagePath).getDownloadURL();   
}

public uploadToStorage(itemDataPhoto: string, id: string, contentType: string, extention: string, storagePath: string): AngularFireUploadTask {
  console.log("Uploaded",itemDataPhoto);
  let name = `${new Date().getTime()}`+ extention;        
  //return firebase.storage().ref(`images/${newName}`).putString(itemDataPhoto, 'base64', { contentType: 'image/jpeg' });
  return this.afstore.ref(storagePath + `${id}/${name}`).putString(itemDataPhoto, 'data_url', { contentType: contentType });
}

vote(votingInfo/*: VotingPublication*/){
  const votingPath = `votings/${votingInfo.publicationId}_${votingInfo.userId}`;
  return this.afs.doc(votingPath).set({...votingInfo}); 
}

getPublicationVoting(publicationId: string){
  const votingRef = this.afs.collection('votings' , ref => ref.where('publicationId', '==', publicationId));
  return votingRef.valueChanges() as Observable<any[]>;//as Observable<VotingPublication[]>;
}

getUserRating(userId: string, type: string, ratedAs: string){
  const ratingRef = this.afs.collection('ratings' , ref => ref.where('ratedUserId', '==', userId).where('dealType', '==', type).where('ratedAs', '==', ratedAs).orderBy('createdDate'));
  return ratingRef.valueChanges();
}

setUserRating(ratingInfo/*: RatingUser*/){
  const ratingPath = `ratings/${ratingInfo.dealId}_${ratingInfo.userId}`;
  return this.afs.doc(ratingPath).set({...ratingInfo});
}

public createItem(tableName: string, itemData: any, id?: string): Promise<DocumentReference | void>  {
  if (id){
    return this.afs.collection(tableName).doc(id).set({...itemData});
  }
  else {
    return this.afs.collection(tableName).add({...itemData});
  }
}

public updateItem(tableName: string, id: string, itemData: any): Promise<void> {
  return this.afs.collection(tableName).doc(id).update({...itemData});
}

 sendNotificationEmail(options: any){
  const headerDict = {
    'Content-Type': 'application/json'
  }
  
  const requestOptions = {                                                                                                                                                                                
    headers: new HttpHeaders(headerDict)
  };
   return this.http.post('https://us-central1-parkondo.cloudfunctions.net/sendInvitationEmails', options, requestOptions);
}

async openLanguageChooser() {
  this.availableLanguages = this.languageService.getLanguages()
  .map(item =>
    ({
      name: item.name,
      type: 'radio',
      label: item.name,
      value: item.code,
      checked: item.code === this.translate.currentLang
    })
  );

  const alert = await this.alertController.create({
    header: this.translations.SelectLanguage,
    inputs: this.availableLanguages,
    cssClass: 'language-alert',
    buttons: [
      {
        text: this.translations.Cancel,
        role: 'cancel',
        cssClass: 'secondary',
        handler: () => {}
      }, {
        text: this.translations.OK,
        handler: (data) => {
          if (data) {
            this.translate.use(data)
            // this.loginService.setUserLanguage(data).then(() => { this.translatee.use(data) });
          }
        }
      }
    ]
  });
  await alert.present();
}

changeLanguage(lang: string){
  this.translate.use(lang);
}

checkEmail(email: string): Observable<any> {
  console.log(email);
  //console.log("getItem", itemId);
  return this.afs.collection('invitations', ref => ref.where('emails', 'array-contains', email.toLowerCase()).orderBy('createDate', 'desc')).valueChanges({ idField: 'id' }).pipe(first());
  
/*  .snapshotChanges()
   .pipe(
    map(a => {
      const postData = a.payload.data();
      const id = a.payload.id;
      return { id, ...postData };
    })
  ); */
}

cropImage(imgPath) {
    
  const cropOptions: CropOptions = {
    
    quality: 25
//      targetHeight: 100,
//      targetWidth : 150
  }

  return this.crop.crop(imgPath, cropOptions)
    .then(
      newPath => {
       return this.croppedImageToBase64(newPath.split('?')[0])
      }  ,
      error => {
        console.log('Error cropping image' + error);
      }  
    ).catch(err => console.log("error catch", err));
    
}

async croppedImageToBase64(ImagePath) {

  // old code
  /*let copyPath = ImagePath;
  const splitPath = copyPath.split('/');
  const imageName = splitPath[splitPath.length - 1];
  const filePath = ImagePath.split(imageName)[0];

  return this.file.readAsDataURL(filePath, imageName)*/
  // end old code

      let contents = await Filesystem.readFile({
        path: ImagePath
      });
      
      return "data:image/jpeg;base64," + contents.data;

}

copyClipboard(text: string){    
  Clipboard.write({string: text}).then(() =>
    this.presentToast(this.translations.CopiedToClipboard, 2000)).catch(err => console.log(err))
}
  async share(data:any){
  await Share.share(data).then().catch(err=> console.log(err));
}

}