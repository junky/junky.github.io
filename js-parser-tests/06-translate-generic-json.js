/* JS parser test 06: <sl:translate_generic_json> hands the block to the generic (jsmn) JSON parser. */
slJsTest("06-translate-generic-json", function (t) {
    var config = /* <sl:translate_generic_json> */{"menu": [{"id": 1, "text": "Home"}, {"id": 2, "text": "Dates"}], "footer": "Swaps"}/* </sl:translate_generic_json> */;

    var lines = // <sl:translate_generic_json>
    {"title": "Machine Translation", "flags": [true, false], "ratio": 0.5}
    // </sl:translate_generic_json>
    ;

    var after = "Home";

    t.json("array of objects", config);
    t.json("line comment markers", lines);
    t.same("unmarked string after the blocks", after);
});
