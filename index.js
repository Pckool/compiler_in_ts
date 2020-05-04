var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var Interpreter;
(function (Interpreter) {
    var readline = require('readline');
    var _ = require('lodash');
    var process = require('process');
    var _INTS = /([0-9]+)/g;
    var _ID = /([A-z])+([A-z]|[0-9])*/g;
    var _BOOLS = /(true|false)/g;
    var _TYPES = /(int|bool)/g;
    var _PRINT = /print \(([A-z])+([A-z]|[0-9])*\)/g;
    var _ASSIGN = /([A-z])+([A-z]|[0-9])* = (([A-z])+([A-z]|[0-9])*|([0-9]+)|(true|false))/g;
    var _VARDECL = /(int|bool) ([A-z])+([A-z]|[0-9])*/g;
    var _BINOP = /(\+|-|\*|\/|&&|\|\||\^|<|<=|!=|==|>=|>)/g;
    var _KEYS = /(print|;|end|def|main|=|!|\(|\))/g;
    var _OPERATORS = [
        {
            key: '=',
            operation: 'assign',
            placement: 'in',
            req_vars: 2
        },
        {
            key: '+',
            operation: 'add',
            placement: 'pre',
            req_vars: 2
        },
        {
            key: '-',
            operation: 'subt',
            placement: 'pre',
            req_vars: 2
        },
        {
            key: '*',
            operation: 'multi',
            placement: 'pre',
            req_vars: 2
        },
        {
            key: '/',
            operation: 'divi',
            placement: 'pre',
            req_vars: 2
        },
        {
            key: '!',
            operation: 'print',
            placement: 'pre',
            req_vars: 1
        },
    ];
    var _stack = [];
    var _symbols = {};
    function readln() {
        console.log(process.argv);
        process.stdin.resume();
        process.stdin.setEncoding('utf8');
        process.stdin.on('data', function (data) {
            getProgram(data);
        });
    }
    function clearStack() {
        _stack = [];
    }
    function lineToStack(line) {
        var newSection = [];
        if (line.length === 0)
            return;
        console.log(line);
        var error = false;
        line.split('').forEach(function (arg, i) {
            if (arg === ';') {
                _stack.push(newSection);
                newSection = [];
                return newSection;
            }
            else if (arg === '.') {
                _stack.push(newSection);
                if (i != line.length - 1) {
                    error = true;
                }
            }
            else {
                var type;
                if (_INTS.test(arg)) {
                    type = 'int';
                }
                else if (_ID.test(arg)) {
                    type = 'id';
                }
                else if (_BINOP.test(arg)) {
                    type = 'operator';
                }
                else {
                    error = true;
                }
                newSection.push({
                    symbol: arg,
                    type: type
                });
            }
        });
        return error;
    }
    function processStack(stack) {
        stack.forEach(function (sect) {
            var op = sect.find(function (symbol) { return symbol.type === 'operator'; });
            if (op.value === '=' && sect.indexOf(op) === 1) {
                if (sect[0].type === 'id') {
                    _symbols[sect[0].value] = {
                        value: evaluateExpr(_.slice(sect, 2))
                    };
                }
            }
            else if (op.value === '!' && sect.indexOf(op) === 0) {
                console.log(_symbols[sect[1].value].value);
            }
        });
    }
    function evaluateExpr(expr) {
        if (expr.length === 1 || expr[0].type != 'operator') {
            if (expr[0].type === 'const') {
                return Number(expr[0].symbol);
            }
            else if (expr[0].type === 'id') {
                return _symbols[expr[0].symbol].value;
            }
        }
        else if (expr.length > 1) {
            if (expr[0].type === 'operator') {
                var expr1 = 0, expr2 = 0;
                var operatorChack = function (_expr) {
                    if (_.slice(_expr, 1)[0].type === 'operator') {
                        expr1 = evaluateExpr(_.slice(_expr, 1));
                        expr2 = evaluateExpr(_.slice(_expr, 2 + _OPERATORS.find(function (operator) { return operator.key === _.slice(_expr, 1)[0].symbol; }).req_vars));
                    }
                    else if (_.slice(_expr, 2)[0].type === 'operator') {
                        expr1 = evaluateExpr(_.slice(_expr, 1));
                        expr2 = evaluateExpr(_.slice(_expr, 2));
                    }
                    else {
                        expr1 = evaluateExpr(_.slice(_expr, 1));
                        expr2 = evaluateExpr(_.slice(_expr, 2));
                    }
                };
                if (expr[0].symbol === '-') {
                    operatorChack(expr);
                    return expr1 - expr2;
                }
                else if (expr[0].symbol === '+') {
                    operatorChack(expr);
                    console.log(expr1 + " + " + expr2);
                    return expr1 + expr2;
                }
                else if (expr[0].symbol === '*') {
                    operatorChack(expr);
                    console.log(expr1 + " * " + expr2);
                    return expr1 * expr2;
                }
                else if (expr[0].symbol === '/') {
                    operatorChack(expr);
                    return expr1 / expr2;
                }
            }
        }
    }
    function getProgram(program) {
        logDev(program);
        var main = program.replace('\n', ' ').replace('\t', '').split(' ');
        var stack = parseMain(main);
    }
    function parseMain(main) {
        if (_KEYS.test(main[main.length - 1]) && main[main.length - 1] === 'end') {
            logDev("Found " + main[main.length - 1].match(_KEYS) + "...");
        }
        if (_KEYS.test(main[1]) && main[1] === 'main') {
            logDev("Found " + main[1].match(_KEYS) + "...");
        }
        if (_KEYS.test(main[0]) && main[0] === 'def') {
            logDev("Found " + main[0].match(_KEYS) + "...");
        }
        if (_KEYS.test(main[0]) && main[0] === 'def' && _KEYS.test(main[1]) && main[1] === 'main' && _KEYS.test(main[main.length - 1]) && main[main.length - 1] === 'end') {
            logDev('Valid main... parsing...');
            parseVariableDecls(main.slice(3, main.length).join(' '));
            parseStmts(main.slice(3, main.length).join(' '));
        }
    }
    function parseNewVar(decls) {
        var variables;
        decls.forEach(function (decl) {
            var type = decl.split(' ')[0];
            var name = decl.split(' ')[1];
            variables.push(new Interpreter.Variable(type, name));
        });
        console.log(variables);
    }
    function parseVariableDecls(line) {
        if (_VARDECL.test(line)) {
            var vars = line.match(_VARDECL);
            logDev(vars.length + ' variables were defined...');
            parseNewVar(vars);
        }
        else {
            logDev('No variables were defined...');
        }
    }
    function parseNewStmnt(decls) {
    }
    function parseStmts(line) {
        if (_PRINT.test(line) || _ASSIGN.test(line)) {
            var vars = __spreadArrays(line.match(_PRINT), line.match(_ASSIGN));
            logDev(vars.length + ' statements were defined...');
            parseNewStmnt(line.match(_VARDECL));
        }
        else {
            logDev('No variables were defined...');
        }
    }
    function getId(id) {
        return _symbols[id].value;
    }
    function checkMath() {
    }
    function typeCheck(variable) {
        if (variable.type === 'int') {
            return _INTS.test(variable.value);
        }
        else if (variable.type === 'bool') {
            return _BOOLS.test(variable.value);
        }
    }
    function logError(type) {
        switch (type) {
            case 1:
                console.error("Syntax Error");
                break;
            case 2:
                console.error("Exception");
                break;
        }
    }
    function logDev(str) {
        if (process.argv[2] === '--dev') {
            console.log(str);
        }
    }
    readln();
})(Interpreter || (Interpreter = {}));
//# sourceMappingURL=index.js.map