/* <sl:hide> */var hiddenBlock = "Home";/* </sl:hide> */
// <sl:hide>
var hiddenLine = "Dates";
// </sl:hide>
/* JS parser test 03: <sl:hide> blocks are cut out of the localized file. They are the first bytes of this small file on
 * purpose: a chunk boundary inside a hide block crashes the worker or leaks the block (RPS-11074, not fixed yet). */
slJsTest("03-hide", function (t) {
    t.gone("hide block, block comment markers", typeof hiddenBlock === "undefined" ? undefined : hiddenBlock);
    t.gone("hide block, line comment markers", typeof hiddenLine === "undefined" ? undefined : hiddenLine);
    t.same("code after the hide blocks", "Swaps");
});
