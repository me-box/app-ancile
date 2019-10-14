# app-ancile

A Databox app to support Cornell Tech's Ancile Project


## Description

This app initially started as a proof of concept to check if Ancile and Databox can communicate (check old commits until 25 April 2019, where we have a test Ancile policy being executed repetitively; i.e. per second).

In the current version of this app, we inverted the communication with AncileCore, mainly because of limited support for Databox Python (Ancile policies are also written in Python). Ancile-app now works as a super-app, having access to all data that Ancile could be interested in. It opens an endpoint so that AncileCore can fetch data (based on the datastore that Ancile defines) and execute the equivalent policy on them (e.g. a transformation or data minimization). In that way, we somehow replace Databox datastore permission system (i.e. declare data providers in the manifest) and use AncileCore as a coordinator.

In the future, we would like to port this app into Python and encapsulate AncileCore on it. AncileCore would then be able to communicate directly with the datastores and execute the policies locally.
