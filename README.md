# mock-server - mocking your APIs in a snap

To meet the need of rapid front end development against established or even changing APIs we created a simple yet powerful mock server.

With minimal configuration (declaring the paths to your data) you can mock a restful service with full CRUD capabilities. With a bit more configuration you can mock other calls like file upload and download, and search endpoints. And to test failure you can throw errors easily. By default mock-server uses a file based storage of the json it sends and retrieves, setting mock-server apart from other mock servers as you can quickly mimic CRUD and examine the requests and tailor the responses.

!!! we will add references to template and samples git repositories.

!!! add section on similar products

## Quick setup

You can use our mock-server in two ways, standalone or as middleware. Below samples show how to get up and running quickly, for configuration see the next section.

### Standalone from git template

Download or clone our template mock-server to get started quickly.

```console
git clone …
npm install
npm start
```

### Standalone using express server

If you follow the template sample, you can start your own server by adding the mock server to your project.

```console
yarn add @funq/mock-server
or
npm -i @funq/mock-server
```

And subsequently creating an index.js with the following lines:
```javascript
const mockserver = require('@funq/mock-server'); 
mockserver.startMockServer(<config-folder-path>, <data-folder-path>);
```


### Set up as middleware using express server

You can add mock-server to an existing server as middleware where it will return all configured paths in mock-server and turn the rest over to the actual server, allowing full or partial mocking of your API

```console
yarn add @funq/mock-server
or
npm -i @funq/mock-server
```

```javascript
const express = require('express');
const mockserver = require('@funq/mock-server'); 

const app = express();

import * as bodyParser from "body-parser"; 
app.use(bodyParser.json());

//for file upload support -- optional if you want to use file upload
import fileUpload from "express-fileupload";
app.use(fileUpload());
 
app.use(mockserver.middleware(<config-folder-path>, <data-folder-path>));

app.listen(3001);
```


## Simple Configuration

Out of the box mock-server does provide a powerful default configuration which stores and retrieves requests and response into a mock data folder. Declaring the paths of your endpoints is enough to set up a CRUD server that is fully operational.

The server uses configuration files stored in a folder specified when starting the server. Similarly the path to the data repository folder is also configured on startup.

```
mockserver.startMockServer(<config-folder-path>, <data-folder-path>);
e.g.
mockserver.startMockServer('./mock-data/config', './mock-data/data');
```

The config folder will create an auto generated global.json and optional <specific>.json files. The global.json file created can be used as the basis for your mock server.

Default created global.json:
```json
{
  "pathSettings": {
    "/": {
      "response": "Ok."
    }
  },
  "defaultConfig" : {
    "requestType": "REST",
    "statusCode": 200,
    "idName": "id",
    "response": "To Be Implemented.",
    "latency": 0,
    "otherConfig": {}
  },
  "errorConfig": {
    "statusCode": 400,
    "response": "Invalid Request."
  },
  "overwriteConfig": {
    "statusCode": null,
    "response": null,
    "latency": null
  }
}
```

For a simple CRUD server configuration the pathSettings are the only thing that need to be changed.

```json
{
  "pathSettings": {
    "/user": {
        "idName": "userId",
        "response": "/user"
      },
    "/inventory/:itemId": {
      "response": "/inventory"
    },
  }
}
```

The above config will provide 8 endpoints, on each of the paths it will provide POST, GET, PUT and DELETE endpoints. By default the server will create files in the default mock-data folder corresponding to the json that is saved with the request.

```
POST localhost:3000/user
GET localhost:3000/user?userId=1
PUT localhost:3000/user(?userId=1)
DELETE localhost:3000/user?userId=1

POST localhost:3000/inventory
GET localhost:3000/inventory/1
PUT localhost:3000/inventory(/1)
DELETE localhost:3000/inventory/1
```

On PUT we expect the object id to be present in the body and will use it to apply the update to the correct file. A PUT replaces the previous data with the newly submitted data.

## Advanced Configuration - config file and config object

mock-server uses a tiered configuration system. There are three types of configurations: default, path and override. 
- defaultConfig serve as the default configuration. 
- pathSettings specify configurations for specific paths, and 
- overrideConfig contains forced responses

Override will take precedence over pathSettings, pathSettings will take precedence over defaultConfig.

### **json file configuration**

