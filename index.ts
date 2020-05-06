/// <reference path="Helpers.ts" />
/// <reference path="Variable.ts" />
/// <reference path="Function.ts" />

namespace Interpreter{
	const _ = require('lodash');
	// const process = require('process');
	
	
	//['+', '-', '*', '/', '&&', '||', '^', '<', '<=', '==', '!=', '>=', '>'];
	
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

	



	var _stack: any = []
	

	function readln() {
		
		console.log(process.argv);
		process.stdin.resume();
		process.stdin.setEncoding('utf8');
		process.stdin.on('data', function (data:string) {
			getProgram(data);
			// process.stdout.write(data);
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
		// stack.forEach((sect: stackObj[]) => {
		// 	// this is for each section. we will now process the part of the stack
		// 	// each section will always have an operator
		// 	// sect: the section of the stack we are looking at (which is separated using the ';' operator)

		// 	var op = sect.find(symbol => symbol.type === 'operator');
		// 	// console.log(op);


		// 	if (op.value === '=' && sect.indexOf(op) === 1) {
		// 		// this is an assignment operater
		// 		// console.log(sect[0]);
		// 		if (sect[0].type === 'id') {
		// 			// if the first item in the substack is an id
		// 			_symbols[sect[0].value] = {
		// 				value: evaluateExpr(_.slice(sect, 2))
		// 			};
		// 		}

		// 	}
		// 	else if (op.value === '!' && sect.indexOf(op) === 0) {
		// 		console.log(_symbols[sect[1].value].value);
		// 	}

		// })
	}

	
	function getProgram(program: string) {
		logDev(program);
		// let main = program.replace('\n', ' ').replace('\t', '').split(' ');
		let stack = parseMain(program);
		// processStack(stack);
	}
	function parseMain(program: string){
		// at this point the passed string does not have any spaces, new lines, or tabs and each thing was separated by a space.
		
		if (_FUNCSTART.test(program)){
			let main_decl = program.match(_FUNCSTART).find(delc => delc.startsWith('def main'));
			if (main_decl.length>0) {
				// Valid main declairation
				logDev('Valid main declaration... parsing...');
				let main = new Func(program.substring(program.indexOf(main_decl), program.indexOf("end")+4));

				
			}
		}
		
		
	}
	
	function checkMath() {

	}
	

	readln();
}
