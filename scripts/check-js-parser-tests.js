/* Runs the JS parser tests against a localized domain from the command line, the same way js-parser-tests.html does.
 *
 *   node scripts/check-js-parser-tests.js [localized host] [--repeat N] [--save DIR]
 *
 * --repeat N runs the chunk tests (10-12) N more times: where the chunks of a response end changes from request to
 * request. --save DIR keeps the served copy of every file that failed. Exits with 1 if any check failed. */
"use strict";

var fs = require("fs");
var path = require("path");
var T = require("../js-parser-tests/runner.js").slJsParserTests;

var args = process.argv.slice(2);
var host = "uk-b4c98df3d-ss0006.getsmartling.com";
var repeat = 0;
var saveDir = null;

for (var i = 0; i < args.length; i++) {
    if (args[i] === "--repeat") {
        repeat = parseInt(args[++i], 10);
    } else if (args[i] === "--save") {
        saveDir = args[++i];
    } else {
        host = args[i];
    }
}

var served = /^https?:\/\//.test(host) ? host : "https://" + host;
var failures = 0;

function report(result, round) {
    var s = result.summary;
    var shown = result.rows.filter(function (row) {
        return row.status !== "PASS";
    });

    console.log(s.status + "  " + result.file + (round ? " (round " + round + ")" : "") + ": " + s.PASS + " pass, "
        + s.WARN + " warn, " + s.FAIL + " fail" + (result.identical ? ", identical to the origin" : ""));
    shown.slice(0, result.chunked ? 5 : shown.length).forEach(function (row) {
        console.log("      " + row.status + " " + row.label + ": " + row.note
            + (row.origin === undefined ? "" : "  origin=" + JSON.stringify(row.origin))
            + (row.served === undefined ? "" : " served=" + JSON.stringify(row.served)));
    });
    if (s.status === "FAIL") {
        failures++;
        if (saveDir && result.servedText !== undefined) {
            fs.mkdirSync(saveDir, { recursive: true });
            var file = path.join(saveDir, (round ? "round" + round + "-" : "") + result.file);
            fs.writeFileSync(file, result.servedText);
            console.log("      served copy saved to " + file);
        }
    }
}

function runRounds(round) {
    if (round > repeat) {
        return Promise.resolve();
    }
    return Promise.all(T.FILES.filter(function (entry) {
        return entry.chunked;
    }).map(function (entry) {
        return T.testFile(entry, served, round);
    })).then(function (all) {
        all.forEach(function (result) {
            report(result, round);
        });
        return runRounds(round + 1);
    });
}

console.log("Localized: " + served + "\nOrigin:    " + T.ORIGIN + "\n");
Promise.all(T.FILES.map(function (entry) {
    return T.testFile(entry, served);
})).then(function (all) {
    all.forEach(function (result) {
        report(result);
    });
    return runRounds(1);
}).then(function () {
    console.log("\n" + (failures ? failures + " failed" : "no failures"));
    process.exitCode = failures ? 1 : 0;
});
