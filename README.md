# Whichpet

Whichpet is a [Naive Bayes' Classifier](https://en.wikipedia.org/wiki/Naive_Bayes_classifier) written in Javascript for classifying short text descriptions into categories. 
The whichpet.js is where all the logic is and the rest of the project serves only as an example of how the whichpet.js should be used. In the index.html we use the example 
of a classifier designed to guess which type of pet is being described in a short description. But the Javascript Whichpet object can be used to classify any types of 
descriptions you can put labels to.

## Usage

Simply define a new Whichpet object. This object represents your dataset, the labels that you want your data classified into, as well as the means to add and classify descriptions.
```js
    // Define your whichpet object.
    var whichpet = new Whichpet();
```

After this you will want to add the labels you wish to give to the types of descriptions you wish to classify.
```js
    // Define an array of labels for description types.
    var labels = ["cat","dog","fish","horse","bird","reptile"];
    // Add your labels to the whichpet object.
    whichpet.addLabels(labels);
    // Add an extra single label to the whichpet object.
    whichpet.addLabels("pokemon");
```

Now you can add descriptions to each label. These descriptions, with their labels, act as your training set data.
```js
    // Add a description and its label to the data set.
    whichpet.addToData("pokemon", "loyal and bright yellow with a lightning shaped tail");
    // ... Add more here.
```

With enough data (the more the better), you can provide a description on it's own and ask the classifier which label it thinks it belongs to.
```js
    // Which pet am I talking about?
    var pet = whichpet.findMostLikelyLabel("Its yellow and shoots lightning");
    echo "It's a " + pet + "!";
```

That's it. Enjoy.