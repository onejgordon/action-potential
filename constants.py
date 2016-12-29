
# General info

COMPANY_NAME = "Shore East"
SITENAME = "Action Potential"
EMAIL_PREFIX = "[ %s ] " % SITENAME
APPNAME = "action-potential"
BASE = "http://%s.appspot.com" % APPNAME
API_AUTH = "waywayb4ck"
PLAY_STORE_LINK = ""

DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

# Branding

CL_PRIMARY = "#409777"
CL_PRIMARY_DK = "#275D4A"

# Emails
APP_OWNER = "onejgordon@gmail.com" # This should be an owner of the cloud project
INSTALL_PW = "REPLACEWITHYOURPASSWORD"
ADMIN_EMAIL = APP_OWNER
ERROR_EMAIL = APP_OWNER
NOTIF_EMAILS = [APP_OWNER]
SENDER_EMAIL = "%s Notifications <noreply@%s.appspotmail.com>" % (SITENAME, APPNAME)

GA_ID = "UA-7713869-13"
SVC_DATA_MCKEY = "%s:%s" # svc:date
MEMCACHE_EXPIRE_SECS = 60*60*3

# Flags
DEBUG_API = False

TEST_VERSIONS = ["test"]

MAX_REQUEST_SECONDS = 40


class SERVICE():

    # Service Keys
    GMAIL = "g_mail"
    GCAL = "g_calendar"
    GTASKS = "g_tasks"
    GDRIVE = "g_drive"
    NYT_NEWS = "nyt_news"

    # Statuses

    NOT_LOADED = 0
    LOADING = 1
    ERROR = 2
    LOADED = 3

    # Item Types
    EMAIL = 1
    EVENT = 2
    PHOTO = 3
    TASK = 4
    DOCUMENT = 5
    NEWS = 6

    # Sync with AppConstants
    SCOPES = {
        GMAIL: "https://mail.google.com/",
        GTASKS: "https://www.googleapis.com/auth/tasks.readonly",
        GCAL: "https://www.googleapis.com/auth/calendar.readonly",
        GDRIVE: "https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.photos.readonly"
    }

    DEFAULT = []


class ERROR():
  OK = 0
  UNAUTHORIZED = 1
  BAD_TOKEN = 2
  USER_NOT_FOUND = 3
  MALFORMED = 4
  AUTH_FAILED = 5
  SENSOR_NOT_FOUND = 6

  OTHER = 99

  LABELS = {OK: "OK", UNAUTHORIZED: "Unauthorized", BAD_TOKEN: "Bad Token", USER_NOT_FOUND: "User not found", MALFORMED: "Malformed Request!", AUTH_FAILED: "Auth failed"}

class USER():
    USER = 1
    ADMIN = 2

    LABELS = {USER: "User", ADMIN: "Admin"}

