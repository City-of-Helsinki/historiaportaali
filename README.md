# Helsinki History Portal

## Environments

Env | Branch | Drush alias | URL
--- | ------ | ----------- | ---
docker | - | - | http://historiaportaali.docker.so/
test | develop | - | https://nginx-helhist-test.agw.arodevtest.hel.fi/
develop | develop | - | https://nginx-helhist-dev.agw.arodevtest.hel.fi/
staging | master | - | -
production | master | - | https://historia.hel.fi/

## Requirements

You need to have these applications installed to operate on all environments:

- [Docker](https://github.com/druidfi/guidelines/blob/master/docs/docker.md)
- [Stonehenge](https://github.com/druidfi/stonehenge)
- [Openshift CLI](https://github.com/openshift/oc)

## Running Stonehenge

In Stonehenge directory, start with:

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

To create and start the environment, in project directory:

```
$ make up
```

(Do this twice if you get `ERROR 2002 (HY000): Can't connect to MySQL server on 'db' (115)`)

## Import database

Rename file to `dump.sql` and run:

```
$ make drush-sync-db
```

## Login to Drupal container

This will log you inside the app container:

```
$ make shell
```

## Misc

- Web root is `/public`
- Configuration is in `/conf/cmi`
- Run `make help` to list all available commands
