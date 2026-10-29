/* JS parser test 04: <sl:translate_html> treats the strings between the markers as HTML. Text is translated, tags and
 * attributes are kept. */
slJsTest("04-translate-html", function (t) {
    /* <sl:translate_html> */
    var menu = "<b>Home</b> | <i>Dates</i>";
    var link = '<a href="/swaps.html" class="nav-link">Swaps</a>';
    var list = "<ul><li>DCS Test</li><li>MD Upload</li></ul>";
    /* </sl:translate_html> */

    // <sl:translate_html>
    var line = "<span title=\"tooltip\">String Length</span>";
    // </sl:translate_html>

    var unmarked = "<b>Home</b>";

    t.html("bold and italic text", menu);
    t.html("link with attributes", link);
    t.html("list items", list);
    t.html("line comment markers, escaped quotes in attribute", line);
    t.same("unmarked HTML string", unmarked);
});
