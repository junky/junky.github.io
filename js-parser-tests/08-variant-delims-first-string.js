/* JS parser test 08: options inside the <sl:translate> marker. <delims> splits a string into separately translated
 * parts, <first-string> translates only the first string after the marker, <variant> makes the strings a separate
 * variant (a new string that has no translation until it is translated in Smartling). */
slJsTest("08-variant-delims-first-string", function (t) {
    /* <sl:translate><delims>|</delims> */
    var menu = "Home|Dates|Swaps";
    /* </sl:translate> */

    /* <sl:translate><first-string> */
    var firstString = "Swaps";
    var secondString = "Swaps";

    /* <sl:translate><variant>js-parser-test</variant> */
    var variant = "MD Upload";
    /* </sl:translate> */

    var after = "Home";

    t.parts("delims: parts split by |", menu, "|");
    t.tr("first-string: first string", firstString);
    t.same("first-string: second string", secondString);
    t.tr("variant: new string, translated once it is translated in Smartling", variant);
    t.same("unmarked string after the blocks", after);
});
