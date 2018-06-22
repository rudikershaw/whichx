(function(){
    var assert = require("assert");
    var Whichpet = require("../assets/scripts/whichpet.js");

    describe("Whichpet", function() {
        describe("constructor", function () {
            it("should create an object", function () {
                var classifier = new Whichpet();
                assert.equal(typeof classifier, "object");
            });
        });
    });

})();