# [what-people-google](https://what-people-google.anvaka.com/)

Visualization of what people google:

![why is state name ... ?](https://raw.githubusercontent.com/anvaka/what-people-google/master/docs/why_is.png)

For each State in the United States of America it renders top Google autocomplete
results as a map.

Currently it renders answers for the following questions:

* Why is [state name] ... ?
* Why does [state name] ... ?
* Can [state name] ... ?
* Does [state name] ... ?
* How [state name] ... ?
* [state name] is not ...

It is fun to explore what people search about States. Play with it here: https://what-people-google.anvaka.com/

If you want to have your own question rendered - open issue [here](https://github.com/anvaka/what-people-google/issues).


# How it is made?

For each states, I collected top 10 autosuggestions from Google. Then I use topojson
and D3 to render them on a map. You can explore source code starting from the [`index.js`](https://github.com/anvaka/what-people-google/blob/master/index.js) file.
Below is a little bit more context.

## Queries suggestions

Google has [removed](https://webmasters.googleblog.com/2015/07/update-on-autocomplete-api.html) its
autosuggestions API, so the data is pre-computed offline and stored into `data/queries.json` file.

You can read more about available workaround [here](http://stackoverflow.com/questions/6428502/google-search-autocomplete-api).
The workarounds are not include in the website, since Google will block
your browser if you use them aggressively.

## Map rendering

I'm using trimmed-down topojson file from [this](http://stackoverflow.com/q/19941975/125351) stackoverflow thread.
The file has only States outline, and does not include counties.

The main map rendering code is in `view/createMap.js`.

## Libraries

I didn't want to use any UI-level libraries (like React or vue.js), mostly because the UI
is super simple. All view-layer code can be found in `view` folder.

Animations are mostly done by CSS3:

![fade in animation](https://raw.githubusercontent.com/anvaka/what-people-google/master/docs/css-animation.gif)

The map is rendered as SVG with d3, and pan/zoom support is done by [panzoom](https://github.com/anvaka/panzoom):

![zoom in animation](https://raw.githubusercontent.com/anvaka/what-people-google/master/docs/zoom.gif)

## Hosting

The hosting and CI is provided by [netlify.com](https://www.netlify.com/) - it's
free for open source and very easy to use.

# Future plans

This seems like a fun thing to do. I was thinking about extending this to render
full world map. Please reach out to me if you have other suggestions!

# license

MIT
