namespace Interpreter {
    function typeCheck(variable: Variable) {
        if (variable.type === 'int') {
            return _INTS.test(variable.value);
        } else if (variable.type === 'bool') {
            return _BOOLS.test(variable.value);
        }
    }
    export class Variable{
        type: string;
        id: string;
        value: string;
        index: number;
        
        /**
         * 
         * @param type The type (int|bool)
         * @param id The id of the variable
         * @param index the index of the variable
         * @param val the value of the variable (must correctly match the type)
         */
        constructor(type: string, id:string, index:number, val:string=undefined){
            this.type = type;
            this.id = id;
            this.value = val;
            this.index = index;
            if(val){
                switch(type){
                    case 'int':
                        typeCheck(this);
                        break;
                    case 'bool':
                        typeCheck(this);
                        break; 
                }
            }



        }
    }
    
} 
