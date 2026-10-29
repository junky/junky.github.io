/* js-parser-tests.html: runs the tests with runner.js and shows the results */
(function () {
    "use strict";

    var T = window.slJsParserTests;
    var localized = T.isLocalizedHost(window.location.origin);
    var results = document.getElementById("js-tests-results");
    var runButton = document.getElementById("js-tests-run");
    var repeatButton = document.getElementById("js-tests-repeat");
    var BADGES = { PASS: "bg-success", WARN: "bg-warning text-dark", FAIL: "bg-danger" };
    var ROWS_SHOWN_FOR_CHUNKED = 20;

    function el(tag, className, text) {
        var e = document.createElement(tag);
        if (className) {
            e.className = className;
        }
        if (text !== undefined) {
            e.textContent = text;
        }
        return e;
    }

    function badge(status) {
        return el("span", "badge " + BADGES[status], status);
    }

    function show(value) {
        if (value === undefined) {
            return "";
        }
        var s = JSON.stringify(value);
        return s.length > 300 ? s.slice(0, 300) + "..." : s;
    }

    function link(href, text) {
        var a = el("a", null, text);
        a.href = href;
        a.target = "_blank";
        return a;
    }

    function render(result, extra) {
        var section = el("div", "mb-4");
        var head = el("h2", "h6");
        var s = result.summary;
        var rows = result.rows;

        head.appendChild(badge(s.status));
        head.appendChild(document.createTextNode(" " + result.file + " — " + result.title + " "));
        section.appendChild(head);

        var info = el("div", "small text-muted mb-1");
        info.appendChild(document.createTextNode(s.PASS + " pass, " + s.WARN + " warn, " + s.FAIL + " fail"
            + (result.identical === undefined ? "" : result.identical ? "; served file is identical to the origin"
                : "; served file differs from the origin") + (extra ? "; " + extra : "") + " · "));
        info.appendChild(link(result.servedUrl, "served"));
        info.appendChild(document.createTextNode(" · "));
        info.appendChild(link(result.originUrl, "origin"));
        section.appendChild(info);

        if (result.chunked) {
            rows = rows.filter(function (row) {
                return row.status !== "PASS";
            }).slice(0, ROWS_SHOWN_FOR_CHUNKED);
            if (rows.length === 0) {
                return section;
            }
        }

        var table = el("table", "table table-sm table-bordered small");
        var thead = el("thead");
        var tr = el("tr");
        ["", "Check", "Origin", "Served", "Note"].forEach(function (h) {
            tr.appendChild(el("th", null, h));
        });
        thead.appendChild(tr);
        table.appendChild(thead);
        var tbody = el("tbody");
        rows.forEach(function (row) {
            var r = el("tr");
            var cell = el("td");
            cell.appendChild(badge(row.status));
            r.appendChild(cell);
            r.appendChild(el("td", null, row.label));
            r.appendChild(el("td", "js-test-values", show(row.origin)));
            r.appendChild(el("td", "js-test-values", show(row.served)));
            r.appendChild(el("td", null, row.note));
            tbody.appendChild(r);
        });
        table.appendChild(tbody);
        section.appendChild(table);
        return section;
    }

    function setBusy(busy) {
        runButton.disabled = busy;
        repeatButton.disabled = busy || !localized;
    }

    function runAll() {
        setBusy(true);
        results.textContent = "Running...";
        Promise.all(T.FILES.map(function (entry) {
            return localized ? T.testFile(entry, "") : T.runFile(entry, "");
        })).then(function (all) {
            results.textContent = "";
            all.forEach(function (result) {
                results.appendChild(render(result));
            });
            setBusy(false);
        });
    }

    /* The chunk boundaries of a response change from request to request: run the chunk tests a number of times */
    function repeatChunked(rounds) {
        var chunked = T.FILES.filter(function (entry) {
            return entry.chunked;
        });
        var failed = {};
        var last = {};
        var round = 0;

        setBusy(true);
        chunked.forEach(function (entry) {
            failed[entry.file] = 0;
        });

        function next() {
            if (round === rounds) {
                results.textContent = "";
                chunked.forEach(function (entry) {
                    results.appendChild(render(last[entry.file], failed[entry.file] + " of " + rounds + " rounds failed"));
                });
                setBusy(false);
                return;
            }
            round++;
            results.textContent = "Round " + round + " of " + rounds + "...";
            Promise.all(chunked.map(function (entry) {
                return T.testFile(entry, "", round);
            })).then(function (all) {
                all.forEach(function (result) {
                    if (result.summary.status === "FAIL") {
                        failed[result.file]++;
                        last[result.file] = result;
                    } else if (!last[result.file] || last[result.file].summary.status !== "FAIL") {
                        last[result.file] = result;
                    }
                });
                next();
            });
        }
        next();
    }

    document.getElementById("js-tests-mode").textContent = localized
        ? "Localized domain: comparing with the origin."
        : "Not a localized domain: the files are only run, nothing is compared.";
    runButton.addEventListener("click", runAll);
    repeatButton.addEventListener("click", function () {
        repeatChunked(10);
    });
    runAll();
}());
