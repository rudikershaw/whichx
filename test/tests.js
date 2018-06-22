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
    });

})();
