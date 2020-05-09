[![MIT Licence][licence-image]][licence-url]
[![Build status][travis-image]][travis-url]
[![NPM Version][npm-image]][npm-url]
# WhichX

WhichX is a [Naive Bayes' Classifier](https://en.wikipedia.org/wiki/Naive_Bayes_classifier) written in Javascript for classifying short text descriptions into categories. It is a very small library with a very simple API and no dependencies. To see a working demo you can also go to http://www.rudikershaw.com/articles/whichpet.

## Installation

```bash
$ npm install whichx
```

## Usage

If you are using Node start by requiring whichx.

```js
var WhichX = require("whichx");
```

Simply define a new WhichX object. This object represents your dataset, the labels that you want your data classified into, as well as the means to add and classify descriptions.
```js
// Define your whichx object.
var whichpet = new WhichX();
```

After this you will want to add the labels you wish to give to the types of descriptions you wish to classify.
```js
// Define an array of labels for description types.
var labels = ["cat","dog","fish","horse","bird","reptile"];
// Add your labels to the whichx object.
whichpet.addLabels(labels);
// Add an extra single label to the whichx object.
whichpet.addLabels("pokemon");
```

Now you can add descriptions to each label. These descriptions, with their labels, act as your training set data.
```js
// Add a description and its label to the data set.
whichpet.addData("pokemon", "loyal and bright yellow with a lightning shaped tail");
// ... Add more here.
```

With enough data (the more the better), you can provide a description on it's own and ask the classifier which label it thinks it belongs to.
```js
// Which pet am I talking about?
var pet = whichpet.classify("Its yellow and shoots lightning");
console.log("It's a " + pet + "!");
```

That's it. Enjoy.

[licence-image]: http://img.shields.io/npm/l/gulp-rtlcss.svg?style=flat
[licence-url]: https://tldrlegal.com/license/mit-license
[travis-image]: https://travis-ci.org/rudikershaw/whichx.svg?branch=master
[travis-url]: https://travis-ci.org/rudikershaw/whichx
[npm-image]: http://img.shields.io/npm/v/whichx.svg?style=flat
[npm-url]: https://www.npmjs.org/package/whichx
