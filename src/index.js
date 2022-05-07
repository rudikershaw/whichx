// @ts-check

/**
 * @typedef {Object} Config The WhichX configuration options.
 * @property {string[]} stopwords The list of stop words in the text. Those words will be ignored during the classification process.
 */

/**
 * @typedef {Object} LabelEntry
 * @property {number} tcount The total number of those labels.
 * @property {number} wordTotal The total number of words added against that label.
 */

/** @typedef {Record<string, LabelEntry>} TypeMap The map of labels and descriptions. */

/**
 * Defining the Whichx object.
 * @param {Config=} config The optional configuration for WhichX.
 */
function WhichX(config) {
    // Internet explorer 9 or later required, or any other popular browser.

    var STOPWORDS;

    // Stop words including tcount & wordtotal (because they are key words in the maps used to store the data).
    var DEFAULT_STOPWORDS = ["a", "all", "am", "an", "and", "any", "are", "as", "at", "be", "because",
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

    // Configure WhichX object.
    if (!config || !config.stopwords) {
        STOPWORDS = DEFAULT_STOPWORDS;
    } else if (config.stopwords instanceof Array) {
        STOPWORDS = config.stopwords.slice();
        STOPWORDS.push("tcount", "wordtotal");
    } else {
        throw new Error("The `stopwords` variable of your configuration must be an array.");
    }

    // Map (using object notation) of description types.
    // Each type containing a map of words and counts.
    // The tcount represents the total number of those labels.
    // The word total represents the total number of words added against that label.
    /** @type {TypeMap} */
    var typesMap = {
        // Total must exist and be incremented for probability calculations.
        total: { tcount: 0, wordTotal: 1 }
    };

    /**
     * Add a label or list of labels to the classifier.
     * @param {string | string[]} labels A label or a list of labels to add.
     */
    this.addLabels = function(labels) {
        var i = 0;
        if (typeof labels === "string") {
            addLabel(labels);
        } else if (labels instanceof Array) {
            for (i; i < labels.length; i++) {
                addLabel(labels[i]);
            }
        } else {
            throw new Error("Invalid label '" + labels + "' of type '" + typeof labels + "'. Expected an Array or a string.");
        }
    };

    /**
     * Add word data from a description to a specified label.
     * @param {string} label The label the description must be attached to.
     * @param {string} description The description matching the label.
     */
    this.addData = function(label, description) {
        var type, wordArray, i, word;
        var total = typesMap.total;

        if (label.toLowerCase() in typesMap && typeof description === "string" && description.length > 0) {
            type = typesMap[label.toLowerCase()];
            type.tcount = type.tcount + 1;
            total.tcount = total.tcount + 1;
            wordArray = processToArray(description);
            // Check whether each word exists against that label and the total.
            // If it does increment the tcount, otherwise add the word.
            for (i = 0; i < wordArray.length; i++) {
                word = wordArray[i];
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
            if (!(label.toLowerCase() in typesMap)) {
                throw new Error("Invalid label '" + label + "'. '" + label + "' is not an existing label in: " + Object.keys(typesMap) + ".");
            } else {
                throw new Error("Invalid description '" + description + "' of type '" + typeof description + "'. Expected a non-empty string.");
            }
        }
    };

    /**
     * Take a description and find the most likely label for it.
     * @param {string} description The description to classify.
     * @returns {string} The label that best matches the description.
     */
    this.classify = function(description) {
        var wordArray, bestChance, bestLabel, typeName,
            type, typeChance;

        if (typeof description === "string" && description.length > 0) {
            wordArray = processToArray(description);
            bestChance = -1;
            bestLabel = undefined;

            // Loop through types working out the chance of the description being
            // for this type. If better than bestChance then bestChange <- chance.
            for (typeName in typesMap) {
                if (Object.prototype.hasOwnProperty.call(typesMap, typeName)) {
                    type = typesMap[typeName];
                    typeChance = getTypeChance(type, wordArray);
                    if (typeChance > bestChance) {
                        bestChance = typeChance;
                        bestLabel = typeName;
                    }
                }
            }
            return bestLabel;
        } else {
            throw new Error("Invalid description " + description + " of type " + typeof description + ". We expected a non empty string.");
        }
    };

    /**
     * Exports the WhichX internal data representation learned from provided.
     * labeled text. Please see the typesMap comments for more details.
     * @returns {TypeMap} A TypeMap that can be saved for later import in WhichX.
     */
    this.export = function() {
        return typesMap;
    };

    /**
     * Imports a previously exported model. This will write over any data this instance has already learned.
     * @param {TypeMap} importedTypesMap The types map previously exported from WhichX
     */
    this.import = function(importedTypesMap) {
        var newTotal = importedTypesMap.total;
        if (newTotal === undefined || newTotal.tcount === undefined || newTotal.wordTotal === undefined) {
            throw new Error("Import invalid. This doesn't look like it was exported from a prior model.");
        }
        typesMap = importedTypesMap;
    };

    /**
     * Add a label to the classifier.
     * @param {string} label A label to add.
     */
    function addLabel(label) {
        if (typeof label !== "string") {
            throw new Error("Invalid label of type '" + typeof label + "'. Expected string.");
        } else if (label.length === 0 || label.trim().length === 0) {
            throw new Error("Label strings must be non-empty.");
        } else if (label.toLowerCase() === "total") {
            throw new Error("Invalid label. 'total' is a reserved keyword.");
        } else if (({})[label.toLowerCase()] !== undefined) {
            throw new Error("Label '" + label.toLowerCase() + "' must not replace a property of Object.");
        } else if (label.toLowerCase() in typesMap) {
            throw new Error("Duplicate label '" + label + "'.");
        } else {
            typesMap[label.toLowerCase()] = { tcount: 0, wordTotal: 0 };
        }
    }

    /**
     * Loop through words and work out probability of a type given each word.
     * Multiply each word's probability by total probability to determine type probability.
     * @param {LabelEntry} type The label entry to test.
     * @param {string[]} words The words list in the description.
     * @returns {number} The probability that the description belongs to that given label.
     */
    function getTypeChance(type, words) {
        var i, typeWordCount, totalWordCount, p1, p2, wordChance;
        var typeChance = 0;
        var total = typesMap.total;

        for (i = 0; i < words.length; i++) {
            typeWordCount = (typeof type[words[i]] !== "undefined" ? type[words[i]] : mEstimate());
            totalWordCount = (typeof total[words[i]] !== "undefined" ? total[words[i]] : mEstimate());
            // Bayes' theorem calculation.
            p1 = (typeWordCount / type.wordTotal) * (type.tcount / total.tcount);
            p2 = ((totalWordCount - typeWordCount / (total.wordTotal - type.wordTotal)) * ((total.tcount - type.tcount) / total.tcount));
            wordChance = p1 / (p1 + p2);
            if (typeChance <= 0) {
                typeChance = wordChance;
            } else {
                typeChance = typeChance * wordChance;
            }
        }
        // Multiply final probability by overall probability that it is of this type to weight by most popular types.
        return typeChance * (type.tcount / total.tcount);
    }

    /**
     * A non-zero prior estimate to prevent 0 based probability calculations.
     * @returns {number} The non-zero probability.
     */
    function mEstimate() {
        var total = typesMap.total;
        return 1 / (total.wordTotal * 100);
    }

    /**
     * Process the description into an array of standardized lower case words.
     * @param {string} description The description to process.
     * @returns {string[]} The list of processed words contained in the description.
     */
    function processToArray(description) {
        var i = 0;
        if (typeof description === "string") {
            // Remove special characters.
            if (description.normalize) {
                description = description.normalize("NFD");
            }
            description = description.toLowerCase()
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-zA-Z ]/g, "");
            // Remove all stop words
            for (i; i < STOPWORDS.length; i++) {
                description = description.replace(new RegExp("\\b" + STOPWORDS[i] + "\\b", "g"), " ");
            }
            // Remove extra spaces.
            description = description.replace(/\s+/g, " ");
            // Return array of processed words.
            return description.trim().split(" ");
        } else {
            throw new Error("Invalid description " + description + " of type " + typeof description + ". Expected string.");
        }
    }
}

// Export whichx function if using node.
if (module && module.exports) {
    module.exports = WhichX;
}
