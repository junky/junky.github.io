/* JS parser test 09: syntax the lexer has to get right to find strings, comments and markers: regular expressions with
 * quotes, division, template literals with nested ${...} and backticks (RPS-10686), comment-like text in strings and
 * escapes. If the lexer loses track, the marked strings at the end are not translated or the file stops running. */
slJsTest("09-lexer-edge-cases", function (t) {
    var quoteRegex = /"[^"]*"/g;
    var apostropheRegex = /'/;
    var commentRegex = /\/\*.*?\*\//;
    var classRegex = /[/"'`]/;
    var half = 10 / 2 / 5;
    var ratio = (half + 4) / 2; var notRegex = 6 / 3; // "/ is division here"
    var n = 2;
    var template = `a "b" 'c' /* not a comment */ ${n > 1 ? `nested ${"x" + `y`}` : 'z'} // still the template`;
    var multiline = `line 1
line "2" with ${ { a: "}" }.a } brace`;
    var slashes = "http://example.com/a//b /* not a comment */";
    var escapes = "tab\tquote\"backslash\\ A\x42 \u{1F600}";
    var unicode = "Привіт, світ — ünïcödé";
    var html = "</script><!-- not a comment -->";

    /* <sl:translate> */
    var marked = "Home";
    var markedAfterRegex = ["Dates", /"/.source][0];
    var markedTemplate = `Swaps`;
    /* </sl:translate> */

    var unmarked = "Home";

    t.same("regex with double quotes", quoteRegex.source);
    t.same("regex with an apostrophe", apostropheRegex.source);
    t.same("regex with comment characters", commentRegex.source);
    t.same("regex character class with quotes and a backtick", classRegex.source);
    t.same("division", [half, ratio, notRegex]);
    t.same("template literal with nested template literals", template);
    t.same("multi-line template literal with a brace in a string", multiline);
    t.same("string with // and /* */", slashes);
    t.same("string with escapes", escapes);
    t.same("non-ASCII string", unicode);
    t.same("string with HTML comment and script end tag", html);
    t.tr("marked string after all of the above", marked);
    t.tr("marked string next to a regex", markedAfterRegex);
    t.same("marked template literal (the lexer translates quoted strings only)", markedTemplate);
    t.same("unmarked string at the end", unmarked);
});
