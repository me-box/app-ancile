# app-ancile

A Databox app to support Cornell Tech's Ancile Project


## Description

This app initially started as a proof of concept to check if Ancile and Databox can communicate (check old commits until 25 April 2019 where we have a test Ancile policy being executed repetitively; i.e. per second).

In the current version of this app we assume that AncileApp is installed outside Databox platform but can be locally accessed through localhost, mainly because of limited support for Databox Python (required as Ancile policies are also written in Python). Ancile-app now works as a bridge to the driver data, having access to all data that Ancile could be interested in. It opens endpoints that AncileCore can use to fetch data and execute the equivalent policy on them (e.g. a transformation or data minimization). In that way, we somehow replace Databox datastore permission system (i.e. declare data providers in the manifest) and use AncileCore as a coordinator.

Currently supported endpoints for TSBlob datastores are:
- `/app-ancile/ui/tsblob/latest`
- `/app-ancile/ui/tsblob/earliest`
- `/app-ancile/ui/tsblob/last_n`
- `/app-ancile/ui/tsblob/first_n`
- `/app-ancile/ui/tsblob/range`
- `/app-ancile/ui/tsblob/length`

In the future, we would like to port this app into Python and encapsulate AncileCore on it. AncileCore would then be able to communicate directly with the datastores and execute the policies locally.


## Instructions

First install and configure a driver that is supported in app-ancile (e.g. `driver-reddit-simulator`). Then install `app-ancile` into a locally running databox and allow access to the relevant data.

Place all `ancile_functions\*.py` files into Ancile, under `ancile\lib`.

Finally, try to run the following example Ancile policy:
```
{
    users: ['<a registered ancile user>'],
    purpose: 'research',
    program: `
        dp_1 = databox.get_tsblob_latest(data_source_id='redditSimulatorData')
        test.test_transform(data=dp_1)
        general.flatten(data=dp_1)
        result.append_dp_data_to_result(data=dp_1)
    `
}
```
