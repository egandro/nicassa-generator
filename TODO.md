# TODO

# all
* custom templates

# express.ts.routes

* Add a dynamic BasePath als prefix to all Controller Endpoints
* Add a parameter for "internal" or "external" 400/500 error handling e.g. vi next(err)
* Status Code handling - currently 200, 204, 400 and 500 is created
  we need a @Responses attribute to tag the controllers
* Error Object handling
* Maybe give access to req/res to the Controller e.g. via attributes or constructor?
* Support dependency injection for the constroller creation in the routes file

# angular2.client

* Support Status Codes
* Error Object handling
