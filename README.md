# app-ancile

A Databox app to support Cornell Tech's [Ancile Project](https://github.com/ancile-project/ancile).


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

Install and configure [Ancile](https://github.com/ancile-project/ancile) into the local machine.

Place all `ancile_functions\*.py` files into Ancile, under `ancile\lib`.

Finally, try to run the following example Ancile policy:
```
{
    users: ['<a registered ancile user>'],
    purpose: 'research',
    program: `
        dp_1 = databox.get_latest_reddit_data(<session key>)
        return_to_app(data=dp_1)
    `
}
```


## Install a custom driver / app in Databox

1. Copy the driver-or-app folder inside `databox\build`
2. `./databox-install-component driver-or-app-name databoxsystems 0.5.2`
3. Start Databox (see below)
4. Login to Databox (`127.0.0.1`)
5. Goto My App > App Store and upload the manifest (from `databox\build\driver-or-app-name`)
6. Goto App Store and install the driver.

Debug:
`docker service logs driver-or-app-name`

Start Databox:
`docker run --rm -v /var/run/docker.sock:/var/run/docker.sock --network host -t databoxsystems/databox:0.5.2 /databox start -sslHostName $(hostname)`

Stop Databox:
`docker run --rm -v /var/run/docker.sock:/var/run/docker.sock -t databoxsystems/databox:0.5.2 /databox stop`
