# Action Potential

An experimental, ultra-lightweight decision app for distributed teams (or anyone)

## Requirements

* gcloud
* Projects on GCP and Firebase

## Setup an Instance

* Create lib/
* `pip install -r requirements.txt -t lib`
* `npm install`
* Create projects on Google Cloud Platform
* Import this project into Firebase
* Update constants.py, e.g. APPNAME
* Create gcloud config (gcloud config create ap)
* Create a src/js/config/base.json file from src/js/config/base.template.js from Firebase web credentials.
* Run locally with ./server (pointing to your location for dev_appserver)
* `gulp`

## Libraries / Technologies

* https://github.com/tylermcginnis/re-base
* https://firebase.google.com/docs/database/
* ReactJS
* MaterialUI
* gulp

## Todo

- Weighting metrics (& pros/cons?)
- Non-metrics based proposal voting (?)
- Merge options
- Export to gSheet
- Password protection for decisions
- Show list of decisions contributed to as well (indexes?)
