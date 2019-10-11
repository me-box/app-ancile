// General
const https = require('https');
const http = require('http');
const express = require('express');
//const request = require('request');
const bodyParser = require('body-parser');

// DataBox
const databox = require('node-databox');
const DATABOX_ARBITER_ENDPOINT = process.env.DATABOX_ARBITER_ENDPOINT || 'tcp://127.0.0.1:4444';
const DATABOX_ZMQ_ENDPOINT = process.env.DATABOX_ZMQ_ENDPOINT || 'tcp://127.0.0.1:5555';
const DATABOX_TESTING = !(process.env.DATABOX_VERSION);

// Ancile
let AncileDefaultSettings = {};
try {
  AncileDefaultSettings = require('./ancile-secret.json');
} catch (e) {
  AncileDefaultSettings = {
  };
}

const PORT = process.env.port || '8080';
const store = databox.NewStoreClient(DATABOX_ZMQ_ENDPOINT, DATABOX_ARBITER_ENDPOINT);

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/ui', function (req, res) {
  getSettings()
    .then((settings) => {
      // const { } = settings;

      res.type('html');
      res.send(`
        <h1>Ancile Driver Configuration</h1>
        <p>No configuration is required at this stage.</p>
        <p>TODO: List supported datastores and add checkboxed to grant/restrict data access</p>
      `);
    });
});

app.get('/ui/getData', function (req, res) {
  getSettings()
    .then((settings) => {
      // const { } = settings;
      const { DataSourceID } = req.query;

      // Check if DataSourceID is available
      if (!DataSourceID) {
        return Promise.reject(new Error('DataSourceID is missing'));
      }

      // read data
      store.redditData.Read(DataSourceID).then((result) => {
        console.log('result:', DataSourceID, result);
        res.send('index', { data: result.value });
      }).catch((err) => {
        console.log('get config error', err);
        return Promise.reject(new Error(err));
      });

    });
});


// app.get('/ui/saveConfiguration', (req, res) => {
//   getSettings()
//     .then((settings) => {
//       const { server, token } = req.query;
//       settings.server = server;
//       settings.token = token;

//       setSettings(settings)
//         .then(() => {
//           res.type('html');
//           res.send(`
//             <h1>Ancile Driver Configuration</h1>
//             <p>Configuration has been successfully saved.</p>
//           `);
//           res.end();
//         });
//     });
// });


app.get('/status', function (req, res) {
  res.send('active');
});

const redditData = databox.NewDataSourceMetadata();
redditData.Description = 'Reddit Simulator data';
redditData.ContentType = 'application/json';
redditData.Vendor = 'Databox Inc.';
redditData.DataSourceType = 'redditSimulatorData';
redditData.DataSourceID = 'redditSimulatorData';
redditData.StoreType = 'ts/blob';

const driverSettings = databox.NewDataSourceMetadata();
driverSettings.Description = 'Ancile driver settings';
driverSettings.ContentType = 'application/json';
driverSettings.Vendor = 'Databox Inc.';
driverSettings.DataSourceType = 'ancileSettings';
driverSettings.DataSourceID = 'ancileSettings';
driverSettings.StoreType = 'kv';

store.RegisterDatasource(redditData)
  .then(() => {
    return store.RegisterDatasource(driverSettings);
  })
  .catch((err) => {
    console.log('Error registering data source:' + err);
  });

function getSettings() {
  const datasourceid = 'redditSimulatorSettings';
  return new Promise((resolve, reject) => {
    store.KV.Read(datasourceid, 'settings')
      .then((settings) => {
        console.log('[getSettings] read response = ', settings);
        if (Object.keys(settings).length === 0) {
          //return defaults
          const settings = AncileDefaultSettings;
          //console.log('[getSettings] using defaults Using ----> ', settings);
          resolve(settings);
          return;
        }

        //console.log('[getSettings]', settings);
        resolve(settings);
      })
      .catch((err) => {
        const settings = AncileDefaultSettings;
        console.log('Error getting settings', err);
        console.log('[getSettings] using defaults Using ----> ', settings);
        resolve(settings);
      });
  });
}

function setSettings(settings) {
  const datasourceid = 'redditSimulatorSettings';
  return new Promise((resolve, reject) => {
    store.KV.Write(datasourceid, 'settings', settings)
      .then(() => {
        //console.log('[setSettings] settings saved', settings);
        resolve(settings);
      })
      .catch((err) => {
        console.log('Error setting settings', err);
        reject(err);
      });
  });
}

async function save(datasourceid, data) {
  console.log('Saving Reddit Simulator event::', data);
  const json = { data };
  store.TSBlob.Write(datasourceid, json)
    .then((resp) => {
      console.log('Save got response ', resp);
    })
    .catch((error) => {
      console.log('Error writing to store:', error);
    });
}

//when testing, we run as http, (to prevent the need for self-signed certs etc);
if (DATABOX_TESTING) {
  console.log('[Creating TEST http server]', PORT);
  http.createServer(app).listen(PORT);
} else {
  console.log('[Creating https server]', PORT);
  const credentials = databox.GetHttpsCredentials();
  https.createServer(credentials, app).listen(PORT);
}
