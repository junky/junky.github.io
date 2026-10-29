/* JS parser test 05: <sl:translate_json> blocks small enough to reach the parser in one chunk, in the shapes they are
 * used in: an object literal, a "return {...}[key]" lookup as in Squarespace search/index.js, line comment markers, an
 * sl_notranslate key and an empty block (RPS-11071 also fixed the state after an empty block). */
slJsTest("05-translate-json", function (t) {
    var settings = /* <sl:translate_json> */{"title": "Home", "items": ["Dates", "Swaps"], "count": 3, "on": true, "none": null}/* </sl:translate_json> */;

    function bF(e) {/* <sl:translate_json> */return{"6f89f8e0d0e5d1c1":"DCS Test","2d51758d8ced41bf53a84fc3d82f1ddc":"MD Upload"}[e];
/* </sl:translate_json> */}

    var lines = // <sl:translate_json>
    {"heading": "Vue Attributes", "nested": {"label": "String Length"}}
    // </sl:translate_json>
    ;

    var partial = /* <sl:translate_json> */{"sl_notranslate": "code", "title": "Hello world!", "code": "Home"}/* </sl:translate_json> */;

    var empty = 1;/* <sl:translate_json> *//* </sl:translate_json> */var afterEmpty = "Home";

    var after = "Dates";

    t.json("object literal", settings);
    t.lookup("return {...}[e] lookup", bF, "6f89f8e0d0e5d1c1 2d51758d8ced41bf53a84fc3d82f1ddc");
    t.json("line comment markers, nested object", lines);
    t.json("sl_notranslate key", partial, ["code"]);
    t.same("code after an empty block", empty);
    t.same("string after an empty block", afterEmpty);
    t.same("unmarked string after the blocks", after);
});
