 // BUDGET CONTROLLER
var budgetController=(function(){
    var Expense=function(id,description,value){
        this.id=id;
        this.description=description;
        this.value=value;
        this.percentage=-1;
    };

    Expense.prototype.calcPercentage=function(totalIncome){
        if(totalIncome>0){
            this.percentage=Math.round((this.value/totalIncome)*100);
        }
        else{
            this.percentage=-1;
        }
        
    };

    Expense.prototype.getPercentage=function(){
        return this.percentage;
    }
    var Income=function(id,description,value){
        this.id=id;
        this.description=description;
        this.value=value;
    };

    var calculateTotal=function(type){
        var sum=0;
        data.allItem[type].forEach(function(cur){
            sum += cur.value;
        });
        data.totals[type]=sum;

    };

    var data={
        allItem:{
            exp:[],
            inc:[]
        },
        totals:{
            exp:0,
            inc:0
        },
        budget:0,
        percentage:-1
    };

    return{
        addItem : function(type,des,val){
            var newItem,ID;
            
            //[1,2,3,4,5] next ID=6 
            // Since we are deleting it would become a problem of duplication

            //[1,3,5,6,8] next ID=9
            // now our ID=Previous ID + 1

            // Creating a new ID
            if(data.allItem[type].length>0){
            ID=data.allItem[type][data.allItem[type].length - 1].id + 1;
            }
            else{
                ID=0;
            }
            // Creating a new based on 'inc' or 'exp'

            if(type==='exp'){
                newItem=new Expense(ID,des,val);
            }else if(type === 'inc'){
                newItem=new Income(ID,des,val);
            }

            // Pushing a new item in data structure
            data.allItem[type].push(newItem);

            //return the new item
            return newItem;

        },



        deleteItem :function(type,id){
            var ids,index;
            ids=data.allItem[type].map(function(current){
                return current.id;
            });
            index=ids.indexOf(id);

            if(index !==-1){
                data.allItem[type].splice(index,1);
            }
        },




        calculateBudget: function(){

            // calculate total income and exxpenses
                calculateTotal('exp');
                calculateTotal('inc');
            // calcualte the total budget
                data.budget = data.totals.inc - data.totals.exp;
            // calculate the % of income that are spent
                if(data.totals.inc>0){
                    data.percentage=Math.round((data.totals.exp/data.totals.inc)*100);    
                }
                else{
                    data.percentage=-1;
                }

        },

        calculatePercentages:function(){
            data.allItem.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            });
        },
        getPercentage:function(){
            var allPerc=data.allItem.exp.map(function(cur){
                return cur.getPercentage();
            });
            return allPerc;
        },

        getBudget: function(){
            return {
                budget  : data.budget,
                totalInc    :   data.totals.inc,
                totalExp    :   data.totals.exp,
                percentage  : data.percentage

            }
        },
        testing:function(){
           console.log(data); 
        }

    }

})();

 // UI CONTROLLER
