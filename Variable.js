var Interpreter;
(function (Interpreter) {
    var Variable = (function () {
        function Variable(type, id, val) {
            if (val === void 0) { val = undefined; }
            this.type = type;
            this.id = id;
            this.value = val;
        }
        return Variable;
    }());
    Interpreter.Variable = Variable;
})(Interpreter || (Interpreter = {}));
//# sourceMappingURL=Variable.js.map