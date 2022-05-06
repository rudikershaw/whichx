var assert = require("assert");
var Whichx = require("../src");

function classificationAssertions(classifier) {
    it("should classify text 'correctly'", function() {
        assert.equal(classifier.classify("sits"), "cat");
        assert.equal(classifier.classify("bark"), "dog");

        classifier.addData("dog", "sits sits");
        assert.equal(classifier.classify("sits"), "dog");
    });

    it("should classify by most instances when unsure", function() {
        classifier.addData("dog", "test");
        assert.equal(classifier.classify("never"), "dog");
    });

    it("should not be confused by unknown words", function() {
        assert.equal(classifier.classify("meow unknown"), "cat");
    });
};

describe("WhichX", function() {
    describe("constructor", function() {
        var classifier = new Whichx();

        it("should create an object", function() {
            assert.equal(typeof classifier, "object");
        });

        it("should create a unique object", function() {
            var newClassifier = new Whichx();
            newClassifier.property = 1;
            assert.equal(classifier.property, undefined);
        });

        it("object should have 3 main methods", function() {
            assert.ok(classifier.addData && classifier.addLabels && classifier.classify);
        });

        it("object should have key vars hidden", function() {
            assert.ok(!(classifier.typesMap) && !(classifier.STOPWORDS) && !(classifier.processToArray));
        });

        it("object should have default classify value", function() {
            assert.equal(classifier.classify("no labels"), undefined);
        });
    });

    describe("labels", function() {
        var classifier = new Whichx();
        var validLabels = ["cat", "dog", "hippopotamus", ["horse", "lizard"], "pájaro"];
        var invalidLabels = ["total", "Total", "constructor", "cat", {}, /test/, 1];

        it("should take valid label strings", function() {
            var i = 0;
            for (i; i < validLabels.length; i++) {
                classifier.addLabels(validLabels[i]);
            }
        });

        it("should reject invalid label strings", function() {
            var i = 0;
            for (i; i < invalidLabels.length; i++) {
                try {
                    classifier.addLabels(invalidLabels[i]);
                    assert.ok(false);
                } catch (e) {
                    assert.equal(e.message, "Invalid label '" + invalidLabels[i] + "' of type '" + typeof invalidLabels[i] + "'. Expected an Array or a string.");
                }
            }
        });
    });

    describe("descriptions", function() {
        var classifier = new Whichx();
        var validLabels = ["cat", "dog", "hippopotamus", "horse", "lizard", "pájaro"];

        before(function() {
            classifier.addLabels(validLabels);
        });

        it("should take valid descriptions", function() {
            classifier.addData("cat", "meow purr sits on lap rasguño");
            classifier.addData("dog", "bark woof wag sits fetch");

            assert.equal(classifier.classify("rasguño"), "cat");
            assert.equal(classifier.classify("bark something"), "dog");
        });

        it("should reject invalid descriptions", function() {
            var invalidDescription = [{}, /t/, [], 1];
            var i = 0;

            for (i; i < invalidDescription.length; i++) {
                try {
                    classifier.addData("cat", {});
                    assert.fail();
                } catch (e) {
                    assert.equal(e.message, "Invalid description '[object Object]' of type 'object'. Expected a non-empty string.");
                }
            }
        });
    });

    describe("classification", function() {
        var classifier = new Whichx();
        var validLabels = ["cat", "dog", "hippopotamus", "horse", "lizard", "pájaro"];

        before(function() {
            classifier.addLabels(validLabels);
            classifier.addData("cat", "meow purr sits on lap");
            classifier.addData("dog", "bark woof wag fetch");
        });

        classificationAssertions(classifier);

        it("should successfully classify with only 1 label", function() {
            classifier = new Whichx();
            classifier.addLabels("pokemon");
            classifier.addData("pokemon", "pikachu yellow lightning");
            assert.equal(classifier.classify("pokemanz?"), "pokemon");
        });
    });

    describe("imported export", function() {
        var classifier = new Whichx();
        var validLabels = ["cat", "dog"];
        var dataExport;

        before(function() {
            classifier.addLabels(validLabels);
            classifier.addData("cat", "meow purr sits on lap");
            classifier.addData("dog", "bark woof wag fetch");
            dataExport = classifier.export();
            classifier = new Whichx();
            classifier.import(dataExport);
        });

        classificationAssertions(classifier);
    });

    describe("stop words", function() {       
        it("defaults should be ignored if no others specified", function() {
            var classifier = new Whichx();
            classifier.addLabels(["cat", "dog"]);
            classifier.addData("cat", "the the most more meow purr sits on lap");
            classifier.addData("dog", "bark woof wag fetch");
            assert.equal(classifier.classify("the the most more bark"), "dog");
            assert.equal(classifier.classify("purr lap"), "cat");
        });

        it("configured stop words should be ignored if specified", function() {
            var classifier = new Whichx({ stopwords: ["bark", "woof", "wag"] });
            classifier.addLabels(["cat", "dog"]);
            classifier.addData("cat", "meow purr sits on lap");
            classifier.addData("dog", "bark woof wag fetch sniff");
            assert.equal(classifier.classify("bark woof wag purr"), "cat");
            assert.equal(classifier.classify("fetch"), "dog");
        });
    });

    describe("normalization", function() {
        var classifier;
        before(function() {
            classifier = new Whichx();
            classifier.addLabels(["summer"]);
            classifier.addData("summer", "été");
            classifier.addData("summer", "ete");
        });

        it("should normalize words with diacritic", function() {
            assert.deepEqual(classifier.export(), {
                summer: { ete: 2, tcount: 2, wordTotal: 2 },
                total: { ete: 2, tcount: 2, wordTotal: 3 }
            });
        });
    });
});
