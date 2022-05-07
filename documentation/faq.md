# FAQs

## How can I export or import a previously generated model?

If you have a small dataset it is advisable to store the data for your model separately in your preferred format and then rebuild this model each time. Doing it this way will prevent you from tightly coupling your code to this library.

However, this is isn't always practical. If this is impractical in your case then you can do the following;
```js
var whichpet = new WhichX();
// ... Build your model here.
var model = whichpet.export();
```

That model can then be stored and used to pre-populate another WhichX object.

```js
var whichpet = new WhichX();
var model = retrieveModel(); 
whichpet.export(model);
```

## Can I use WhichX for classification on languages other than English?

WhichX will currently work with any language that has word boundaries (separates individual words with spaces, etc). There are however some extra steps you should take for configuring your WhichX object for other languages.

By default, WhichX ignores [stop words](https://en.wikipedia.org/wiki/Stop_word) when storing or classifying text. Stop words add noise to the data and can result in accuracy issues. WhichX comes bundled with default stop words for English. If you wish to use WhichX for another language it is advisable to change your list of stop words to be language specific.

This can be achieved like so;

```js
var wordsArray = ["your", "stop", "words", "etc"];
var whichpet = new WhichX({ stopwords: wordsArray });
```
