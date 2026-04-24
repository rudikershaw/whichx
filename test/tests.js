var assert = require("assert");
var WhichX = require("../src");

var sharedClassificationTests = [
    {
        description: "should classify text 'correctly'",
        test: function() {
            assert.equal(this.classifier.classify("sits"), "cat");
            assert.equal(this.classifier.classify("bark"), "dog");

            this.classifier.addData("dog", "sits sits");
            assert.equal(this.classifier.classify("sits"), "dog");
        }
    },
    {
        description: "should classify by most instances when unsure",
        test: function() {
            this.classifier.addData("dog", "test");
            assert.equal(this.classifier.classify("never"), "dog");
        }
    },
    {
        description: "should not be confused by unknown words",
        test: function() {
            assert.equal(this.classifier.classify("meow unknown"), "cat");
        }
    }
];

describe("WhichX", function() {
    describe("constructor", function() {
        before(function() {
            this.classifier = new WhichX();
        });

        it("should create an object", function() {
            assert.equal(typeof this.classifier, "object");
        });

        it("should create a unique object", function() {
            var newClassifier = new WhichX();
            newClassifier.property = 1;
            assert.equal(this.classifier.property, undefined);
        });

        it("object should have 3 main methods", function() {
            assert.ok(this.classifier.addData && this.classifier.addLabels && this.classifier.classify);
        });

        it("object should have key vars hidden", function() {
            assert.ok(!(this.classifier.typesMap) && !(this.classifier.STOPWORDS) && !(this.classifier.processToArray));
        });

        it("object should have default classify value", function() {
            assert.equal(this.classifier.classify("no labels"), undefined);
        });
    });

    describe("labels", function() {
        before(function() {
            this.classifier = new WhichX();
            this.validLabels = ["cat", "dog", "hippopotamus", ["horse", "lizard"], "pájaro"];
            this.duplicateLabels = ["cat", "dog", "hippopotamus", "horse", "lizard", "pájaro"];
            this.nonStringNonArrayLabels = [{}, /test/, 1, true, () => {}];
            this.propertiesOfObjectLabels = ["constructor", "__proto__"];
        });

        it("should take valid label strings", function() {
            var i = 0;
            for (i; i < this.validLabels.length; i++) {
                this.classifier.addLabels(this.validLabels[i]);
            }
        });

        it("should reject duplicate labels", function() {
            var i = 0;
            for (i; i < this.duplicateLabels.length; i++) {
                try {
                    this.classifier.addLabels(this.duplicateLabels[i]);
                    assert.ok(false, "Label should have been rejected.");
                } catch (e) {
                    assert.equal(e.message, "Duplicate label '" + this.duplicateLabels[i] + "'.");
                }
            }
        });

        it("should reject reserved label 'total'", function() {
            try {
                this.classifier.addLabels("total");
                assert.ok(false, "Label should have been rejected.");
            } catch (e) {
                assert.equal(e.message, "Invalid label. 'total' is a reserved keyword.");
            }
        });

        it("should reject properties of object", function() {
            var i = 0;
            for (i; i < this.propertiesOfObjectLabels.length; i++) {
                try {
                    this.classifier.addLabels(this.propertiesOfObjectLabels[i]);
                    assert.ok(false, "Label should have been rejected.");
                } catch (e) {
                    assert.equal(e.message, "Label '" + this.propertiesOfObjectLabels[i].toLowerCase() + "' must not replace a property of Object.");
                }
            }
        });

        it("should reject non-string or non-array labels", function() {
            var i = 0;
            for (i; i < this.nonStringNonArrayLabels.length; i++) {
                try {
                    this.classifier.addLabels(this.nonStringNonArrayLabels[i]);
                    assert.ok(false, "Label should have been rejected.");
                } catch (e) {
                    assert.equal(e.message, "Invalid label '" + this.nonStringNonArrayLabels[i] + "' of type '" + typeof this.nonStringNonArrayLabels[i] + "'. Expected an Array or a string.");
                }
            }
        });
    });

    describe("descriptions", function() {
        before(function() {
            var validLabels = ["cat", "dog", "hippopotamus", "horse", "lizard", "pájaro"];
            this.classifier = new WhichX();
            this.classifier.addLabels(validLabels);
        });

        it("should take valid descriptions", function() {
            this.classifier.addData("cat", "meow purr sits on lap rasguño");
            this.classifier.addData("dog", "bark woof wag sits fetch");

            assert.equal(this.classifier.classify("rasguño"), "cat");
            assert.equal(this.classifier.classify("bark something"), "dog");
        });

        it("should reject invalid descriptions", function() {
            var invalidDescription = [{}, /t/, [], 1];
            var i = 0;

            for (i; i < invalidDescription.length; i++) {
                try {
                    this.classifier.addData("cat", {});
                    assert.fail();
                } catch (e) {
                    assert.equal(e.message, "Invalid description '[object Object]' of type 'object'. Expected a non-empty string.");
                }
            }
        });
    });

    describe("classification", function() {
        before(function() {
            var validLabels = ["cat", "dog", "hippopotamus", "horse", "lizard", "pájaro"];
            this.classifier = new WhichX();
            this.classifier.addLabels(validLabels);
            this.classifier.addData("cat", "meow purr sits on lap");
            this.classifier.addData("dog", "bark woof wag fetch");
        });

        for (var test of sharedClassificationTests) {
            it(test.description, test.test);
        }

        it("should successfully classify with only 1 label", function() {
            var classifier = new WhichX();
            classifier.addLabels("pokemon");
            classifier.addData("pokemon", "pikachu yellow lightning");
            assert.equal(classifier.classify("pokemanz?"), "pokemon");
        });
    });

    describe("imported export", function() {
        before(function() {
            var validLabels = ["cat", "dog"];
            var classifier = new WhichX();
            classifier.addLabels(validLabels);
            classifier.addData("cat", "meow purr sits on lap");
            classifier.addData("dog", "bark woof wag fetch");
            this.classifier = new WhichX();
            this.classifier.import(classifier.export());
        });

        for (var test of sharedClassificationTests) {
            it(test.description, test.test);
        }
    });

    describe("bayes probability calculation", function() {
        it("should not let common words from a dominant label override distinctive signal from a minority label", function() {
            var classifier = new WhichX();
            classifier.addLabels(["sci", "fic"]);
            var i = 0;
            for (i; i < 20; i++) {
                classifier.addData("fic", "story character plot adventure hero villain journey quest magic sword dragon wizard battle kingdom prince princess fantasy world ancient mystery");
            }
            classifier.addData("sci", "quantum physics research experiment");
            assert.equal(classifier.classify("quantum physics research experiment story adventure hero"), "sci");
        });
    });

    describe("stop words", function() {
        it("defaults should be ignored if no others specified", function() {
            var classifier = new WhichX();
            classifier.addLabels(["cat", "dog"]);
            classifier.addData("cat", "the the most more meow purr sits on lap");
            classifier.addData("dog", "bark woof wag fetch");
            assert.equal(classifier.classify("the the most more bark"), "dog");
            assert.equal(classifier.classify("purr lap"), "cat");
        });

        it("configured stop words should be ignored if specified", function() {
            var classifier = new WhichX({ stopwords: ["bark", "woof", "wag"] });
            classifier.addLabels(["cat", "dog"]);
            classifier.addData("cat", "meow purr sits on lap");
            classifier.addData("dog", "bark woof wag fetch sniff");
            assert.equal(classifier.classify("bark woof wag purr"), "cat");
            assert.equal(classifier.classify("fetch"), "dog");
        });

        it("should support extending defaults via WhichX.getDefaultStopwords", function() {
            var extended = new WhichX({ stopwords: WhichX.getDefaultStopwords().concat(["meow", "bark"]) });
            extended.addLabels(["cat", "dog"]);
            extended.addData("cat", "meow purr sits on lap");
            extended.addData("dog", "bark woof wag fetch");
            // Default stop words are still filtered.
            assert.equal(extended.classify("the the the purr"), "cat");
            // And so are the extra ones we added.
            assert.equal(extended.classify("meow bark fetch"), "dog");
        });

        it("WhichX.getDefaultStopwords should return a fresh copy each call", function() {
            var first = WhichX.getDefaultStopwords();
            first.push("mutated");
            var second = WhichX.getDefaultStopwords();
            assert.equal(second.indexOf("mutated"), -1);
        });
    });

    describe("scores", function() {
        before(function() {
            this.classifier = new WhichX();
            this.classifier.addLabels(["cat", "dog"]);
            this.classifier.addData("cat", "meow purr sits on lap");
            this.classifier.addData("dog", "bark woof wag fetch");
        });

        it("should return a probability for each label", function() {
            var scores = this.classifier.scores("meow");
            assert.equal(typeof scores, "object");
            assert.equal(typeof scores.cat, "number");
            assert.equal(typeof scores.dog, "number");
        });

        it("should not include the internal total entry", function() {
            var scores = this.classifier.scores("meow");
            assert.ok(!("total" in scores));
        });

        it("should agree with classify on the best label", function() {
            assert.equal(this.classifier.classify("meow purr"), "cat");
            var scores = this.classifier.scores("meow purr");
            assert.ok(scores.cat > scores.dog);

            assert.equal(this.classifier.classify("bark fetch"), "dog");
            scores = this.classifier.scores("bark fetch");
            assert.ok(scores.dog > scores.cat);
        });

        it("should throw on invalid description", function() {
            var self = this;
            assert.throws(function() { self.classifier.scores(""); });
            assert.throws(function() { self.classifier.scores(123); });
        });
    });

    describe("normalization", function() {
        before(function() {
            this.classifier = new WhichX();
            this.classifier.addLabels(["summer"]);
            this.classifier.addData("summer", "été");
            this.classifier.addData("summer", "ete");
        });

        it("should normalize words with diacritic", function() {
            assert.deepEqual(this.classifier.export(), {
                summer: { ete: 2, tcount: 2, wordTotal: 2 },
                total: { ete: 2, tcount: 2, wordTotal: 3 }
            });
        });
    });
});