var UIController=(function(){

    var DOMstrings={
        inputType:'.add__type',
        inputDescription:'.add__description',
        inputValue:'.add__value',
        inputBtn:'.add__btn',
        incomeContainer:'.income__list',
        expensesContainer:'.expenses__list',
        budgetLable: '.budget__value',
        incomeLable:'.budget__income--value',
        expensesLable:'.budget__expenses--value',
        percentageLable:'.budget__expenses--percentage',
        container:'.container',
        expensesPercLable:'.item__percentage',
        dateLable:'.budget__title--month'
    };
    var formatNumber=function(num,type){
        /*  1.   + or - before number
            2.   exactly 2 decimal points
            3.   comma seprating the thousands
        */
        var numSplit;
        num=Math.abs(num);
        num=num.toFixed(2);

        numSplit=num.split('.');
        int =numSplit[0];
        if(int.length>3){
            int=int.substr(0,int.length-3)+ ','+ int.substr(int.length-3,3); 
        }
        dec=numSplit[1];
        return (type==='exp'?'-':'+')+' '+int+'.'+dec;
     
    };

    var nodeListForEach=function(list,callback){
        for(var i=0;i<list.length;i++){
            callback(list[i],i);
        }
    };
    return{
        getInput : function(){
            return{
                type: document.querySelector(DOMstrings.inputType).value,
                // will be either inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
            },
            
        addListItem:function(obj,type){
            var html,newHtml,element;
            // Create html strings with placeholder text
            if(type==='inc'){
                element=DOMstrings.incomeContainer;
                html='<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="material-icons">clear</i></button></div></div></div>';
            }
            else if(type==='exp'){
                element=DOMstrings.expensesContainer;
                html='<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="material-icons">clear</i></button></div></div></div>';
            }
            //repalce the placeholder text with some actuall data

            newHtml=html.replace('%id%',obj.id,);
            newHtml=newHtml.replace('%description%',obj.description);
            newHtml=newHtml.replace('%value%',formatNumber (obj.value,type));

            // Insert html into DOM
            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
        
        },  


        deleteListItem:function(selectorID){
            var el;
            el=document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },



        clearFields: function(){
            var fields,fieldsArr;
            fields=document.querySelectorAll(DOMstrings.inputDescription + ', ' +DOMstrings.inputValue);
            
            fieldsArr=Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(current,index,array){
                    current.value='';
            });

            fieldsArr[0].focus();
        },       

        displayBudget : function(obj){
            obj.budget>0?type='inc':type='exp';
            document.querySelector(DOMstrings.budgetLable).textContent=formatNumber(obj.budget,type);
            document.querySelector(DOMstrings.incomeLable).textContent=formatNumber(obj.totalInc,'inc');
            document.querySelector(DOMstrings.expensesLable).textContent=formatNumber(obj.totalExp,'exp');
            
            
            if(obj.percentage>0){
                document.querySelector(DOMstrings.percentageLable).textContent=obj.percentage + '%';
            }
            else{
                document.querySelector(DOMstrings.percentageLable).textContent='---';
            }
        },

        displayPercentages: function(percentages){
            var fields=document.querySelectorAll(DOMstrings.expensesPercLable);
            
            

            nodeListForEach(fields,function(current,index){
                if(percentages[index]>0){
                    current.textContent=percentages[index]+'%';
                }
                else{
                    current.textContent='---';
                }
                
            });
        },
        displayMonth:function(){

            var now,year,month,months;
            now=new Date();

            months=['January','February','March','April','May','June','July','August','September','October','November','December'];

            year=now.getFullYear();

            month=now.getMonth();
            document.querySelector(DOMstrings.dateLable).textContent=months[month] + ' ' +year;
            

        },

        changedType:function(){
           var fields=document.querySelectorAll(
               DOMstrings.inputType + ','+
               DOMstrings.inputDescription + ','+
               DOMstrings.inputValue
           );
           nodeListForEach(fields,function(cur){
            cur.classList.toggle('red-focus');
           });
           document.querySelector(DOMstrings.inputBtn).classList.toggle('red');

        },
    
        getDOMstrings : function(){
            return DOMstrings;
        }    
    };
})();

    // GLOBAL APP CONTROLLER
var controller=(function(budgetCtrl,UICtrl){
    var setupEventListeners = function(){

    var DOM=UICtrl.getDOMstrings();
    document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);

    document.addEventListener('keypress',function(event){
        if(event.keyCode===13 || event.which===13){
           ctrlAddItem();
        }
    });
    document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);

    document.querySelector(DOM.inputType).addEventListener('change',UICtrl.changedType);
    };

    var updateBudget =function(){
        // calculate the budget
            budgetCtrl.calculateBudget();

        // Return the budget
        var budget=budgetCtrl.getBudget();
        
        // display the budget on the user interface
        UICtrl.displayBudget(budget);
    };
    var updatePercentage=function(){
        //calculate the percentage
        budgetCtrl.calculatePercentages();
        // read percentage from the budget controller
        var percentage=budgetCtrl.getPercentage();
        // update the UI with the new percentage
        UICtrl.displayPercentages(percentage);
    };

    var ctrlAddItem =function(){
        var input,newItem;
        //  get the field input data
            input=UICtrl.getInput();
            if(input.description !=='' && !isNaN(input.value) && input.value>0){
            
                // add the item to budget controller
                newItem=budgetCtrl.addItem(input.type, input.description,input.value);


                // add the new item to UI then
                UICtrl.addListItem(newItem,input.type);
        
                // clearing the field
                UICtrl.clearFields();
                
                // calculate and update the budget
                updateBudget();
        
                // calculate and update percentage
                updatePercentage();

            }

    };

    var ctrlDeleteItem=function(event){
        var itemID,splitID,type,ID;    
        itemID=event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if(itemID){
            // inc-1
            splitID=itemID.split('-');
            type=splitID[0];
            ID=parseInt(splitID[1]);

            //delete the item from data structure 
            budgetCtrl.deleteItem(type,ID);

            // delete the item from UI
            UICtrl.deleteListItem(itemID);
            // update and show the budget
            updateBudget();

        }

    };
    return{
        init : function(){
            console.log('hey');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget:0,
                totalExp:0,
                totalInc:0,
                percentage:-1
            });

            setupEventListeners();
        }
    };

})(budgetController,UIController);

controller.init();