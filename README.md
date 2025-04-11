# Helsinki History Portal

## Environments

Env | Branch | Drush alias | URL
--- | ------ | ----------- | ---
docker | - | - | http://historiaportaali.docker.so
test | develop | - | -
develop | develop | - | https://nginx-helhist-dev.apps.arodevtest.hel.fi
staging | master | - | -
production | master | - | https://historia.hel.fi

## Requirements

You need to have these applications installed to operate on all environments:

- [Docker](https://github.com/druidfi/guidelines/blob/master/docs/docker.md)
- [Stonehenge](https://github.com/druidfi/stonehenge)
- [Openshift CLI](https://github.com/openshift/oc)
  - See [Using OpenShift Origin Client (OC)](https://github.com/City-of-Helsinki/drupal-helfi-platform/wiki/Using-OpenShift-Origin-Client-(OC)) - e.g. db fetching

## Running Stonehenge
```
stonehenge up
```

In project directory, start with:

```
$ make up
```

Stop with:

```
$ make stop
```

If only stopped, Stonehenge will run on boot. Destroy with:

```
$ make down
```

If stopping/destroying Stonehenge breaks networking, run:

```
cd /etc/
sudo rm resolv.conf
sudo ln -s /run/resolvconf/resolv.conf
sudo systemctl restart resolvconf.service
```

## Create and start the project

To create and start the environment, in project directory, have `dump.sql` and:

```
$ make fresh
```

Or have site running with `make up` and sync `dump.sql`
```
$ make drush-sync-db
```

## Login to Drupal container

```
$ make shell
```

## Misc

- Web root is `/public`
- Configuration is in `/conf/cmi`
- Run `make help` to list all available commands
