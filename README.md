## Running Locally

Make sure you have [Node.js](http://nodejs.org/) and the [Heroku CLI](https://cli.heroku.com/) installed.

```sh
$ npm run watch 
$ PUBLISHABLE_KEY=<STRIPE_PUBLIC_KEY> SECRET_KEY=<STRIPE_PRIVATE_KEY> npm run watch
```

```sh
$ heroku config:set PUBLISHABLE_KEY=<STRIPE_PUBLIC_KEY> SECRET_KEY=<STRIPE_PRIVATE_KEY> --app immense-plains-75598
```

Your app should now be running on [localhost:5000](http://localhost:5000/).


Built using Heroku's starter setup that I found.

https://devcenter.heroku.com/articles/getting-started-with-nodejs?singlepage=true
