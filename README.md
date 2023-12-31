# GistHub Server

GistHub Server is a Node.js web server that provides the functionality of retrieving starred gists from a user on GitHub. It is built to overcome the lack of an open API for this feature.

A cron job is set up in the GistHub Server to retrieve and update the starred gists. This cron job runs every 8 hours to ensure that the data parsed from the GitHub HTML is up to date and accurate.

This server mainly is used by [GistHub iOS App](https://github.com/ldakhoa/gisthub).

## Installation

To get started, run these instructions:

```shell
npm install
npm run dev
```

Once the server is running, you can retrieve starred gists and discover gists from a specific user by making a GET request to the following endpoint:
```
GET https://127.0.0.1:8787/users/<username>/starred?page=<index>
GET http://127.0.0.1:8787/discover?page=<index>
GET http://127.0.0.1:8787/discover/starred?page=<index>
GET http://127.0.0.1:8787/discover/forked?page=<index>
```

## License

We will ship GistHub on the App Store for free and open source entire source code as well, GistHub is licensed under [MIT](./LICENSE) so that you can do whatever you want with this source code.

However, **please do not ship this app** under your own account.