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
whichpet.import(model);
```

## Can I use WhichX for classification on languages other than English?

WhichX will currently work with any language that has word boundaries (separates individual words with spaces, etc). There are however some extra steps you should take for configuring your WhichX object for other languages.

By default, WhichX ignores [stop words](https://en.wikipedia.org/wiki/Stop_word) when storing or classifying text. Stop words add noise to the data and can result in accuracy issues. WhichX comes bundled with default stop words for English. If you wish to use WhichX for another language it is advisable to change your list of stop words to be language specific.

This can be achieved like so;

```js
var wordsArray = ["your", "stop", "words", "etc"];
var whichpet = new WhichX({ stopwords: wordsArray });
```

## How can I extend the default stop words instead of replacing them?

Passing a `stopwords` array in the config replaces the defaults entirely. If you would rather keep the built-in defaults and add a few extras of your own, you can access the default list via the static `WhichX.getDefaultStopwords()` method and concatenate to it.

```js
var extraStopwords = ["meow", "bark"];
var whichpet = new WhichX({ stopwords: WhichX.getDefaultStopwords().concat(extraStopwords) });
```

## How do I get the probability score for each label instead of just the best match?

The `classify` method returns only the single best-matching label. If you want to see how the description scored against every label, use the `scores` method instead. It returns an object mapping each label name to its score. The scores sum to 1, so you can read each one as the classifier's confidence that the description belongs to that label.

```js
var whichpet = new WhichX();
whichpet.addLabels(["cat", "dog"]);
whichpet.addData("cat", "meow purr sits on lap");
whichpet.addData("dog", "bark woof wag fetch");

whichpet.scores("meow"); // { cat: 0.85..., dog: 0.14... }
```
