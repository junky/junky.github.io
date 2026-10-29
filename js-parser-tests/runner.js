/* Runs the JS parser tests in /js-parser-tests/. Every test file is fetched twice: as served by the current host (the
 * GDN proxy on a localized host) and as served by the origin. Both copies are run, and what they report through
 * slJsTest(name, function (t) {...}) is compared entry by entry. Used by js-parser-tests.html and by
 * scripts/check-js-parser-tests.js. */
/* global module */
(function (root) {
    "use strict";

    var ORIGIN = "https://" + ["junky", "github", "io"].join(".");
    var DIR = "/js-parser-tests/";

    var FILES = [
        { file: "01-translate.js", title: "translate markers: block and line comments, escapes" },
        { file: "02-notranslate.js", title: "notranslate inside translate, marker text in strings" },
        { file: "03-hide.js", title: "hide markers: hidden code is cut out" },
        { file: "04-translate-html.js", title: "translate_html: strings with HTML markup" },
        { file: "05-translate-json.js", title: "translate_json: small blocks in one chunk, empty block" },
        { file: "06-translate-generic-json.js", title: "translate_generic_json" },
        { file: "07-translate-md.js", title: "translate_md: MD formatted strings" },
        { file: "08-variant-delims-first-string.js", title: "variant, delims and first-string marker options" },
        { file: "09-lexer-edge-cases.js", title: "lexer edge cases: regex, template literals, comments" },
        { file: "10-json-split-block-comments.js", title: "RPS-11071: json blocks closed by /* */ split across chunks", chunked: true },
        { file: "11-json-split-line-comments.js", title: "RPS-11071: json blocks closed by // split across chunks", chunked: true },
        { file: "12-json-split-mixed.js", title: "RPS-11071: Squarespace shape, empty and back-to-back blocks", chunked: true }
    ];

    function isLocalizedHost(origin) {
        return origin !== ORIGIN && !/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
    }

    /* Runs a test file and records what it reports */
    function run(source) {
        var rec = { name: null, entries: [], ran: false, error: null };
        var labels = {};

        function record(kind, label, value, extra) {
            if (labels[label]) {
                throw new Error("duplicate label " + label);
            }
            labels[label] = true;
            rec.entries.push({ kind: kind, label: label, value: value, extra: extra });
        }

        var t = {
            tr: function (label, value) { record("tr", label, value); },
            same: function (label, value) { record("same", label, value); },
            gone: function (label, value) { record("gone", label, value); },
            json: function (label, value, sameKeys) { record("json", label, value, sameKeys || []); },
            lookup: function (label, fn, keys) {
                var value = {};
                keys.split(" ").forEach(function (key) {
                    value[key] = fn(key);
                });
                record("json", label, value, []);
            },
            parts: function (label, value, delim) { record("parts", label, value, delim); },
            html: function (label, value) { record("html", label, value); },
            md: function (label, value) { record("md", label, value); }
        };

        function slJsTest(name, body) {
            rec.name = name;
            body(t);
            rec.ran = true;
        }

        try {
            new Function("slJsTest", source)(slJsTest);
        } catch (e) {
            rec.error = e.name + ": " + e.message;
        }
        return rec;
    }

    function same(a, b) {
        return JSON.stringify(a) === JSON.stringify(b);
    }

    /* Same structure (keys, their order, types, non-string values) and non-empty strings. Returns problems found and
     * how many strings came out changed (translated). */
    function compareJson(o, s, path, res) {
        if (typeof o === "string") {
            res.strings++;
            if (typeof s !== "string" || s.length === 0) {
                res.problems.push(path + ": " + JSON.stringify(s) + " instead of a string");
            } else if (s !== o) {
                res.translated++;
            }
        } else if (o === null || typeof o !== "object") {
            if (s !== o) {
                res.problems.push(path + ": " + JSON.stringify(s) + " instead of " + JSON.stringify(o));
            }
        } else if (s === null || typeof s !== "object" || Array.isArray(s) !== Array.isArray(o)) {
            res.problems.push(path + ": " + JSON.stringify(s) + " instead of an " + (Array.isArray(o) ? "array" : "object"));
        } else if (!same(Object.keys(s), Object.keys(o))) {
            res.problems.push(path + ": keys " + Object.keys(s).join(",") + " instead of " + Object.keys(o).join(","));
        } else {
            Object.keys(o).forEach(function (key) {
                compareJson(o[key], s[key], path + "." + key, res);
            });
        }
        return res;
    }

    function tags(html) {
        return (html.match(/<[^>]*>/g) || []).join("");
    }

    /* Markdown syntax characters, which translation must keep */
    function mdSkeleton(md) {
        return md.replace(/[^#*_`[\]()>\n-]/g, "");
    }

    function translatedNote(o, s) {
        return s !== o ? ["PASS", "translated"] : ["WARN", "not translated"];
    }

    function compareEntry(o, s) {
        var row = { label: o.label, kind: o.kind, origin: o.value, served: s ? s.value : undefined };
        var r;

        if (!s) {
            r = ["FAIL", "missing from the served file"];
        } else if (o.kind === "same") {
            r = same(o.value, s.value) ? ["PASS", "unchanged"] : ["FAIL", "changed, must stay as it is"];
        } else if (o.kind === "gone") {
            r = s.value === undefined ? ["PASS", "cut out"] : ["FAIL", "hidden code is still there"];
        } else if (o.kind === "tr") {
            r = typeof s.value === "string" && s.value.length > 0 ? translatedNote(o.value, s.value)
                : ["FAIL", "not a non-empty string"];
        } else if (o.kind === "parts") {
            r = typeof s.value === "string" && s.value.split(o.extra).length === o.value.split(o.extra).length
                ? translatedNote(o.value, s.value) : ["FAIL", "number of " + JSON.stringify(o.extra) + " parts changed"];
        } else if (o.kind === "html") {
            r = typeof s.value === "string" && tags(s.value) === tags(o.value) ? translatedNote(o.value, s.value)
                : ["FAIL", "HTML tags changed"];
        } else if (o.kind === "md") {
            r = typeof s.value !== "string" ? ["FAIL", "not a string"]
                : mdSkeleton(s.value) !== mdSkeleton(o.value) ? ["WARN", "Markdown syntax changed"]
                : translatedNote(o.value, s.value);
        } else if (o.kind === "json") {
            var res = compareJson(o.value, s.value, "", { problems: [], strings: 0, translated: 0 });
            o.extra.forEach(function (key) {
                if (!same(o.value[key], s.value && s.value[key])) {
                    res.problems.push("." + key + " changed, must stay as it is");
                }
            });
            r = res.problems.length > 0 ? ["FAIL", res.problems.slice(0, 3).join("; ")]
                : res.strings > 0 && res.translated === 0 ? ["WARN", "no string translated"]
                : ["PASS", res.translated + " of " + res.strings + " strings translated"];
        } else {
            r = ["FAIL", "unknown kind " + o.kind];
        }
        row.status = r[0];
        row.note = r[1];
        return row;
    }

    /* Compares what the origin copy and the served copy of a test file reported */
    function compare(origin, served) {
        var rows = [];
        var servedByLabel = {};

        if (origin.error || !origin.ran) {
            rows.push({ label: "origin file", kind: "run", status: "FAIL", note: origin.error || "did not run to the end" });
        }
        if (served.error || !served.ran) {
            rows.push({ label: "served file", kind: "run", status: "FAIL", note: served.error || "did not run to the end" });
        }
        served.entries.forEach(function (e) {
            servedByLabel[e.label] = e;
        });
        origin.entries.forEach(function (o) {
            rows.push(compareEntry(o, servedByLabel[o.label]));
            delete servedByLabel[o.label];
        });
        Object.keys(servedByLabel).forEach(function (label) {
            rows.push({ label: label, kind: servedByLabel[label].kind, served: servedByLabel[label].value,
                        status: "FAIL", note: "not reported by the origin file" });
        });
        return rows;
    }

    function summarize(rows) {
        var counts = { PASS: 0, WARN: 0, FAIL: 0 };
        rows.forEach(function (row) {
            counts[row.status]++;
        });
        counts.status = counts.FAIL > 0 ? "FAIL" : counts.WARN > 0 ? "WARN" : "PASS";
        return counts;
    }

    function fetchText(url) {
        return fetch(url, { cache: "no-store" }).then(function (response) {
            if (!response.ok) {
                throw new Error("HTTP " + response.status + " for " + url);
            }
            return response.text();
        });
    }

    /* Tests one file. servedOrigin is where the localized copy comes from ("" for the current host in a browser). */
    function testFile(entry, servedOrigin, round) {
        var query = round === undefined ? "" : "?round=" + round + "-" + Date.now();
        var servedUrl = servedOrigin + DIR + entry.file + query;
        var originUrl = ORIGIN + DIR + entry.file;

        return Promise.all([fetchText(originUrl), fetchText(servedUrl)]).then(function (texts) {
            var origin = run(texts[0]);
            var served = run(texts[1]);
            var rows = compare(origin, served);
            return { file: entry.file, title: entry.title, chunked: !!entry.chunked, servedUrl: servedUrl,
                     originUrl: originUrl, originText: texts[0], servedText: texts[1],
                     identical: texts[0] === texts[1], rows: rows, summary: summarize(rows) };
        }, function (e) {
            var rows = [{ label: "fetch", kind: "run", status: "FAIL", note: e.message }];
            return { file: entry.file, title: entry.title, chunked: !!entry.chunked, servedUrl: servedUrl,
                     originUrl: originUrl, rows: rows, summary: summarize(rows) };
        });
    }

    /* Only runs one copy of a file: on the origin site or a local server there is nothing to compare it with */
    function runFile(entry, base) {
        var url = base + DIR + entry.file;

        return fetchText(url).then(function (text) {
            var rec = run(text);
            var rows = [rec.error || !rec.ran
                ? { label: "file", kind: "run", status: "FAIL", note: rec.error || "did not run to the end" }
                : { label: "file", kind: "run", status: "PASS", note: "runs, reports " + rec.entries.length + " checks" }];
            return { file: entry.file, title: entry.title, chunked: !!entry.chunked, servedUrl: url, originUrl: url,
                     rows: rows, summary: summarize(rows) };
        }, function (e) {
            var rows = [{ label: "fetch", kind: "run", status: "FAIL", note: e.message }];
            return { file: entry.file, title: entry.title, chunked: !!entry.chunked, servedUrl: url, originUrl: url,
                     rows: rows, summary: summarize(rows) };
        });
    }

    root.slJsParserTests = {
        ORIGIN: ORIGIN,
        DIR: DIR,
        FILES: FILES,
        isLocalizedHost: isLocalizedHost,
        run: run,
        compare: compare,
        summarize: summarize,
        testFile: testFile,
        runFile: runFile
    };
}(typeof module !== "undefined" && module.exports ? module.exports : window));
