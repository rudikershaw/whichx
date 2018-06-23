// Defining the Whichpet object.
function Whichpet() {
    // Internet explorer 9 or later required, or any other popular browser.

    // Map (using object notation) of description types.
    // Each type containing a map of words and counts.
    // The tcount represents the total number of those labels.
    // The word total represents the total number of words added against that label.
    var typesMap = {
        // Total must exist and be incremented for probability calculations.
        "total": { "tcount": 0, "wordTotal": 0 }
    };

    // Add a label or list of labels to the classifier
    this.addLabels = function(labels) {
        if (typeof labels === "string" && labels.length > 0 && !(labels.toLowerCase() in typesMap)) {
            typesMap[labels.toLowerCase()] = { "tcount": 0, "wordTotal": 0 };
        } else if (labels instanceof Array) {
            for (var i = 0; i < labels.length; i++) {
                if (typeof labels[i] === "string" && labels[i].length > 0 && !(labels[i].toLowerCase() in typesMap)) {
                    typesMap[labels[i].toLowerCase()] = { "tcount": 0, "wordTotal": 0 };
                } else {
                    throw new Error("Invalid label");
                }
            }
        } else {
            throw new Error("Invalid label");
        }
    };

    // Add word data from a description to a specified label.
    this.addData = function(label, description) {
        if (label in typesMap && typeof description === "string") {
            var type = typesMap[label];
            var total = typesMap.total;
            type.tcount = type.tcount + 1;
            total.tcount = total.tcount + 1;
            var wordArray = processToArray(description);
            // Check whether each word exists against that label and the total.
            // If it does increment the tcount, otherwise add the word.
            for (var i = 0; i < wordArray.length; i++) {
                var word = wordArray[i];
                // Add/Increment word to specific label.
                if (word in type) {
                    type[word] = type[word] + 1;
                } else {
                    type[word] = 1;
                }
                // Add/Increment word to total
                if (word in total) {
                    total[word] = total[word] + 1;
                } else {
                    total[word] = 1;
                }
                type.wordTotal = type.wordTotal + 1;
                total.wordTotal = total.wordTotal + 1;
            }
        } else {
            throw new Error("Invalid label or description");
        }
    };

    // Take a description and find the most likely label for it.
    this.classify = function(description) {
        if (typeof description === "string" && description.length > 0) {
            var wordArray = processToArray(description);
            var total = typesMap.total;
            var bestChance = 0;
            var bestLabel = "cat";
            // Loop through types working out the chance of the description being
            // for this type. If better than bestChance then bestChange <- chance.
            for (var typeName in typesMap) {
                if (typesMap.hasOwnProperty(typeName)) {
                    var type = typesMap[typeName];
                    var typeChance = 0;
                    // Loop through words and work out probability of type given each word.
                    // Multiply each word's probability by total probability to determine type probability.
                    for (var i = 0; i < wordArray.length; i++) {
                        var typeWordCount = (typeof type[wordArray[i]] !== "undefined" ? type[wordArray[i]] : mEstimate());
                        var totalWordCount = (typeof total[wordArray[i]] !== "undefined" ? total[wordArray[i]] : mEstimate());
                        // Bayes' theorem calculation.
                        var p1 = (typeWordCount / type.wordTotal) * (type.tcount / total.tcount);
                        var p2 = ((totalWordCount - typeWordCount / (total.wordTotal - type.wordTotal)) * ((total.tcount - type.tcount) / total.tcount));
                        var wordChance = p1 / (p1 + p2);
                        if (typeChance <= 0) {
                            typeChance = wordChance;
                        } else {
                            typeChance = typeChance * wordChance;
                        }
                    }
                    // Multiply final probability by overall probability that it is of this type to weight by most popular types.
                    typeChance = typeChance * (type.tcount / total.tcount);
                    if (typeChance > bestChance) {
                        bestChance = typeChance;
                        bestLabel = typeName;
                    }
                }
            }
            return bestLabel;
        } else {
            throw new Error("Invalid description");
        }
    };

    // A non-zero prior estimate to prevent 0 based probability calculations.
    function mEstimate() {
        // TODO - Define a reliable m-estimate.
        var total = typesMap.total;
        return 1 / total.wordTotal;
    }

    // Stop words including tcount & wordtotal (because they are key words in the maps used to store the data).
    var STOPWORDS = ["a", "all", "am", "an", "and", "any", "are", "as", "at", "be", "because",
        "been", "being", "but", "by", "count", "could", "did", "do", "does", "doing", "during",
        "each", "few", "for", "had", "has", "have", "having", "he", "hed", "hes",
        "her", "here", "heres", "hers", "herself", "him", "himself", "his", "how",
        "hows", "i", "id", "im", "ive", "if", "in", "into", "is", "it", "its", "itself",
        "lets", "me", "more", "most", "my", "myself", "of", "off", "on", "once",
        "only", "or", "other", "ought", "our", "ours", "ourselves", "over", "own",
        "same", "she", "shes", "should", "so", "some", "such", "than", "that",
        "thats", "the", "their", "theirs", "them", "themselves", "then", "there",
        "theres", "these", "they", "theyd", "theyll", "theyre", "theyve", "this",
        "those", "through", "to", "too", "until", "was", "we", "wed", "well", "were",
        "weve", "what", "whats", "when", "whens", "where", "wheres", "which",
        "while", "who", "whos", "whom", "why", "whys", "with", "wordtotal", "would", "you", "youd",
        "youll", "youre", "your", "youve", "yours", "yourself", "yourselves"];

    // Process the description into an array of pertinent standardized lower case words.
    function processToArray(description) {
        if (typeof description === "string") {
            // Remove special characters.
            description = description.replace(/[^a-zA-Z ]/g, "");
            // Lower case.
            description = description.toLowerCase();
            // Remove all stop words
            for (var i = 0; i < STOPWORDS.length; i++) {
                description = description.replace(new RegExp(" " + STOPWORDS[i] + " ", "g"), " ");
            }
            // Remove extra spaces.
            description = description.replace(/\s+/g, " ");
            // Return array of processed words.
            return description.split(" ");
        } else {
            throw new Error("Invalid description");
        }
    }
}

// Export whichpet function if using node.
if (module && module.exports) {
    module.exports = Whichpet;
}
