# app-ancile

A Databox app to support Cornell Tech's Ancile Project


## Description

This app initially started as a proof of concept to check if Ancile and Databox can communicate (check old commits until 25 April 2019 where we have a test Ancile policy being executed repetitively; i.e. per second).

In the current version of this app, we inverted the communication with AncileCore, mainly because of limited support for Databox Python (required as Ancile policies are also written in Python). Ancile-app now works as a bridge to the driver data, having access to all data that Ancile could be interested in. It opens endpoints that AncileCore can use to fetch data and execute the equivalent policy on them (e.g. a transformation or data minimization). In that way, we somehow replace Databox datastore permission system (i.e. declare data providers in the manifest) and use AncileCore as a coordinator.

Currently supported endpoints for TSBlob datastores are:
- `/app-ancile/ui/latest`
- `/app-ancile/ui/earliest`
- `/app-ancile/ui/last_n`
- `/app-ancile/ui/first_n`
- `/app-ancile/ui/range`
- `/app-ancile/ui/length`

In the future, we would like to port this app into Python and encapsulate AncileCore on it. AncileCore would then be able to communicate directly with the datastores and execute the policies locally.


## Instructions

First install and configure a driver that is supported in app-ancile (e.g. `driver-reddit-simulator`). Then install `app-ancile` into a locally running databox and allow access to the relevant data.

Place all `ancile_functions\*.py` files into Ancile, under `ancile\lib`.

Finally, try to run the following example Ancile policy:
```
TBD
```
