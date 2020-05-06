/// <reference path="Helpers.ts"/>
/// <reference path="Expression.ts"/>

namespace Interpreter {
    const _ = require('lodash');

    interface operation {
        key: string,
        operation: string,
        placement: string,
        req_vars: number
    }
    const _OPERATORS: operation[] = [
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
    var _symbols: any = {}

    export function evaluateExpr(expr: any[]): any {
        // console.log(expr)
        if (expr.length === 1 || expr[0].type != 'operator') {
            if (expr[0].type === 'const') {
                return Number(expr[0].symbol);
            }
            else if (expr[0].type === 'id') {
                // console.log(_symbols[expr[0].symbol].value);
                return _symbols[expr[0].symbol].value;
            }
        }
        else if (expr.length > 1) {
            // not a simple assignment
            if (expr[0].type === 'operator') {
                var expr1 = 0, expr2 = 0;

                var operatorChack = (_expr: any[]) => {
                    if (_.slice(_expr, 1)[0].type === 'operator') {
                        expr1 = evaluateExpr(_.slice(_expr, 1));
                        expr2 = evaluateExpr(_.slice(_expr, 2 + _OPERATORS.find(operator => operator.key === _.slice(_expr, 1)[0].symbol).req_vars));
                    }
                    else if (_.slice(_expr, 2)[0].type === 'operator') {
                        expr1 = evaluateExpr(_.slice(_expr, 1));
                        expr2 = evaluateExpr(_.slice(_expr, 2));
                    }
                    else {
                        expr1 = evaluateExpr(_.slice(_expr, 1));
                        expr2 = evaluateExpr(_.slice(_expr, 2));
                    }
                }

                if (expr[0].symbol === '-') {
                    // expr1 = evaluateExpr(_.slice(expr, 1));
                    // expr2 = evaluateExpr(_.slice(expr, 2));
                    operatorChack(expr);
                    return expr1 - expr2;
                }
                else if (expr[0].symbol === '+') {
                    operatorChack(expr);

                    logDev(`${expr1} + ${expr2}`)
                    return expr1 + expr2;
                }
                else if (expr[0].symbol === '*') {
                    operatorChack(expr);
                    logDev(`${expr1} * ${expr2}`)
                    return expr1 * expr2;
                }
                else if (expr[0].symbol === '/') {
                    operatorChack(expr);
                    return expr1 / expr2;
                }

            }

        }
    }
    function typeCheck(variable: Variable) {
        if (variable.type === 'int') {
            return _INTS.test(variable.value);
        } else if (variable.type === 'bool') {
            return _BOOLS.test(variable.value);
        }
    }
    
    
    export class Statement {
        type: StmtType;
        id: string;
        exprs: Expressions;
        constructor(type: StmtType, id: string, data: string|Expressions) {
            if (type === StmtType.PRINT){
                this.type = StmtType.PRINT;
                this.id = id;

            } else if (type === StmtType.ASSIGN) {
                this.type = StmtType.ASSIGN;
                this.id = id;
                if(typeof data === 'string'){
                    let parts = data.match(_ASSIGN)[0].split('=').map(part => part.trim());
                    this.exprs = new Expressions(parts[1]);
                }
                else {
                    this.exprs = data;
                }
            }

        }
        
    }
}