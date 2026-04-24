// @ts-check

/**
 * @typedef {Object} Config The WhichX configuration options.
 * @property {string[]} stopwords The list of stop words in the text. Those words will be ignored during the classification process.
 */

/**
 * @typedef {{ tcount: number, wordTotal: number, [key: string]: number }} LabelEntry
 * The per-label entry. `tcount` is the total number of those labels, `wordTotal` is the
 * total number of words added against that label, and any other string key is a word
 * observed for this label mapped to its occurrence count.
 */

/** @typedef {Record<string, LabelEntry>} TypeMap The map of labels and descriptions. */

/**
 * Defining the WhichX object.
 * @param {Config=} config The optional configuration for WhichX.
 */
function WhichX(config) {
    /** @type {string[]} */
    var STOPWORDS;

    // Configure WhichX object.
    if (!config || !config.stopwords) {
        STOPWORDS = WhichX.getDefaultStopwords();
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
     * @returns {string | undefined} The label that best matches the description, or undefined if no labels exist.
     */
    this.classify = function(description) {
        var scoreMap = this.scores(description);
        var bestChance = -1;
        var bestLabel;
        var typeName;

        for (typeName in scoreMap) {
            if (Object.prototype.hasOwnProperty.call(scoreMap, typeName) && scoreMap[typeName] > bestChance) {
                bestChance = scoreMap[typeName];
                bestLabel = typeName;
            }
        }
        return bestLabel;
    };

    /**
     * Take a description and return the probability of it belonging to each label.
     * @param {string} description The description to classify.
     * @returns {Record<string, number>} A map of label names to their probability scores.
     */
    this.scores = function(description) {
        if (typeof description !== "string" || description.length === 0) {
            throw new Error("Invalid description " + description + " of type " + typeof description + ". Expected a non empty string.");
        }
        /** @type {Record<string, number>} */
        var scores = {};
        var wordArray = processToArray(description);
        var sum = 0;

        Object.keys(typesMap).forEach(function(name) {
            if (name !== "total") {
                scores[name] = getTypeChance(typesMap[name], wordArray);
                sum = sum + scores[name];
            }
        });

        if (sum > 0) {
            Object.keys(scores).forEach(function(name) {
                scores[name] = scores[name] / sum;
            });
        }
        return scores;
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
     * Score how a list of words matches a given label. Each word contributes
     * a probability based on how often it appears under that label, with a small
     * constant added so unseen words still count. Those probabilities are
     * multiplied together and weighted by how common the label is overall.
     * @param {LabelEntry} type The label entry to test.
     * @param {string[]} words The words list in the description.
     * @returns {number} A score proportional to P(class | words).
     */
    function getTypeChance(type, words) {
        var i, wordCount, pWordGivenType;
        var pType = 1;
        var total = typesMap.total;
        // The total map also stores the two reserved keys tcount and wordTotal, so subtract them.
        var vocabularySize = Object.keys(total).length - 2;
        var denominator = type.wordTotal + vocabularySize;

        for (i = 0; i < words.length; i++) {
            wordCount = (typeof type[words[i]] !== "undefined" ? type[words[i]] : 0);
            pWordGivenType = (wordCount + 1) / denominator;
            pType = pType * pWordGivenType;
        }
        // Multiply by the class prior P(class) = tcount_c / tcount_total.
        return pType * (type.tcount / total.tcount);
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

/**
 * Returns the default stop words list used by WhichX when no custom
 * stopwords are provided. Useful for extending the defaults rather than
 * replacing them entirely.
 * @returns {string[]} A copy of the default stop words list.
 */
WhichX.getDefaultStopwords = function() {
    // Stop words including tcount & wordtotal (because they are key words in the maps used to store the data).
    return ["a", "all", "am", "an", "and", "any", "are", "as", "at", "be", "because",
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
};

// Export whichx function if using node.
if (module && module.exports) {
    module.exports = WhichX;
}
