/// <reference path="Helpers.ts"/>
namespace Interpreter {
    interface ExprPart {
        line: string;
        op: string;
        type: ExprType | string;
        priority: number;
    }
    enum ExprListType {
        "NUM"="NUMBER",
        "BOOL"="BOOLEAN"
    }
    function splitExpression(expr_str: string): ExprPart[]{
        let op: string[] = expr_str.match(_BINOP);
        let sections: string[];
        if (op && op.length > 0){
            sections = expr_str.split(op[0]);
        }
        let arr: ExprPart[] = [];
        if (sections && sections.length > 1) {
            arr.push({ 
                line: sections[0], 
                op: op[0],
                type: ExprType.OP,
                priority: 1
            });
        }
        else {
            arr.push({
                line: expr_str, 
                op: undefined,
                type: ExprType.CONST,
                priority: 1
            });
        }
        
        if (sections && sections.length > 1) {
            arr.push(...splitExpression(sections.slice(1).join(op[0])));
        }
        return arr;
    }
    function splitExpressionByOperation(expr_str: string, priority:number=0): ExprPart[] {
        let op: string[] = expr_str.match(_KEYS);
        let sections: string[];
        if (op && op.length > 0) {
            sections = expr_str.split(op[0]);
        }
        let arr: ExprPart[] = [];
        if (sections && sections.length > 1) {
            arr.push({
                line: sections[0],
                op: op[0],
                type: ExprType.OP,
                priority: priority | 0
            });
        }
        else {
            arr.push({
                line: expr_str,
                op: undefined,
                type: ExprType.CONST,
                priority: priority | 0
            });
        }

        if (sections && sections.length > 1) {
            arr.push(...splitExpressionByOperation(sections.slice(1).join(op[0]), op[0]==='('?priority+1:(op[0]===')'?priority-1:priority) ));
        }
        return arr;
    }
    function splitExpression_(expr_str: string, priority: number): Expression[] {
        let op: string[] = expr_str.match(_BINOP);
        let sections: string[];
        if (op && op.length > 0) {
            sections = expr_str.split(op[0]);
        }
        let arr: Expression[] = [];

        if (sections && sections.length > 1) {
            arr.push(new Expression(sections[0], priority, op[0]));
        }
        else {
            arr.push(new Expression(expr_str, priority));
        }

        if (sections && sections.length > 1) {
            arr.push(...splitExpression_(sections.slice(1).join(op[0]), priority));
        }
        return arr;
    }
    
    export class Expression {
        priority: number;
        type: ExprType;
        data: string | ExprPart[] | Expression[];
        operation: string|null;
        constructor(expr_str: string, priority: number = undefined, symbol: string = undefined) {
            // <Expr> <BinOp> <Expr>  
            // | ! <Expr>
            // | <Id>
            // | <Const> 
            // | (<Expr>)

            // logDev(expr_str);
            this.data;
            
            if (_PRIORITYEXPR.test(expr_str)){
                this.type = ExprType.PRI;
                this.priority = priority+1 | 1;
                let section = expr_str.match(_PRIORITYEXPR)[0];
                let in_expr = section.substring(1, section.length);
                expr_str = expr_str.replace(section, '');
                this.operation = symbol;

            } 
            else if (_NOTEXPR.test(expr_str)) {
                this.type = ExprType.NOT;
                this.priority = priority | 0;

                expr_str.match(_NOTEXPR);

                this.operation = '!';

            } else if (_OPERATIONEXPR.test(expr_str)) {
                this.type = ExprType.OP;
                this.priority = priority|0;
                
                expr_str.match(_OPERATIONEXPR);
                let op = expr_str.match(_BINOP);
                let sections = splitExpression_(expr_str, this.priority);
                // logDev(sections);
                this.data = sections;
                this.operation = symbol;
                

            } else if (_ID.test(expr_str)) {
                this.type = ExprType.ID;
                this.priority = priority | 0;
                this.data = expr_str.trim();
                this.operation = symbol;

            } else if (_INTS.test(expr_str) || _BOOLS.test(expr_str)) {
                this.type = ExprType.CONST;
                this.priority = priority | 0;
                this.data = expr_str.trim();
                this.operation = symbol;
            }
            else{
                throw new Error('Invalid Expression...')
            }
        }
    }
    export class Expressions {
        type: ExprListType;
        list: Expression[];
        constructor(expr_str: string) {
            // <Expr> <BinOp> <Expr>  
            // | ! <Expr>
            // | <Id>
            // | <Const> 
            // | (<Expr>)

            if (_INTS.test(expr_str) && _BOOLS.test(expr_str)){
                throw new Error('Boolean and Int in the same expression. This is not allowed...');
            }
            else {
                this.list = [];
                if (_OPERATIONEXPR.test(expr_str)){
                    let exp_parts: ExprPart[] = splitExpressionByOperation(expr_str);
                    
                    logDev(exp_parts);
                }
                
            }
            
        }
    }
}