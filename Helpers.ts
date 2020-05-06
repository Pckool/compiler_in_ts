/// <reference path="Expression.ts"/>
namespace Interpreter {
    const _ = require('lodash');
    // regexes
    export const _INTS = /([0-9]+)/g; // basically any number
    export const _ID = /([A-z])+(\w|\d)*/g; // basically any letter
    export const _BOOLS = /(true|false)/g;
    export const _TYPES = /(int|bool)/g;
    export const _PRINT = /print(\s|\n)*\(([A-z])+(\w|\d)*\)/g;
    export const _ASSIGN = /([A-z])+(\w|\d)*(\s|\n)*=(\s|\n)*(([^;]*)|(true|false))/g;
    export const _ASSIGNSTART = /([A-z])+(\w|\d)*(\s|\n)*=(\s|\n)*/g;
    export const _VARDECL = /(int|bool) ([A-z])+(\w|\d)*/g;
    export const _BINOP = /(\+|-|\*|\/|&&|\|\||\^|<|<=|!=|==|>=|>)/g;
    export const _KEYS = /(\+|-|\*|\/|&&|\|\||\^|<|<=|!=|==|>=|>|!|\(|\))/g;
    export const _MAIN = /def main(\s|\n)*\([^()]*\)(\n|\s)*:/g;
    export const _FUNCSTART = /def( |\n)+([A-z])*(\w|\d)*(\s|\n)*\([^()]*\)(\s|\n)*:/g;
    export const _FUNCEND = /end/g;
    export const _STMT = /([^;]*(?==)[^;]*(\s|\n)*;)|(print\([^;]*\)(\s|\n)*;)/g
    export const _NOTEXPR = /!(\s|\n)*/g
    export const _OPERATIONEXPR = /.*(\s|\n)*(\+|-|\*|\/|&&|\|\||\^|<|<=|!=|==|>=|>)(\s|\n)*.*/g
    export const _PRIORITYEXPR = /\((.|\n)*\)/g
    
    export enum StmtType {
        "PRINT"="PRINT",
        "ASSIGN" ="ASSIGN"
    }
    export enum ExprType {
        "NOT" = "NOT",
        "!" = "NOT",
        "OP" = "OPERATION",
        "+" = "OPERATION",
        "-" = "OPERATION",
        "*" = "OPERATION",
        "/" = "OPERATION",
        "&&" = "OPERATION",
        "||" = "OPERATION",
        "^" = "OPERATION",
        "<" = "OPERATION",
        "<=" = "OPERATION",
        ">" = "OPERATION",
        ">=" = "OPERATION",
        "==" = "OPERATION",
        "!=" = "OPERATION",
        "ID" = "ID",
        "CONST" = "CONST",
        "PRI" = "PRIORITY"
    }
    // export interface Stmt {
    //     type: StmtType
    // }

    export function parseNewVar(decl: string, index:number): Variable {
        // decls: an array of variable declarations
        let type = decl.split(' ')[0];
        let name = decl.split(' ')[1];
        return new Variable(type, name, index)
    }
    export function parseVariableDecls(body: string) {
        if (_VARDECL.test(body)) {
            let variables: Variable[] = [];
            let vars = body.match(_VARDECL).map(v => v.trim());
            logDev(vars.length + ' variables were defined...');
            vars.forEach(decl => {
                variables.push(parseNewVar(decl, body.indexOf(decl)));
            })
            logDev(variables);
            return variables;
            
        }
        else {
            logDev('No variables were defined...');
        }
    }
    export function logError(type: number) {
        switch (type) {
            case 1:
                // syntax
                console.error("Syntax Error");
                break;
            case 2:
                // exception of some kind
                console.error("Exception");
                break;
        }

    }
    export function logDev(str: any) {
        if (process.argv[2] === '--dev') {
            console.log(str);
        }

    }
    export function parseNewStmnt(decl: string, index: number): Statement {
        if (_ASSIGN.test(decl)){
            let parts = decl.match(_ASSIGN)[0].split('=').map(part => part.trim());
            let exprs = new Expressions(parts[1]);
            return new Statement(StmtType.ASSIGN, parts[0], exprs);
        }
        else if (_PRINT.test(decl)) {
            let parts = decl.match(_PRINT)[0].split('(').map(part => part.trim().replace(')', ''));
            return new Statement(StmtType.PRINT, parts[0], parts[1]);
        }
        else {
            logDev('Invalid statement...');
        }
        
        
    }
    export function parseStmts(body: string): Statement[] {
        if (_STMT.test(body)){
            var stmts = body.match(_STMT);

            logDev(stmts.length + ' statements were defined...');
            let stmnts: Statement[] = []
            stmts.forEach(stmt => {
                stmnts.push(parseNewStmnt(stmt, body.indexOf(body)));
            })
            logDev(JSON.stringify(stmnts, null, 2));
            return stmnts;
            
            
            
            

        } else {
            logDev('No variables were defined...');
        }
        
    }
}