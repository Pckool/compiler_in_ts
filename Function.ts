/// <reference path="Helpers.ts"/>
/// <reference path="Variable.ts"/>
namespace Interpreter {
    const _FUNCSTART = /def( |\n)+([A-z])*(\w|\d)*( |\n|)*\([^()]*\)( |\n|\s|):/g
    const _ = require('lodash');
    interface Params {
        name: string,
        data: string
    }
    export class Func {
        body: string;
        name: string;
        params: Variable[];
        variables: Variable[];
        stmts: Statement[];
        main: boolean;
        /**
         * 
         * @param function_str a string containing the full function declaration (declaration 'def fname():' and 'end')
         */
        constructor(function_str:string){
            if (_FUNCSTART.test(function_str)){
                let decl = function_str.match(_FUNCSTART);
                
                this.name = decl[0].trim().substring(3, decl[0].indexOf('(')).trim();
                
                this.main = this.name==='main'?true:false;

                this.body = function_str.substring(function_str.indexOf(':') + 1, function_str.indexOf('end')).trim();
                let params_str = decl[0].trim().substring(decl[0].indexOf('(') + 1, decl[0].indexOf(')')).trim();
                let params_arr = params_str.split(',').map(v => v.trim());
                logDev(params_str);
                let _this = this;
                this.params = parseVariableDecls(params_str);

                this.variables = parseVariableDecls(this.body);
                
                this.stmts = parseStmts(this.body);

            }
            
            

        }
    }
}