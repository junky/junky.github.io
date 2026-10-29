/* JS parser test 02: <sl:notranslate> inside a <sl:translate> block keeps its strings as they are, and marker text in
 * strings or in comments that are not markers must not switch translation on. */
slJsTest("02-notranslate", function (t) {
    /* <sl:translate> */
    var first = "Home";
    /* <sl:notranslate> */
    var kept = "Home";
    var keptToo = 'Dates';
    /* </sl:notranslate> */
    var last = "Swaps";
    /* </sl:translate> */

    // <sl:translate>
    var lineFirst = "DCS Test";
    // <sl:notranslate>
    var lineKept = "DCS Test";
    // </sl:notranslate>
    // </sl:translate>

    var openInString = "/* <sl:translate> */";
    var afterOpenInString = "Home";
    var closeInString = '/* </sl:translate> */';
    var lineOpenInString = "// <sl:translate>";
    var afterLineOpenInString = "Dates";

    /* a comment that mentions <sl:translate> in the middle is not a marker */
    var afterComment = "Swaps";

    t.tr("translate block, before notranslate", first);
    t.same("notranslate inside translate", kept);
    t.same("notranslate inside translate, single quotes", keptToo);
    t.tr("translate block, after notranslate", last);
    t.tr("line markers: translate", lineFirst);
    t.same("line markers: notranslate inside translate", lineKept);
    t.same("open marker text in a string", openInString);
    t.same("string after open marker text in a string", afterOpenInString);
    t.same("close marker text in a string", closeInString);
    t.same("line open marker text in a string", lineOpenInString);
    t.same("string after line open marker text in a string", afterLineOpenInString);
    t.same("string after a comment mentioning the marker", afterComment);
});
