var Interpreter;
(function (Interpreter) {
    var _ = require('lodash');
    Interpreter._INTS = /([0-9]+)/g;
    Interpreter._ID = /([A-z])+(\w|\d)*/g;
    Interpreter._BOOLS = /(true|false)/g;
    Interpreter._TYPES = /(int|bool)/g;
    Interpreter._PRINT = /print(\s|\n)*\(([A-z])+(\w|\d)*\)/g;
    Interpreter._ASSIGN = /([A-z])+(\w|\d)*(\s|\n)*=(\s|\n)*(([^;]*)|(true|false))/g;
    Interpreter._ASSIGNSTART = /([A-z])+(\w|\d)*(\s|\n)*=(\s|\n)*/g;
    Interpreter._VARDECL = /(int|bool) ([A-z])+(\w|\d)*/g;
    Interpreter._BINOP = /(\+|-|\*|\/|&&|\|\||\^|<|<=|!=|==|>=|>)/g;
    Interpreter._KEYS = /(\+|-|\*|\/|&&|\|\||\^|<|<=|!=|==|>=|>|!|\(|\))/g;
    Interpreter._MAIN = /def main(\s|\n)*\([^()]*\)(\n|\s)*:/g;
    Interpreter._FUNCSTART = /def( |\n)+([A-z])*(\w|\d)*(\s|\n)*\([^()]*\)(\s|\n)*:/g;
    Interpreter._FUNCEND = /end/g;
    Interpreter._STMT = /([^;]*(?==)[^;]*(\s|\n)*;)|(print\([^;]*\)(\s|\n)*;)/g;
    Interpreter._NOTEXPR = /!(\s|\n)*/g;
    Interpreter._OPERATIONEXPR = /.*(\s|\n)*(\+|-|\*|\/|&&|\|\||\^|<|<=|!=|==|>=|>)(\s|\n)*.*/g;
    Interpreter._PRIORITYEXPR = /\((.|\n)*\)/g;
    var StmtType;
    (function (StmtType) {
        StmtType["PRINT"] = "PRINT";
        StmtType["ASSIGN"] = "ASSIGN";
    })(StmtType = Interpreter.StmtType || (Interpreter.StmtType = {}));
    var ExprType;
    (function (ExprType) {
        ExprType["NOT"] = "NOT";
        ExprType["!"] = "NOT";
        ExprType["OP"] = "OPERATION";
        ExprType["+"] = "OPERATION";
        ExprType["-"] = "OPERATION";
        ExprType["*"] = "OPERATION";
        ExprType["/"] = "OPERATION";
        ExprType["&&"] = "OPERATION";
        ExprType["||"] = "OPERATION";
        ExprType["^"] = "OPERATION";
        ExprType["<"] = "OPERATION";
        ExprType["<="] = "OPERATION";
        ExprType[">"] = "OPERATION";
        ExprType[">="] = "OPERATION";
        ExprType["=="] = "OPERATION";
        ExprType["!="] = "OPERATION";
        ExprType["ID"] = "ID";
        ExprType["CONST"] = "CONST";
        ExprType["PRI"] = "PRIORITY";
    })(ExprType = Interpreter.ExprType || (Interpreter.ExprType = {}));
    function parseNewVar(decl, index) {
        var type = decl.split(' ')[0];
        var name = decl.split(' ')[1];
        return new Interpreter.Variable(type, name, index);
    }
    Interpreter.parseNewVar = parseNewVar;
    function parseVariableDecls(body) {
        if (Interpreter._VARDECL.test(body)) {
            var variables_1 = [];
            var vars = body.match(Interpreter._VARDECL).map(function (v) { return v.trim(); });
            logDev(vars.length + ' variables were defined...');
            vars.forEach(function (decl) {
                variables_1.push(parseNewVar(decl, body.indexOf(decl)));
            });
            logDev(variables_1);
            return variables_1;
        }
        else {
            logDev('No variables were defined...');
        }
    }
    Interpreter.parseVariableDecls = parseVariableDecls;
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
    Interpreter.logError = logError;
    function logDev(str) {
        if (process.argv[2] === '--dev') {
            console.log(str);
        }
    }
    Interpreter.logDev = logDev;
    function parseNewStmnt(decl, index) {
        if (Interpreter._ASSIGN.test(decl)) {
            var parts = decl.match(Interpreter._ASSIGN)[0].split('=').map(function (part) { return part.trim(); });
            var exprs = new Interpreter.Expressions(parts[1]);
            return new Interpreter.Statement(StmtType.ASSIGN, parts[0], exprs);
        }
        else if (Interpreter._PRINT.test(decl)) {
            var parts = decl.match(Interpreter._PRINT)[0].split('(').map(function (part) { return part.trim().replace(')', ''); });
            return new Interpreter.Statement(StmtType.PRINT, parts[0], parts[1]);
        }
        else {
            logDev('Invalid statement...');
        }
    }
    Interpreter.parseNewStmnt = parseNewStmnt;
    function parseStmts(body) {
        if (Interpreter._STMT.test(body)) {
            var stmts = body.match(Interpreter._STMT);
            logDev(stmts.length + ' statements were defined...');
            var stmnts_1 = [];
            stmts.forEach(function (stmt) {
                stmnts_1.push(parseNewStmnt(stmt, body.indexOf(body)));
            });
            logDev(JSON.stringify(stmnts_1, null, 2));
            return stmnts_1;
        }
        else {
            logDev('No variables were defined...');
        }
    }
    Interpreter.parseStmts = parseStmts;
})(Interpreter || (Interpreter = {}));
var Interpreter;
(function (Interpreter) {
    var ExprListType;
    (function (ExprListType) {
        ExprListType["NUM"] = "NUMBER";
        ExprListType["BOOL"] = "BOOLEAN";
    })(ExprListType || (ExprListType = {}));
    function splitExpression(expr_str) {
        var op = expr_str.match(Interpreter._BINOP);
        var sections;
        if (op && op.length > 0) {
            sections = expr_str.split(op[0]);
        }
        var arr = [];
        if (sections && sections.length > 1) {
            arr.push({
                line: sections[0],
                op: op[0],
                type: Interpreter.ExprType.OP,
                priority: 1
            });
        }
        else {
            arr.push({
                line: expr_str,
                op: undefined,
                type: Interpreter.ExprType.CONST,
                priority: 1
            });
        }
        if (sections && sections.length > 1) {
            arr.push.apply(arr, splitExpression(sections.slice(1).join(op[0])));
        }
        return arr;
    }
    function splitExpressionByOperation(expr_str, priority) {
        if (priority === void 0) { priority = 0; }
        var op = expr_str.match(Interpreter._KEYS);
        var sections;
        if (op && op.length > 0) {
            sections = expr_str.split(op[0]);
        }
        var arr = [];
        if (sections && sections.length > 1) {
            arr.push({
                line: sections[0],
                op: op[0],
                type: Interpreter.ExprType.OP,
                priority: priority | 0
            });
        }
        else {
            arr.push({
                line: expr_str,
                op: undefined,
                type: Interpreter.ExprType.CONST,
                priority: priority | 0
            });
        }
        if (sections && sections.length > 1) {
            arr.push.apply(arr, splitExpressionByOperation(sections.slice(1).join(op[0]), op[0] === '(' ? priority + 1 : (op[0] === ')' ? priority - 1 : priority)));
        }
        return arr;
    }
    function splitExpression_(expr_str, priority) {
        var op = expr_str.match(Interpreter._BINOP);
        var sections;
        if (op && op.length > 0) {
            sections = expr_str.split(op[0]);
        }
        var arr = [];
        if (sections && sections.length > 1) {
            arr.push(new Expression(sections[0], priority, op[0]));
        }
        else {
            arr.push(new Expression(expr_str, priority));
        }
        if (sections && sections.length > 1) {
            arr.push.apply(arr, splitExpression_(sections.slice(1).join(op[0]), priority));
        }
        return arr;
    }
    var Expression = (function () {
        function Expression(expr_str, priority, symbol) {
            if (priority === void 0) { priority = undefined; }
            if (symbol === void 0) { symbol = undefined; }
            this.data;
            if (Interpreter._PRIORITYEXPR.test(expr_str)) {
                this.type = Interpreter.ExprType.PRI;
                this.priority = priority + 1 | 1;
                var section = expr_str.match(Interpreter._PRIORITYEXPR)[0];
                var in_expr = section.substring(1, section.length);
                expr_str = expr_str.replace(section, '');
                this.operation = symbol;
            }
            else if (Interpreter._NOTEXPR.test(expr_str)) {
                this.type = Interpreter.ExprType.NOT;
                this.priority = priority | 0;
                expr_str.match(Interpreter._NOTEXPR);
                this.operation = '!';
            }
            else if (Interpreter._OPERATIONEXPR.test(expr_str)) {
                this.type = Interpreter.ExprType.OP;
                this.priority = priority | 0;
                expr_str.match(Interpreter._OPERATIONEXPR);
                var op = expr_str.match(Interpreter._BINOP);
                var sections = splitExpression_(expr_str, this.priority);
                this.data = sections;
                this.operation = symbol;
            }
            else if (Interpreter._ID.test(expr_str)) {
                this.type = Interpreter.ExprType.ID;
                this.priority = priority | 0;
                this.data = expr_str.trim();
                this.operation = symbol;
            }
            else if (Interpreter._INTS.test(expr_str) || Interpreter._BOOLS.test(expr_str)) {
                this.type = Interpreter.ExprType.CONST;
                this.priority = priority | 0;
                this.data = expr_str.trim();
                this.operation = symbol;
            }
            else {
                throw new Error('Invalid Expression...');
            }
        }
        return Expression;
    }());
    Interpreter.Expression = Expression;
    var Expressions = (function () {
        function Expressions(expr_str) {
            if (Interpreter._INTS.test(expr_str) && Interpreter._BOOLS.test(expr_str)) {
                throw new Error('Boolean and Int in the same expression. This is not allowed...');
            }
            else {
                this.list = [];
                if (Interpreter._OPERATIONEXPR.test(expr_str)) {
                    var exp_parts = splitExpressionByOperation(expr_str);
                    Interpreter.logDev(exp_parts);
                }
            }
        }
        return Expressions;
    }());
    Interpreter.Expressions = Expressions;
})(Interpreter || (Interpreter = {}));
var Interpreter;
(function (Interpreter) {
    function typeCheck(variable) {
        if (variable.type === 'int') {
            return Interpreter._INTS.test(variable.value);
        }
        else if (variable.type === 'bool') {
            return Interpreter._BOOLS.test(variable.value);
        }
    }
    var Variable = (function () {
        function Variable(type, id, index, val) {
            if (val === void 0) { val = undefined; }
            this.type = type;
            this.id = id;
            this.value = val;
            this.index = index;
            if (val) {
                switch (type) {
                    case 'int':
                        typeCheck(this);
                        break;
                    case 'bool':
                        typeCheck(this);
                        break;
                }
            }
        }
        return Variable;
    }());
    Interpreter.Variable = Variable;
})(Interpreter || (Interpreter = {}));
var Interpreter;
(function (Interpreter) {
    var _FUNCSTART = /def( |\n)+([A-z])*(\w|\d)*( |\n|)*\([^()]*\)( |\n|\s|):/g;
    var _ = require('lodash');
    var Func = (function () {
        function Func(function_str) {
            if (_FUNCSTART.test(function_str)) {
                var decl = function_str.match(_FUNCSTART);
                this.name = decl[0].trim().substring(3, decl[0].indexOf('(')).trim();
                this.main = this.name === 'main' ? true : false;
                this.body = function_str.substring(function_str.indexOf(':') + 1, function_str.indexOf('end')).trim();
                var params_str = decl[0].trim().substring(decl[0].indexOf('(') + 1, decl[0].indexOf(')')).trim();
                var params_arr = params_str.split(',').map(function (v) { return v.trim(); });
                Interpreter.logDev(params_str);
                var _this = this;
                this.params = Interpreter.parseVariableDecls(params_str);
                this.variables = Interpreter.parseVariableDecls(this.body);
                this.stmts = Interpreter.parseStmts(this.body);
            }
        }
        return Func;
    }());
    Interpreter.Func = Func;
})(Interpreter || (Interpreter = {}));
var Interpreter;
(function (Interpreter) {
    var _ = require('lodash');
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
    var _symbols = {};
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
                    Interpreter.logDev(expr1 + " + " + expr2);
                    return expr1 + expr2;
                }
                else if (expr[0].symbol === '*') {
                    operatorChack(expr);
                    Interpreter.logDev(expr1 + " * " + expr2);
                    return expr1 * expr2;
                }
                else if (expr[0].symbol === '/') {
                    operatorChack(expr);
                    return expr1 / expr2;
                }
            }
        }
    }
    Interpreter.evaluateExpr = evaluateExpr;
    function typeCheck(variable) {
        if (variable.type === 'int') {
            return Interpreter._INTS.test(variable.value);
        }
        else if (variable.type === 'bool') {
            return Interpreter._BOOLS.test(variable.value);
        }
    }
    var Statement = (function () {
        function Statement(type, id, data) {
            if (type === Interpreter.StmtType.PRINT) {
                this.type = Interpreter.StmtType.PRINT;
                this.id = id;
            }
            else if (type === Interpreter.StmtType.ASSIGN) {
                this.type = Interpreter.StmtType.ASSIGN;
                this.id = id;
                if (typeof data === 'string') {
                    var parts = data.match(Interpreter._ASSIGN)[0].split('=').map(function (part) { return part.trim(); });
                    this.exprs = new Interpreter.Expressions(parts[1]);
                }
                else {
                    this.exprs = data;
                }
            }
        }
        return Statement;
    }());
    Interpreter.Statement = Statement;
})(Interpreter || (Interpreter = {}));
var Interpreter;
(function (Interpreter) {
    var _ = require('lodash');
    var _stack = [];
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
                if (Interpreter._INTS.test(arg)) {
                    type = 'int';
                }
                else if (Interpreter._ID.test(arg)) {
                    type = 'id';
                }
                else if (Interpreter._BINOP.test(arg)) {
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
    }
    function getProgram(program) {
        Interpreter.logDev(program);
        var stack = parseMain(program);
    }
    function parseMain(program) {
        if (Interpreter._FUNCSTART.test(program)) {
            var main_decl = program.match(Interpreter._FUNCSTART).find(function (delc) { return delc.startsWith('def main'); });
            if (main_decl.length > 0) {
                Interpreter.logDev('Valid main declaration... parsing...');
                var main = new Interpreter.Func(program.substring(program.indexOf(main_decl), program.indexOf("end") + 4));
            }
        }
    }
    function checkMath() {
    }
    readln();
})(Interpreter || (Interpreter = {}));
//# sourceMappingURL=comp.js.map