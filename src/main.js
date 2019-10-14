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
    <p>AncileCore should use the endpoint '/app-ancile/ui/getData' to read data written from an allowed driver.</p>
  `);
});

app.get('/ui/getData', function (req, res) {
  const { DataSourceID } = req.query;

  // Check if DataSourceID is available
  if (!DataSourceID) {
    throw new Error('DataSourceID is missing');
  }

  // read data
  store.TSBlob.Last(DataSourceID).then((result) => {
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
