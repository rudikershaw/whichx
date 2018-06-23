(function(){
    var assert = require("assert");
    var Whichpet = require("../assets/scripts/whichpet.js");

    describe("Whichpet", function() {
        describe("constructor", function() {
            var classifier = new Whichpet();
            it("should create an object", function() {
                assert.equal(typeof classifier, "object");
            });

            it("should create a unique object", function() {
                var newClassifier = new Whichpet();
                newClassifier.property = 1;
                assert.equal(classifier.property, undefined);
            });

            it("object should have 3 main methods", function() {
                assert.ok(classifier.addData && classifier.addLabels && classifier.classify);
            });

            it("object should have key vars hidden", function() {
                assert.ok(!(classifier.typesMap) && !(classifier.STOPWORDS) && !(classifier.processToArray));
            });
        });

        describe("labels", function() {
            var classifier = new Whichpet();
            var validLabels = ["cat", "dog", "hippopotamus", "horse", "lizard", "pájaro"];
            var invalidLabels = ["total", "Total", "constructor", "cat"];

            it("should take valid label strings", function() {
                var i = 0;
                for (i ; i < validLabels.length; i++) {
                    classifier.addLabels(validLabels[i]);
                }
            });

            it("should reject invalid label strings", function() {
                var i = 0;
                for (i ; i < invalidLabels.length; i++) {
                    try {
                        classifier.addLabels(invalidLabels[i]);
                        assert.ok(false);
                    } catch (e) {
                        assert.equal(e.message, "Invalid label");
                    }
                }
            })
        });
    });

})();
