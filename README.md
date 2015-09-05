  AlgoBuy
===========

A demo app to showcase the use of the [Algolia](https://www.algolia.com) 
Javascript client with [React](http://facebook.github.io/react/) to build an 
advanced e-commerce auto-complete menu.


# Getting started
-----------------

## Requirements

### Node.js & npm
Make sure you have [Node](https://nodejs.org) installed and up to date.

### Gulp
Tasks (build, lint, watch/livereload...) for this project are managed using Gulp,
 which must be installed at the global level using NPM:
 
    npm install -g gulp

### Ruby & Bundler
`scss-lint` requires Ruby and the `scss_lint` gem to run properly, so make sure
you have a working Ruby installation.


## Project setup

Install all Node modules:

    npm install

Install required gems:

    bundle install

That's it! You can now use the available Gulp tasks and get to work! 


# Project tasks
---------------

## lint

    gulp lint

Will run ESLint and scss-lint to make sure the code is on par with expected 
coding standards.


## build
 
    gulp build
    
or:

    gulp build --production

Bundles all Javascript code together, transpiles SCSS to CSS code, outputs 
everything to the `dist` directory and also copies the `app/assets` directory 
there.
  
The `lint` task will be ran prior to building and the process will stop if there
is any linting error.

When using the `--production` flag, generated JS and CSS files will be uglified/minified.  
