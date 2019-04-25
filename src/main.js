// General
const https = require('https');
const http = require('http');
const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const path = require('path');

// Ancile
let AncileDefaultSettings = {};
try {
  AncileDefaultSettings = require('./ancile-secret.json');
} catch (e) {
  AncileDefaultSettings = {
    'server': '',
    'token': '',
  };
}

// DataBox
const databox = require('node-databox');
const DATABOX_ZMQ_ENDPOINT = process.env.DATABOX_ZMQ_ENDPOINT || 'tcp://127.0.0.1:5555';
const DATABOX_TESTING = !(process.env.DATABOX_VERSION);
const PORT = process.env.port || '8080';

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

const timer = setInterval(timer_callback, 1000 * 1);  // per second
let next_data_refresh = null;


app.get('/ui', function (req, res) {
  getSettings()
    .then((settings) => {
      const { server, token } = settings;

      res.type('html');
      res.send(`
        <h1>Ancile Driver Configuration</h1>
        <form action="/driver-ancile/ui/saveConfiguration" >
            Ancile Server: <input type="text" name="server" value="${server}" />
            Ancile Token: <input type="text" name="token" value="${token}" />
            <br />
            <button>Save Configuration</button>
        </form>
      `);
    });
});


app.get('/ui/saveConfiguration', (req, res) => {
  getSettings()
    .then((settings) => {
      const { server, token } = req.query;
      settings.server = server;
      settings.token = token;

      setSettings(settings)
        .then(() => {
          res.type('html');
          res.send(`
            <h1>Ancile Driver Configuration</h1>
            <p>Configuration has been successfully saved.</p>
          `);
          res.end();
        });
    });
});


app.get('/status', function (req, res) {
  res.send('active');
});

//const tsc = databox.NewTimeSeriesBlobClient(DATABOX_ZMQ_ENDPOINT, false);
const kvc = databox.NewKeyValueClient(DATABOX_ZMQ_ENDPOINT, false);

const driverSettings = databox.NewDataSourceMetadata();
driverSettings.Description = 'Ancile driver settings';
driverSettings.ContentType = 'application/json';
driverSettings.Vendor = 'Databox Inc.';
driverSettings.DataSourceType = 'ancileSettings';
driverSettings.DataSourceID = 'ancileSettings';
driverSettings.StoreType = 'kv';

kvc.RegisterDatasource(driverSettings)
  .catch((err) => {
    console.log('Error registering data source:' + err);
  });

function getSettings() {
  const datasourceid = 'ancileSettings';
  return new Promise((resolve, reject) => {
    kvc.Read(datasourceid, 'settings')
      .then((settings) => {
        //console.log('[getSettings] read response = ', settings);
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
        console.log('[getSettings] using defaults Using ----> ', settings);
        resolve(settings);
      });
  });
}

function setSettings(settings) {
  const datasourceid = 'ancileSettings';
  return new Promise((resolve, reject) => {
    kvc.Write(datasourceid, 'settings', settings)
      .then(() => {
        console.log('[setSettings] settings saved', settings);
        resolve(settings);
      })
      .catch((err) => {
        console.log('Error setting settings', err);
        reject(err);
      });
  });
}

// function save(datasourceid, data) {
//   console.log('Saving Ancile event::', data.text);
//   const json = { data };
//   tsc.Write(datasourceid, json)
//     .then((resp) => {
//       console.log('Save got response ', resp);
//     })
//     .catch((error) => {
//       console.log('Error writing to store:', error);
//     });
// }


function timer_callback() {

  getSettings()
    .then((settings) => {
      const { server, token } = settings;

      if (!server) {
        console.log('Warning: server property is empty.');
        return;
      }

      if (!token) {
        console.log('Warning: token property is empty.');
        return;
      }

      const refresh_interval = 1; // Per 1 minute

      //console.log('[timer_callback]');

      // current datetime
      var now = new Date();

      if (next_data_refresh == null ||
          next_data_refresh < now) {

        refresh_data();

        // plan next refresh
        next_data_refresh = new Date().setMinutes(now.getMinutes() + refresh_interval);
      }
    });
}

function refresh_data() {
  getSettings()
    .then((settings) => {
      const { server, token } = settings;

      console.log('[refresh_data]');

      // build data
      const data = {
        token,
        users: ['minos.tmp@gmail.com'],
        purpose: 'research',
        program: `
          dp_1 = user_specific["minos.tmp@gmail.com"].get_empty_data_pair(data_source='test')
          test.test_transform(data=dp_1)
          test.test_transform2(data=dp_1)
          general.flatten(data=dp_1)
          result.append_dp_data_to_result(data=dp_1)
        `,
      };

      // make the request
      request({
        url: path.join(server, '/api/run'),
        method: 'POST',
        json: data,
      }, (err, res, body) => {
        if (err) {
          console.error(err);
          return;
        }
        console.log(`statusCode: ${res.statusCode}`);
        console.log(body);
      });
    });
}


//when testing, we run as http, (to prevent the need for self-signed certs etc);
if (DATABOX_TESTING) {
  console.log('[Creating TEST http server]', PORT);
  http.createServer(app).listen(PORT);
} else {
  console.log('[Creating https server]', PORT);
  const credentials = databox.getHttpsCredentials();
  https.createServer(credentials, app).listen(PORT);
}
