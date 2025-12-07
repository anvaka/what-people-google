# [what-people-google](https://what-people-google.anvaka.com/)

Visualization of what people google:

[![why is...](https://raw.githubusercontent.com/anvaka/what-people-google/main/docs/why_is.png)](https://what-people-google.anvaka.com/#?map=world)

For each country (or state) it renders top Google autocomplete results as a map.

Currently it renders answers for the following questions:

* Why is [country name] ... ?
* Why does [country name] ... ?
* Can [country name] ... ?
* Does [country name] ... ?
* How [country name] ... ?
* [country name] is not ...
* When will [country name] ...

Play with it here:

## [World](https://what-people-google.anvaka.com/#?map=world)
## [United States](https://what-people-google.anvaka.com/#?map=usa)

If you want to have your own question rendered - open issue [here](https://github.com/anvaka/what-people-google/issues).

# How it is made?

For each name, I collected top 10 autosuggestions from Google. I use topojson and D3 to render map.
You can explore source code starting from the [`index.js`](https://github.com/anvaka/what-people-google/blob/main/index.js) file.
Below is a little bit more context.

## Queries suggestions

Google has [removed](https://webmasters.googleblog.com/2015/07/update-on-autocomplete-api.html) its
autosuggestion API, so the data is pre-computed offline and stored into `data/queries.json` file.

You can read more about available workaround [here](http://stackoverflow.com/questions/6428502/google-search-autocomplete-api).
The "workaround" is not built into the website, since Google may block your browser if you use "workaround" aggressively.

## Map rendering

I'm using trimmed-down topojson file from [this](http://stackoverflow.com/q/19941975/125351) stackoverflow thread.
The file has only States outline, and does not include counties, which allows me to save space.

## Libraries

I didn't want to use any UI-level libraries (like React or vue.js), mostly because the UI
is super simple. All view-layer code can be found in `view` folder.

NOTE: I implemented the USA map first, and then couldn't wait to see how world map
would look like. As a result I sacrificed quality for time. The code is dirtier
than I would like it to be. Hope to clean it later.

## Hosting

The hosting and CI is provided by [netlify.com](https://www.netlify.com/) - it's
free for open source and very easy to use.

# license

MIT
