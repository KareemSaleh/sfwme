sfwme
=====

Not for censoring. For avoiding awkwardness.

Get it
------

`git clone -o personal git@github.com:KareemSaleh/sfwme.git sfwme`

Deployment Notes
----------------

Ensure environment is setup with the following.
```
export BASE_URL='sfwme.com'
export PORT=80
export MONGO_NODE_DRIVER_HOST=$BASE_URL
export MONGO_NODE_DRIVER_PORT=27017
export NODE_ENV='production'
export BASE_PATH=$HOME/sfwme
```

TODO v0.1.x Known Issues
------------------
* Feature: Add Chozen of pre-definded reasons.
* Bug: Mobile render problem and slowness (bootstrap?/ Jquery?)
* Bug: Problem where validator seems to hang on repeat-pattern long input strings for URL.

TODO v0.2.x
-------

* Popular Links Page with google charts and stats
* Cache expirations
* Stats of most used reasons and redirects.
* Email me this link later button.
* Self service Ads? (The green button shown on redirect could be non intrusive)
* Ensure latest versions of deps are locked in.
