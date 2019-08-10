# TKO-äly user service

![Maintainer](https://img.shields.io/badge/maintainer-TKO--%C3%A4ly-yellow.svg)

[![Build status (master)](https://api.travis-ci.org/TKOaly/user-service.svg?branch=master)](https://travis-ci.org/TKOaly/user-service)

Test coverage (master) [![codecov](https://codecov.io/gh/TKOaly/user-service/branch/master/graph/badge.svg)](https://codecov.io/gh/TKOaly/user-service)

Test coverage (dev) [![codecov](https://codecov.io/gh/TKOaly/user-service/branch/dev/graph/badge.svg)](https://codecov.io/gh/TKOaly/user-service)

![license](https://img.shields.io/github/license/TKOaly/user-service.svg)

[![devDependencies](https://david-dm.org/tkoaly/user-service/dev-status.svg)](path/to/linked/page)
[![dependencies](https://david-dm.org/tkoaly/user-service/status.svg)](path/to/linked/page)

[![TypeScript](https://badges.frapsoft.com/typescript/code/typescript.svg?v=101)](https://github.com/ellerbrock/typescript-badges/)
![GitHub top language](https://img.shields.io/github/languages/top/TKOaly/user-service.svg)

[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/TKOaly/user-service/issues)
![GitHub pull requests](https://img.shields.io/github/issues-pr/TKOaly/user-service.svg)
![GitHub issues](https://img.shields.io/github/issues/TKOaly/user-service.svg)

Microservice for authenticating users of members.tko-aly.fi.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Documentation](#documentation)
- [Installation instructions](#installation-instructions)
- [Endpoints](#endpoints)
  - [`GET /?serviceIdentifier={service identifier}`](#get-serviceidentifierservice-identifier)
  - [`POST /api/auth/requestPermissions`](#post-apiauthrequestpermissions)
  - [`GET /api/users/me?dataRequest={data request bitfield}`](#get-apiusersmedatarequestdata-request-bitfield)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Documentation

[Documentation generated by Typedoc here](https://htmlpreview.github.io/?https://github.com/TKOaly/user-service/blob/master/doc/index.html)

## Installation instructions

1.  Clone the repo

(Optional: Run `nvm install` and `nvm use` to install the correct Node version. This requires Node Version Manager (NVM) to be installed)

2.  Run `yarn install`
3.  Copy `.env.example` to `.env` and set environment variables
4.  Run `yarn test` to run unit & API tests. Run `yarn browser-test` to run E2E tests.
5.  Run `yarn start` or `yarn watch``

## Pushing to TKO-äly's Docker registry

1. Clone the repo
2. Copy `.env.deploy.example` to `.env.deploy` and set your Docker credentials
3. Run `chmod +x ./deploy-container.sh` and after that, run `./deploy-container.sh`

This will build the image and push it to `registry.tko-aly.fi` Docker registry.

### Docker

1. Copy `.env.example` to `.env` and set environment variables
2. Execute `docker build -t user-service .` in the project's root folder to build the image
3. Execute `docker run -d --rm -p PORT:PORT --env-file=.env -e DB_HOST="host.docker.internal" --name user-service-container user-service` in the project's root folder to run the image. This will mount the project folder's .env file to the container. Replace `PORT` with the port you have set in the .env file.

**Note: Since Docker v18.03, use `host.docker.internal` as the MySQL server address if you are using MacOS or Windows and running the MySQL server from the local machine.**

## Endpoints

### `GET /?serviceIdentifier={service identifier}`

Shows the user a login form, that authenticates to a service identified by the service identifier. If the user is already authenticated to the service, the form will redirect the user to the service specified.

![Login page](img/login_page.png)

If the user does not input a service identifier, the following view is shown:

![Missing service identifier page](img/missing_service_identifier.png)

If the login fails, the following view is shown:

![Login error page](img/login_page_error.png)

After clicking login, the user is redirected to the permission prompt page:

![Permission page](img/permission.png)

### `POST /api/auth/requestPermissions`

Authenticates a user with username, password and a service identifier. It returns a authorization token which can be used to fetch user information.

Example of form POST body:

```json
{
  "username": "hugeli",
  "password": "1234",
  "serviceIdentifier": "12a0058d-f9aa-1e22-b01a-6025700dab1f"
}
```

The response of this request is a form verifying what user information is used in that service (services are identified by an unique service idenfitier.)

### `GET /api/users/me?dataRequest={data request bitfield}`

The `dataRequest` query parameter is required. It is a bitfield which values are 2 ^ the [User](/src/models/User.ts) model's attribute index.

If I wan't to get the id, name and email of a user, I do `Math.pow(2, 0) | Math.pow(2, 2) | Math.pow(2, 4)`, then insert that value into the dataRequest query. It would return:

Example response:

```json
{
  "ok": true,
  "message": "Success",
  "payload": {
    "id": 420,
    "name": "Bob John",
    "email": "asd@asd.com"
  }
}
```