When you start an app you specify the paths to the configuration and to the data repository holding the responses (and saving certain requests). The mock-server will create a global.json config file if no such file is present. 

Additional json files containing only pathSettings can be used to logically split up your endpoint configurations, for example if you want to mock multiple servers from one mock-server, e.g. localhost:3000/app1/.., localhost:3000/app2/.., localhost:3000/app3/.., you can add an app1.json, app2.json, app3.json to configure the specific endpoints. This is entirely optional, see the samples repository for more detail.

### **config object configuration**

Besides config file configuration, you can also use a config object to pass additional pathSettings. Config object settings will take precedence over config file configurations.
```
mockserver.startMockServer(<config-folder-path>, <data-folder-path>, <config-object>);

mockserver.startMockServer(<config-folder-path>, <data-folder-path>, 
{
  "/inventory/:itemId": {
    "response": "/inventory"
  }
});
```

The config-object can be used to seth regular or custom responses. Custom responses can be created by passing a method to the response that will return at that endpoint.

The default configurations attempt to set the fallback options, like a 200 success status.
The override configuration can be used to, for example, return errors for all endpoints. This enables you to test error responses across the board or you can set the default latency to test higher latency responses. 

## Advanced Configuration - parameters detailed

### **Path & default configuration options**

- **requestType** - *enum - default: REST* - use this to add different endpoints. Allowed values are REST, REST_PLURAL, REST_FETCH, FILE_DOWNLOAD, FILE_VIEW, FILE_UPLOAD, CUSTOM.
- **statusCode** - *number - default: 200* - the status code of a (successful) response. To test failure or non standard responses change the status code 
- **idName** - *string - default: "id"* - when making CRUD calls we expect a request to contain an id that is used to find, update or delete data
- **latency** - *number - default: 0* - to mock server latency add the time in milliseconds for the response to return
- **response** - *string|string array|function - the response option is the most complex and warrants its own detailed documentation (see below), but the default is a string starting with a / indicating a path within the mock data folder where json responses to calls reside. Omitting the / on a string will simply return the string and adding an object will return that object. 
- **otherConfig** - *object - default: {} - place holder to store any other configuration data. this may required mainly for custom processing.

### **Override configuration** 

No default override configuration options exist

- **statusCode** - *number* - use this to override all default and path status codes to, for example, quickly return 403 Unauthorized for each endpoint
- **response** - use this to override all default and path responses, to, for example, return a default error with the above 403 status code
- **latency** - *number*- use this to enforce response latency for all endpoints

### **Error configuration** 
- **statusCode** - *number - default: 400* - in instances were the server throws an error because, for example, a request is bad or data is missing, mock-server server throws a 400 error, a different code can be configured
- **response** - *string|object* - when the server throws an error it attempts to return a meaningful error, to override that error a different response can be set here

## Advanced Configuration - Custom Requests
The mock server can handle complete custom request/response logic using the CUSTOM requestType and by passing a function to the response parameter.

Sample javascript configuration is below.

```javascript
const dynamicConfig = {
  "/customreq": {
    requestType: "CUSTOM",
    idName: "testId",
    statusCode: "202",
    "otherConfig": { "custom_attr1": "value1" },
    "response": (request: any, response: any, requestConfig: any) => {
      const customResponse = processRequest(request);
      response.status(requestConfig.statusCode).send(customResponse);
    }
  }
}
```

## Example Configuration File
Each API endpoint needs to be added to the configuration. Logically separating your api endpoints in individual config files can help with maintaining the APIs. 

Below is a sample of pathSettings configurations.
```json
{
  "pathSettings": {
    "/": {
      "response": "Ok."
    },
    "/tree": {
      "idName": "treeId",
      "response": "/tree"
    },
    "/lake": {
      "idName": "lakeId",
      "response": "/lake"
    },
    "/lake/search": {
      "requestType": "REST_PLURAL",
      "idName": "lakeId",
      "latency": 1000,
      "response": "/lake"
    },
    "/lake/download": {
      "idName": "lakeId",
      "statusCode": 201,
      "response": "/lake/download/sample.pdf",
      "requestType": "FILE_DOWNLOAD"
    },
    "/user/authorize": {
      "idName": "userId",
      "statusCode": 403,
      "response": "User doesn't have persmissions."
    }
  }
}
```


