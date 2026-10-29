/* JS parser test 07: <sl:translate_md> treats the strings between the markers as Markdown. Text is translated, the
 * Markdown syntax is kept. */
slJsTest("07-translate-md", function (t) {
    /* <sl:translate_md> */
    var heading = "# Home";
    var emphasis = "**Dates** and _Swaps_";
    var list = "- DCS Test\n- MD Upload\n";
    var link = "[Vue Attributes](/vue-attributes.html)";
    /* </sl:translate_md> */

    var unmarked = "# Home";

    t.md("heading", heading);
    t.md("bold and italic", emphasis);
    t.md("list", list);
    t.md("link", link);
    t.same("unmarked Markdown string", unmarked);
});
