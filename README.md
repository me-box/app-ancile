# app-ancile

A Databox app to support Cornell Tech's Ancile Project


## Description

This app initially started as a proof of concept to check if Ancile and Databox can communicate (check old commits until 25 April 2019 where we have a test Ancile policy being executed repetitively; i.e. per second).

In the current version of this app we assume that AncileApp is installed outside Databox platform but can be accessed through `localhost`, mainly because of limited support for Databox Python (required as Ancile policies are also written in Python). Ancile-app now works as a bridge to the driver data, having access to all data that Ancile could be interested in. It opens endpoints that AncileCore can use to fetch data and execute the equivalent policy on them (e.g. a transformation or data minimization). In that way, we replace Databox datastore permission system (i.e. declare data providers in the manifest) and use AncileCore as a coordinator.

Currently supported endpoints for TSBlob datastores are:
- `/app-ancile/ui/tsblob/latest`
- `/app-ancile/ui/tsblob/earliest`
- `/app-ancile/ui/tsblob/last_n`
- `/app-ancile/ui/tsblob/first_n`
- `/app-ancile/ui/tsblob/range`
- `/app-ancile/ui/tsblob/length`

In the future, we would like to port this app into Python and encapsulate AncileCore on it. AncileCore would then be able to communicate directly with the datastores and execute the policies locally.



## Databox Instructions

First make sure that [Docker](https://www.docker.com) is installed to your system.

Create a project folder (e.g. `databox-ancile`) that will host everything.

Git clone [Databox](https://github.com/me-box/databox) into `databox-ancile\databox_dev` using `$ git clone git@github.com:me-box/databox.git databox_dev`.

Git clone [driver-reddit-simulator](https://github.com/minoskt/driver-reddit-simulator) into `databox-ancile\driver-reddit-simulator` using `$ git clone git@github.com:minoskt/driver-reddit-simulator.git`.

Git clone [app-ancile](https://github.com/minoskt/app-ancile) into `databox-ancile\app-ancile` using `$ git clone git@github.com:minoskt/app-ancile.git`.

Start Databox using `$ docker run --rm -v /var/run/docker.sock:/var/run/docker.sock --network host -t databoxsystems/databox:0.5.2 /databox start -sslHostName $(hostname)`.

Wait until databox is loaded and login to http://127.0.0.1 (non https version). Download and install the certificate. Click at "DATABOX DASHBOARD".

Make sure that Databox runs correctly and you can login without any issues (password is random and you can copy it from the terminal).

You can now stop Databox using `$ docker run --rm -v /var/run/docker.sock:/var/run/docker.sock -t databoxsystems/databox:0.5.2 /databox stop`.

Copy both `driver-reddit-simulator` and `app-ancile` folders into `databox_dev\build`.

Under `databox_dev`, run `$ ./databox-install-component driver-reddit-simulator databoxsystems 0.5.2` and `$ ./databox-install-component app-ancile databoxsystems 0.5.2`.

Start Databox again and go to: `My App -> App Store` and upload the two manifests (`databox-manifest.json`) from `driver-reddit-simulator` and `app-ancile` folders. The new driver and app will now appear in the App Store.

Go to the App Store and install `driver-reddit-simulator`. After succesfully installed, click at the `driver-reddit-simulator` to see the configuration page (`Reddit Simulator Driver Configuration`), and click at `Save Configuration` to load data from `_davros` account.

Go to the App Store and install `app-ancile`.

Test that reddit data can be retrieved when visiting https://127.0.0.1/app-ancile/ui/tsblob/latest?data_source_id=redditSimulatorData.



## Ancile Instructions

Install and configure Ancile into the local machine.

Place all `ancile_functions\*.py` files into Ancile, under `ancile\lib`.

Finally, try to run the following example Ancile policy:
```
{
    users: ['<a registered ancile user>'],
    purpose: 'research',
    program: `
        dp_1 = databox.get_latest_reddit_data()
        test.test_transform(data=dp_1)
        general.flatten(data=dp_1)
        result.append_dp_data_to_result(data=dp_1)
    `
}
```