COUNTRIES = [
    ("US","United States"),
    ("AF","Afghanistan"),
    ("AX","Aland Islands"),
    ("AL","Albania"),
    ("DZ","Algeria"),
    ("AS","American Samoa"),
    ("AD","Andorra"),
    ("AO","Angola"),
    ("AI","Anguilla"),
    ("AQ","Antarctica"),
    ("AG","Antigua and Barbuda"),
    ("AR","Argentina"),
    ("AM","Armenia"),
    ("AW","Aruba"),
    ("AU","Australia"),
    ("AT","Austria"),
    ("AZ","Azerbaijan"),
    ("BS","Bahamas"),
    ("BH","Bahrain"),
    ("BD","Bangladesh"),
    ("BB","Barbados"),
    ("BY","Belarus"),
    ("BE","Belgium"),
    ("BZ","Belize"),
    ("BJ","Benin"),
    ("BM","Bermuda"),
    ("BT","Bhutan"),
    ("BO","Bolivia, Plurinational State of"),
    ("BQ","Bonaire, Sint Eustatius and Saba"),
    ("BA","Bosnia and Herzegovina"),
    ("BW","Botswana"),
    ("BV","Bouvet Island"),
    ("BR","Brazil"),
    ("IO","British Indian Ocean Territory"),
    ("BN","Brunei Darussalam"),
    ("BG","Bulgaria"),
    ("BF","Burkina Faso"),
    ("BI","Burundi"),
    ("KH","Cambodia"),
    ("CM","Cameroon"),
    ("CA","Canada"),
    ("CV","Cape Verde"),
    ("KY","Cayman Islands"),
    ("CF","Central African Republic"),
    ("TD","Chad"),
    ("CL","Chile"),
    ("CN","China"),
    ("CX","Christmas Island"),
    ("CC","Cocos (Keeling) Islands"),
    ("CO","Colombia"),
    ("KM","Comoros"),
    ("CG","Congo"),
    ("CD","Congo, the Democratic Republic of the"),
    ("CK","Cook Islands"),
    ("CR","Costa Rica"),
    ("CI","Cote d'Ivoire"),
    ("HR","Croatia"),
    ("CU","Cuba"),
    ("CW","Curacao"),
    ("CY","Cyprus"),
    ("CZ","Czech Republic"),
    ("DK","Denmark"),
    ("DJ","Djibouti"),
    ("DM","Dominica"),
    ("DO","Dominican Republic"),
    ("EC","Ecuador"),
    ("EG","Egypt"),
    ("SV","El Salvador"),
    ("GQ","Equatorial Guinea"),
    ("ER","Eritrea"),
    ("EE","Estonia"),
    ("ET","Ethiopia"),
    ("FK","Falkland Islands (Malvinas)"),
    ("FO","Faroe Islands"),
    ("FJ","Fiji"),
    ("FI","Finland"),
    ("FR","France"),
    ("GF","French Guiana"),
    ("PF","French Polynesia"),
    ("TF","French Southern Territories"),
    ("GA","Gabon"),
    ("GM","Gambia"),
    ("GE","Georgia"),
    ("DE","Germany"),
    ("GH","Ghana"),
    ("GI","Gibraltar"),
    ("GR","Greece"),
    ("GL","Greenland"),
    ("GD","Grenada"),
    ("GP","Guadeloupe"),
    ("GU","Guam"),
    ("GT","Guatemala"),
    ("GG","Guernsey"),
    ("GN","Guinea"),
    ("GW","Guinea-Bissau"),
    ("GY","Guyana"),
    ("HT","Haiti"),
    ("HM","Heard Island and McDonald Islands"),
    ("VA","Holy See (Vatican City State)"),
    ("HN","Honduras"),
    ("HK","Hong Kong"),
    ("HU","Hungary"),
    ("IS","Iceland"),
    ("IN","India"),
    ("ID","Indonesia"),
    ("IR","Iran, Islamic Republic of"),
    ("IQ","Iraq"),
    ("IE","Ireland"),
    ("IM","Isle of Man"),
    ("IL","Israel"),
    ("IT","Italy"),
    ("JM","Jamaica"),
    ("JP","Japan"),
    ("JE","Jersey"),
    ("JO","Jordan"),
    ("KZ","Kazakhstan"),
    ("KE","Kenya"),
    ("KI","Kiribati"),
    ("KP","Korea, Democratic People's Republic of"),
    ("KR","Korea, Republic of"),
    ("KW","Kuwait"),
    ("KG","Kyrgyzstan"),
    ("LA","Lao People's Democratic Republic"),
    ("LV","Latvia"),
    ("LB","Lebanon"),
    ("LS","Lesotho"),
    ("LR","Liberia"),
    ("LY","Libya"),
    ("LI","Liechtenstein"),
    ("LT","Lithuania"),
    ("LU","Luxembourg"),
    ("MO","Macao"),
    ("MK","Macedonia, the former Yugoslav Republic of"),
    ("MG","Madagascar"),
    ("MW","Malawi"),
    ("MY","Malaysia"),
    ("MV","Maldives"),
    ("ML","Mali"),
    ("MT","Malta"),
    ("MH","Marshall Islands"),
    ("MQ","Martinique"),
    ("MR","Mauritania"),
    ("MU","Mauritius"),
    ("YT","Mayotte"),
    ("MX","Mexico"),
    ("FM","Micronesia, Federated States of"),
    ("MD","Moldova, Republic of"),
    ("MC","Monaco"),
    ("MN","Mongolia"),
    ("ME","Montenegro"),
    ("MS","Montserrat"),
    ("MA","Morocco"),
    ("MZ","Mozambique"),
    ("MM","Myanmar"),
    ("NA","Namibia"),
    ("NR","Nauru"),
    ("NP","Nepal"),
    ("NL","Netherlands"),
    ("NC","New Caledonia"),
    ("NZ","New Zealand"),
    ("NI","Nicaragua"),
    ("NE","Niger"),
    ("NG","Nigeria"),
    ("NU","Niue"),
    ("NF","Norfolk Island"),
    ("MP","Northern Mariana Islands"),
    ("NO","Norway"),
    ("OM","Oman"),
    ("PK","Pakistan"),
    ("PW","Palau"),
    ("PS","Palestinian Territory, Occupied"),
    ("PA","Panama"),
    ("PG","Papua New Guinea"),
    ("PY","Paraguay"),
    ("PE","Peru"),
    ("PH","Philippines"),
    ("PN","Pitcairn"),
    ("PL","Poland"),
    ("PT","Portugal"),
    ("PR","Puerto Rico"),
    ("QA","Qatar"),
    ("RE","Reunion"),
    ("RO","Romania"),
    ("RU","Russian Federation"),
    ("RW","Rwanda"),
    ("BL","Saint Barthelemy"),
    ("SH","Saint Helena, Ascension and Tristan da Cunha"),
    ("KN","Saint Kitts and Nevis"),
    ("LC","Saint Lucia"),
    ("MF","Saint Martin (French part)"),
    ("PM","Saint Pierre and Miquelon"),
    ("VC","Saint Vincent and the Grenadines"),
    ("WS","Samoa"),
    ("SM","San Marino"),
    ("ST","Sao Tome and Principe"),
    ("SA","Saudi Arabia"),
    ("SN","Senegal"),
    ("RS","Serbia"),
    ("SC","Seychelles"),
    ("SL","Sierra Leone"),
    ("SG","Singapore"),
    ("SX","Sint Maarten (Dutch part)"),
    ("SK","Slovakia"),
    ("SI","Slovenia"),
    ("SB","Solomon Islands"),
    ("SO","Somalia"),
    ("ZA","South Africa"),
    ("GS","South Georgia and the South Sandwich Islands"),
    ("SS","South Sudan"),
    ("ES","Spain"),
    ("LK","Sri Lanka"),
    ("SD","Sudan"),
    ("SR","Suriname"),
    ("SJ","Svalbard and Jan Mayen"),
    ("SZ","Swaziland"),
    ("SE","Sweden"),
    ("CH","Switzerland"),
    ("SY","Syrian Arab Republic"),
    ("TW","Taiwan, Province of China"),
    ("TJ","Tajikistan"),
    ("TZ","Tanzania, United Republic of"),
    ("TH","Thailand"),
    ("TL","Timor-Leste"),
    ("TG","Togo"),
    ("TK","Tokelau"),
    ("TO","Tonga"),
    ("TT","Trinidad and Tobago"),
    ("TN","Tunisia"),
    ("TR","Turkey"),
    ("TM","Turkmenistan"),
    ("TC","Turks and Caicos Islands"),
    ("TV","Tuvalu"),
    ("UG","Uganda"),
    ("UA","Ukraine"),
    ("AE","United Arab Emirates"),
    ("GB","United Kingdom"),
    ("UM","United States Minor Outlying Islands"),
    ("UY","Uruguay"),
    ("UZ","Uzbekistan"),
    ("VU","Vanuatu"),
    ("VE","Venezuela, Bolivarian Republic of"),
    ("VN","Viet Nam"),
    ("VG","Virgin Islands, British"),
    ("VI","Virgin Islands, U.S."),
    ("WF","Wallis and Futuna"),
    ("EH","Western Sahara"),
    ("YE","Yemen"),
    ("ZM","Zambia"),
    ("ZW","Zimbabwe")
]