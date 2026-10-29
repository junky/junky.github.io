/* JS parser test 01: <sl:translate> markers. Only strings between the markers are translated; strings outside them stay
 * as they are. The strings already have uk-UA translations in this project ("Home" is "Головна"), so marked ones come
 * back translated right away and an unmarked one that comes back translated is a parser bug. */
slJsTest("01-translate", function (t) {
    var before = "Home";

    /* <sl:translate> */
    var nav = ["Home", "Dates", 'Swaps'];
    var page = { title: "DCS Test", subtitle: 'MD Upload' };
    var greeting = "Hello world!";
    /* </sl:translate> */

    var between = "Dates";

    // <sl:translate>
    var label = 'String Length';
    var quoted = 'Let\'s start from the beginning';
    var doubleQuoted = "Let's start from the beginning";
    // </sl:translate>

    var inline = /* <sl:translate> */"Machine Translation"/* </sl:translate> */;
    var call = String(/* <sl:translate> */'Vue Attributes'/* </sl:translate> */);
    var after = "Swaps";

    t.same("unmarked string before the markers", before);
    t.tr("block comment markers: array item, double quotes", nav[0]);
    t.tr("block comment markers: array item", nav[1]);
    t.tr("block comment markers: array item, single quotes", nav[2]);
    t.tr("block comment markers: object property", page.title);
    t.tr("block comment markers: object property, single quotes", page.subtitle);
    t.tr("block comment markers: punctuation", greeting);
    t.same("unmarked string between marked blocks", between);
    t.tr("line comment markers", label);
    t.tr("line comment markers: escaped quote", quoted);
    t.tr("line comment markers: quote in a double-quoted string", doubleQuoted);
    t.tr("inline markers around one string", inline);
    t.tr("inline markers in a call argument", call);
    t.same("unmarked string after the markers", after);
});
