Express Yourself
================
An Express based web framework with a CouchDB backend and Handlebars view templating

Installation
------------
```npm install express-yourself```

Features
--------
### Controllers
Controllers are used to manage routes. In express-yourself, there are two major controllers to extend. Controller and RestfulController
#### Controller
TODO
##### RestfulController
TODO
### Couchdb Database
TODO
### Document Loading
Any .js files in your docs folder will be added to your database. A hash will be added and checked on app load to prevent overwriting a document unless you make changes to the object.
Note: If the object does not have a \_id field definded, it will be skipped.
### Passport Authentication
Express-yourself includes passport for authentication, and auto-includes ```/login``` and ```/logout``` routes.
### Dependency Injection
Dependency injection is included to give you easy access to all the modules.
TODO: Go in depth
### Handlebars Views
Express-yourself uses handlebars and handlebars-layouts to render views.
#### Layouts
Any .layout.hbs files in the root of your views folder will be loaded as a layout.
### Winston Logging
TODO
### Email Templating
TODO
### Cron Jobs
TODO
### Elasticsearch Searching
TODO
