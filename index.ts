/// <reference path="Variable.ts" />
namespace Interpreter{
	const readline = require('readline');
	const _ = require('lodash');
	const process = require('process');

	// regexes
	const _INTS = /([0-9]+)/g; // basically any number
	const _ID = /([A-z])+([A-z]|[0-9])*/g; // basically any letter
	const _BOOLS = /(true|false)/g;
	const _TYPES = /(int|bool)/g;
	const _PRINT = /print \(([A-z])+([A-z]|[0-9])*\)/g
	const _ASSIGN = /([A-z])+([A-z]|[0-9])* = (([A-z])+([A-z]|[0-9])*|([0-9]+)|(true|false))/g
	const _VARDECL = /(int|bool) ([A-z])+([A-z]|[0-9])*/g;
	const _BINOP = /(\+|-|\*|\/|&&|\|\||\^|<|<=|!=|==|>=|>)/g;
	const _KEYS = /(print|;|end|def|main|=|!|\(|\))/g;
	
	
	//['+', '-', '*', '/', '&&', '||', '^', '<', '<=', '==', '!=', '>=', '>'];
	interface operation {
		key: string,
		operation: string,
		placement: string,
		req_vars: number
	}
	interface stackObj {
		value: string,
		type: string
	}
	// interface variable {
	// 	value: string,
	// 	type: string,
	// 	id: string
	// }

	// import { Variable } from './Variable';

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
	
	

	var _stack: any = []
	var _symbols: any = {

	}

	function readln() {
		// const rl = readline.createInterface({
		// 	input: process.stdin,
		// 	output: process.stdout
		// });

		// rl.question('>> ', (answer: string) => {
		// 	try {
		// 		rl.close();
		// 		if (!lineToStack(answer)) {
		// 			processStack(_stack);
		// 		}
		// 		else {
		// 			// there was some kind of error
		// 			logError(1);
		// 		}
		// 		if (answer.length === 1) {
		// 			if (_ID.test(answer)) {
		// 				console.log(getId(answer));
		// 			}

		// 		}

		// 		clearStack();
		// 		// console.log(_symbols);
		// 		readln();
		// 	}
		// 	catch (e) {
		// 		logError(2);
		// 	}

		// });
		process.stdin.resume();
		process.stdin.setEncoding('utf8');
		process.stdin.on('data', function (data:string) {
			getProgram(data);
			process.stdout.write(data);
		});
	}
	function clearStack() {
		_stack = [];
		// _symbols = {}
	}
	function lineToStack(line: string) {
		let newSection: object[] = [];

		if (line.length === 0) return;

		console.log(line);
		var error = false;
		line.split('').forEach((arg: string, i: number) => {
			// console.log(arg)
			if (arg === ';') {
				// end of string section
				_stack.push(newSection);
				newSection = [];
				// return lineToStack(line.substring(++i));
				return newSection;
				// console.log(newSection)

			}
			else if (arg === '.') {

				// end of string
				_stack.push(newSection);
				if (i != line.length - 1) {
					// there is something behind the '.'
					error = true;
				}

				// return console.log(_stack);


			}
			else {
				// continue stream
				var type;
				if (_INTS.test(arg)) {
					type = 'int'
				}
				else if (_ID.test(arg)) {
					type = 'id'
				}
				else if (_BINOP.test(arg)) {
					type = 'operator'
				}
				else {
					error = true;
				}
				newSection.push({
					symbol: arg,
					type
				});
			}
		});
		return error;
	}

	function processStack(stack: any) {
		stack.forEach((sect: stackObj[]) => {
			// this is for each section. we will now process the part of the stack
			// each section will always have an operator
			// sect: the section of the stack we are looking at (which is separated using the ';' operator)

			var op = sect.find(symbol => symbol.type === 'operator');
			// console.log(op);


			if (op.value === '=' && sect.indexOf(op) === 1) {
				// this is an assignment operater
				// console.log(sect[0]);
				if (sect[0].type === 'id') {
					// if the first item in the substack is an id
					_symbols[sect[0].value] = {
						value: evaluateExpr(_.slice(sect, 2))
					};
				}

			}
			else if (op.value === '!' && sect.indexOf(op) === 0) {
				console.log(_symbols[sect[1].value].value);
			}

		})
	}

	function evaluateExpr(expr: any[]): any {
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

					console.log(`${expr1} + ${expr2}`)
					return expr1 + expr2;
				}
				else if (expr[0].symbol === '*') {
					operatorChack(expr);
					console.log(`${expr1} * ${expr2}`)
					return expr1 * expr2;
				}
				else if (expr[0].symbol === '/') {
					operatorChack(expr);
					return expr1 / expr2;
				}

			}

		}
	}
	function getProgram(program: string) {

		let main = program.replace('\n', ' ').replace('\t', '').split(' ');
		let stack = parseMain(main);
		// processStack(stack);
	}
	function parseMain(main: string[]){
		// at this point the passed string does not have any spaces, new lines, or tabs and each thing was separated by a space.
		if (_KEYS.test(main[0]) && main[0] === 'def' && _KEYS.test(main[1]) && main[1] === 'main' && _KEYS.test(main[main.length-1]) && main[main.length-1] === 'end'){
			// Valid main declairation
			parseVariableDecls(main.slice(3, main.length).join(' '));
			parseStmts(main.slice(3, main.length).join(' '));
		}
	}
	function parseNewVar(decls:string[]){
		// decls: an array of variable declarations
		var variables: Variable[];
		decls.forEach(decl => {
			let type = decl.split(' ')[0];
			let name = decl.split(' ')[1];
			variables.push(new Variable(type, name));
		})
		console.log(variables);
	}
	function parseVariableDecls(line: string) {
		if (_VARDECL.test(line)) {
			var vars = line.match(_VARDECL);
			logDev(vars.length + ' variables were defined...');
			parseNewVar(vars);
		}
		else{
			logDev('No variables were defined...');
		}
	}
	function parseNewStmnt(decls: string[]){

	}
	function parseStmts(line: string){
		if (_PRINT.test(line) || _ASSIGN.test(line)) {
			var vars = [...line.match(_PRINT), ...line.match(_ASSIGN)];

			logDev(vars.length + ' statements were defined...');
			parseNewStmnt(line.match(_VARDECL));
		}
		else {
			logDev('No variables were defined...');
		}
	}
	function getId(id: string) {
		return _symbols[id].value;
	}
	function checkMath() {

	}
	function typeCheck(variable: Variable){
		if (variable.type === 'int'){
			return _INTS.test(variable.value);
		} else if (variable.type === 'bool'){
			return _BOOLS.test(variable.value); 
		}
	}

	function logError(type: number) {
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
	function logDev(str:string){
		if(process.argv[1] === '--dev'){
			console.log(str);
		}
		
	}

	readln();
}
