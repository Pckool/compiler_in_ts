namespace Interpreter {
    export class Variable{
        type: string;
        id: string;
        value: string;
        constructor(type: string, id:string, val:string=undefined){
            this.type = type;
            this.id = id;
            this.value = val;


        }
    }
    
} 
