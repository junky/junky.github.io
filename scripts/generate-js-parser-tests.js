/* Generates the RPS-11071 JS parser tests js-parser-tests/10-*.js .. 12-*.js: many small sl:translate_json blocks, so
 * that a chunk boundary of the response is likely to fall inside a closing marker comment, which corrupted the output
 * before RPS-11071.
 *
 * The GDN proxy reads the upstream response into 16K buffers and inflates every gzip buffer into one parser chunk.
 * Inflate can only stop between deflate symbols, and a closing marker repeated many times is compressed into one
 * back-reference that a chunk boundary cannot cut. So every closing comment carries a random token after the marker
 * ("/* </sl:translate_json> 3kQ9... *\/"): its characters are literals that a chunk can end between, and the marker is
 * still recognized because only the start of the comment is matched.
 *
 * The values are strings that already have uk-UA translations in the project, so the blocks add no new strings.
 * The output is the same on every run (fixed seeds): node scripts/generate-js-parser-tests.js */
"use strict";

var fs = require("fs");
var path = require("path");

var OUT_DIR = path.join(__dirname, "..", "js-parser-tests");
var VOCABULARY = ["Home", "Dates", "Swaps", "DCS Test", "MD Upload", "Vue Attributes", "String Length",
                  "Hello world!", "Machine Translation", "No Ingest"];
var TOKEN_CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
var OPEN = "<sl:translate_json>";
var CLOSE = "</sl:translate_json>";

/* mulberry32 */
function random(seed) {
    return function () {
        seed = (seed + 0x6D2B79F5) | 0;
        var r = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
        return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
}

function generator(seed) {
    var rnd = random(seed);
    var g = {
        int: function (n) { return Math.floor(rnd() * n); },
        pick: function (list) { return list[g.int(list.length)]; },
        chars: function (alphabet, len) {
            var s = "";
            while (s.length < len) {
                s += alphabet[g.int(alphabet.length)];
            }
            return s;
        },
        hex: function (len) { return g.chars("0123456789abcdef", len); },
        token: function () { return g.chars(TOKEN_CHARS, 24 + g.int(17)); },
        /* {"k1a2b3c":"Home",...} with 1..3 entries, and its keys */
        object: function () {
            var keys = [];
            var pairs = [];
            var count = 1 + g.int(3);
            while (keys.length < count) {
                var key = "k" + g.hex(7);
                keys.push(key);
                pairs.push(JSON.stringify(key) + ":" + JSON.stringify(g.pick(VOCABULARY)));
            }
            return { json: "{" + pairs.join(",") + "}", keys: keys };
        }
    };
    return g;
}

function label(i) {
    return JSON.stringify("b" + String(i + 1).padStart(4, "0"));
}

/* return {...}[e] lookups closed by a block comment, as in Squarespace search/index.js, with a token in the closer */
function blockCommentBlock(g, i) {
    var o = g.object();
    return "t.lookup(" + label(i) + ", function (e) {/* " + OPEN + " */return" + o.json + "[e];\n/* " + CLOSE + " "
        + g.token() + " */}, " + JSON.stringify(o.keys.join(" ")) + ");\n";
}

/* object literals between line comment markers, with a token in the closer */
function lineCommentBlock(g, i) {
    return "t.json(" + label(i) + ", // " + OPEN + "\n" + g.object().json + "\n// " + CLOSE + " " + g.token() + "\n);\n";
}

/* Every shape the fix touches: the exact Squarespace block (no token), object literals, empty blocks followed by an
 * unmarked string that must not be translated, two blocks in a row, line comment markers without a token */
function mixedBlock(g, i) {
    var shape = g.int(100);
    var o;

    if (shape < 30) {
        var keys = [g.hex(16), g.hex(32)];
        var values = [g.pick(VOCABULARY), g.pick(VOCABULARY)];
        return "t.lookup(" + label(i) + ", function (e) {/* " + OPEN + " */return{" + JSON.stringify(keys[0]) + ":"
            + JSON.stringify(values[0]) + "," + JSON.stringify(keys[1]) + ":" + JSON.stringify(values[1]) + "}[e];\n/* "
            + CLOSE + " */}, " + JSON.stringify(keys.join(" ")) + ");\n";
    }
    if (shape < 55) {
        return "t.json(" + label(i) + ", /* " + OPEN + " */{\"title\":" + JSON.stringify(g.pick(VOCABULARY))
            + ",\"items\":[" + JSON.stringify(g.pick(VOCABULARY)) + "," + JSON.stringify(g.pick(VOCABULARY))
            + "],\"n\":" + g.int(1000) + ",\"on\":" + (g.int(2) === 1) + ",\"none\":null}/* " + CLOSE + " "
            + g.token() + " */);\n";
    }
    if (shape < 70) {
        return "/* " + OPEN + " *//* " + CLOSE + " " + g.token() + " */t.same(" + label(i) + ", "
            + JSON.stringify(g.pick(VOCABULARY)) + ");\n";
    }
    if (shape < 85) {
        o = g.object();
        return "t.json(" + label(i) + ", [/* " + OPEN + " */" + o.json + "/* " + CLOSE + " " + g.token() + " */,/* "
            + OPEN + " */" + g.object().json + "/* " + CLOSE + " " + g.token() + " */]);\n";
    }
    return "t.json(" + label(i) + ", // " + OPEN + "\n" + g.object().json + "\n// " + CLOSE + "\n);\n";
}

var FILES = [
    {
        name: "10-json-split-block-comments",
        seed: 11071,
        blocks: 1600,
        block: blockCommentBlock,
        about: "return {...}[e] lookups in sl:translate_json blocks closed by a block comment, as in Squarespace\n"
            + " * search/index.js."
    },
    {
        name: "11-json-split-line-comments",
        seed: 11072,
        blocks: 1600,
        block: lineCommentBlock,
        about: "object literals in sl:translate_json blocks between line comment markers."
    },
    {
        name: "12-json-split-mixed",
        seed: 11073,
        blocks: 1600,
        block: mixedBlock,
        about: "the exact Squarespace block, object literals, empty blocks followed by an unmarked string that\n"
            + " * must stay as it is, two blocks in a row and line comment markers."
    }
];

FILES.forEach(function (file) {
    var g = generator(file.seed);
    var out = "/* JS parser test " + file.name + " (RPS-11071): " + file.about + "\n"
        + " * Generated by scripts/generate-js-parser-tests.js, do not edit. The file is large and its closing markers carry\n"
        + " * random tokens so that the chunk boundaries of the response are likely to fall inside a closing marker. */\n"
        + "slJsTest(" + JSON.stringify(file.name) + ", function (t) {\n";
    for (var i = 0; i < file.blocks; i++) {
        out += file.block(g, i);
    }
    out += "});\n";
    fs.writeFileSync(path.join(OUT_DIR, file.name + ".js"), out);
    console.log(file.name + ".js: " + file.blocks + " blocks, " + out.length + " bytes");
});
