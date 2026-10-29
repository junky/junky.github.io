/* JS parser test 02: <sl:notranslate> inside a <sl:translate> block keeps its strings as they are, and marker text in
 * strings or in comments that are not markers must not switch translation on. "Swaps" is used where it matters: as a
 * JS string it already has a uk-UA translation in the project ("Свопи"), so a wrongly translated one shows. */
slJsTest("02-notranslate", function (t) {
    /* <sl:translate> */
    var first = "Home";
    /* <sl:notranslate> */
    var kept = "Swaps";
    var keptToo = 'Swaps';
    /* </sl:notranslate> */
    var last = "Swaps";
    /* </sl:translate> */

    // <sl:translate>
    var lineFirst = "DCS Test";
    // <sl:notranslate>
    var lineKept = "Swaps";
    // </sl:notranslate>
    // </sl:translate>

    var openInString = "/* <sl:translate> */";
    var afterOpenInString = "Swaps";
    var closeInString = '/* </sl:translate> */';
    var lineOpenInString = "// <sl:translate>";
    var afterLineOpenInString = "Swaps";

    /* a comment that mentions <sl:translate> in the middle is not a marker */
    var afterComment = "Swaps";

    t.tr("translate block, before notranslate", first);
    t.same("inside notranslate, within translate", kept);
    t.same("inside notranslate, within translate, single quotes", keptToo);
    t.tr("translate block, after notranslate", last);
    t.tr("line markers: translate", lineFirst);
    t.same("line markers: inside notranslate, within translate", lineKept);
    t.same("open marker text in a string", openInString);
    t.same("string after open marker text in a string", afterOpenInString);
    t.same("close marker text in a string", closeInString);
    t.same("line open marker text in a string", lineOpenInString);
    t.same("string after line open marker text in a string", afterLineOpenInString);
    t.same("string after a comment mentioning the marker", afterComment);
});
