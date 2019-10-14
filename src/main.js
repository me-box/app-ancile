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

const PORT = DATABOX_TESTING ? 8090 : process.env.PORT || '8080';

//this will ref the timeseriesblob client which will observe and write to the databox actuator (created in the driver)
let store;

if (DATABOX_TESTING) {
  store = databox.NewStoreClient(DATABOX_ZMQ_ENDPOINT, DATABOX_ARBITER_ENDPOINT, false);
} else {
  const redditSimulatorData = databox.HypercatToDataSourceMetadata(process.env['DATASOURCE_redditSimulatorData']);
  console.log('redditSimulatorData: ', redditSimulatorData);
  const redditSimulatorDataStore = databox.GetStoreURLFromHypercat(process.env['DATASOURCE_redditSimulatorData']);
  console.log('redditSimulatorDataStore: ', redditSimulatorDataStore);
  store = databox.NewStoreClient(redditSimulatorDataStore, DATABOX_ARBITER_ENDPOINT, false);
}

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/ui', function (req, res) {
  res.type('html');
  res.send(`
    <h1>Ancile App</h1>

    <p>AncileCore should use the supported endpoints to read data written from allowed drivers.</p>
    <p>Supported endpoints for TSBlob datastores are:</p>

    <ul>
      <li>/app-ancile/ui/Latest</li>
      <li>/app-ancile/ui/Earliest</li>
      <li>/app-ancile/ui/LastN</li>
      <li>/app-ancile/ui/FirstN</li>
      <li>/app-ancile/ui/Since</li>
      <li>/app-ancile/ui/Range</li>
      <li>/app-ancile/ui/Length</li>
    </ul>
  `);
});

app.get('/ui/Latest', function (req, res) {
  const { DataSourceID } = req.query;

  // Check if DataSourceID is available
  if (!DataSourceID) {
    throw new Error('DataSourceID is missing');
  }

  // read data
  store.TSBlob.Latest(DataSourceID).then((result) => {
    console.log('result:', DataSourceID, result);
    res.type('json');
    res.send({
      DataSourceID,
      data: result,
    });
  }).catch((err) => {
    console.log('get config error', err);
    throw new Error(err);
  });
});

app.get('/ui/Earliest', function (req, res) {
  const { DataSourceID } = req.query;

  // Check if DataSourceID is available
  if (!DataSourceID) {
    throw new Error('DataSourceID is missing');
  }

  // read data
  store.TSBlob.Earliest(DataSourceID).then((result) => {
    console.log('result:', DataSourceID, result);
    res.type('json');
    res.send({
      DataSourceID,
      data: result,
    });
  }).catch((err) => {
    console.log('get config error', err);
    throw new Error(err);
  });
});

app.get('/ui/LastN', function (req, res) {
  const { DataSourceID, n } = req.query;

  // Check if DataSourceID is available
  if (!DataSourceID) {
    throw new Error('DataSourceID is missing');
  }

  // Check if n is available
  if (!n) {
    throw new Error('n is missing');
  }

  // read data
  store.TSBlob.LastN(DataSourceID, n).then((result) => {
    console.log('result:', DataSourceID, result);
    res.type('json');
    res.send({
      DataSourceID,
      n,
      data: result,
    });
  }).catch((err) => {
    console.log('get config error', err);
    throw new Error(err);
  });
});

app.get('/ui/FirstN', function (req, res) {
  const { DataSourceID, n } = req.query;

  // Check if DataSourceID is available
  if (!DataSourceID) {
    throw new Error('DataSourceID is missing');
  }

  // Check if n is available
  if (!n) {
    throw new Error('n is missing');
  }

  // read data
  store.TSBlob.FirstN(DataSourceID, n).then((result) => {
    console.log('result:', DataSourceID, result);
    res.type('json');
    res.send({
      DataSourceID,
      n,
      data: result,
    });
  }).catch((err) => {
    console.log('get config error', err);
    throw new Error(err);
  });
});

app.get('/ui/Since', function (req, res) {
  const { DataSourceID, sinceTimeStamp } = req.query;

  // Check if DataSourceID is available
  if (!DataSourceID) {
    throw new Error('DataSourceID is missing');
  }

  // Check if sinceTimeStamp is available
  if (!sinceTimeStamp) {
    throw new Error('n is missing');
  }

  // read data
  store.TSBlob.Since(DataSourceID, sinceTimeStamp).then((result) => {
    console.log('result:', DataSourceID, result);
    res.type('json');
    res.send({
      DataSourceID,
      sinceTimeStamp,
      data: result,
    });
  }).catch((err) => {
    console.log('get config error', err);
    throw new Error(err);
  });
});

app.get('/ui/Range', function (req, res) {
  const { DataSourceID, fromTimeStamp, toTimeStamp } = req.query;

  // Check if DataSourceID is available
  if (!DataSourceID) {
    throw new Error('DataSourceID is missing');
  }

  // Check if fromTimeStamp is available
  if (!fromTimeStamp) {
    throw new Error('fromTimeStamp is missing');
  }

  // Check if toTimeStamp is available
  if (!toTimeStamp) {
    throw new Error('toTimeStamp is missing');
  }

  // read data
  store.TSBlob.Range(DataSourceID, fromTimeStamp, toTimeStamp).then((result) => {
    console.log('result:', DataSourceID, result);
    res.type('json');
    res.send({
      DataSourceID,
      fromTimeStamp,
      toTimeStamp,
      data: result,
    });
  }).catch((err) => {
    console.log('get config error', err);
    throw new Error(err);
  });
});

app.get('/ui/Length', function (req, res) {
  const { DataSourceID } = req.query;

  // read data
  store.TSBlob.Length(DataSourceID).then((result) => {
    console.log('result:', DataSourceID, result);
    res.type('json');
    res.send({
      DataSourceID,
      data: result,
    });
  }).catch((err) => {
    console.log('get config error', err);
    throw new Error(err);
  });
});

app.get('/status', function (req, res) {
  res.send('active');
});

//when testing, we run as http, (to prevent the need for self-signed certs etc);
if (DATABOX_TESTING) {
  console.log('[Creating TEST http server]', PORT);
  http.createServer(app).listen(PORT);
} else {
  console.log('[Creating https server]', PORT);
  const credentials = databox.GetHttpsCredentials();
  https.createServer(credentials, app).listen(PORT);
}
