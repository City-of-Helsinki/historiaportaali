# Helsinki History Portal

## Environments

Env | Branch | Drush alias | URL
--- | ------ | ----------- | ---
docker | - | - | http://historiaportaali.docker.so/
sandbox | sandbox | - | https://sandbox-w6wvm5a-c6cjuxyujjv64.eu-5.platformsh.site/
development | develop | - | https://develop-sr3snxi-c6cjuxyujjv64.eu-5.platformsh.site/
production | master | - | https://master-7rqtwti-c6cjuxyujjv64.eu-5.platformsh.site/

## Requirements

You need to have these applications installed to operate on all environments:

- [Docker](https://github.com/druidfi/guidelines/blob/master/docs/docker.md)
- [Stonehenge](https://github.com/druidfi/stonehenge)
- [Platform.sh CLI](https://docs.platform.sh/development/cli.html)

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
