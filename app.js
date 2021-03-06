 //BUDGET CONTROLLER
 var budgetController = (function(){

     var Expense = function(id, description, value) {
       this.id = id;
       this.description = description;
       this.value = value;
       this.percentage = -1;
     };
     Expense.prototype.calcPercentage = function(totalInc, totalExp){
       if (totalInc > 0 && totalInc > totalExp  ) {
          this.percentage = Math.round((this.value/totalInc) * 100);
       } else {
         this.percentage = -1;
       }
     };

     Expense.prototype.getPercentage = function(){
       return this.percentage;
     };

     var Income = function(id, description, value) {
       this.id = id;
       this.description = description;
       this.value = value;
     };


     var calculateTotal = function(type){
          var sum=0;
          data.allItems[type].forEach(function(cur_ele){
              sum += cur_ele.value;
          });
          data.totals[type] = sum;
     };

     var data = {
          allItems: {
            exp:[],
            inc:[]
                    },
          totals: {
            exp:0,
            inc:0
          },
          budget: 0,
          percentage: -1
        };

        return {
            addItem: function(type,des,val){
              var newItem, ID;
              //[1 2 3 4 5 ] next ID should be 6
              //the above isn't good enough becaus we might delete some records
              //[1 2 4 5 7 8] next ID should be 9
              // ID = lastID + 1

              //create new ID
              if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;//find the last id and add 1
              } else {
                ID = 0;
              }

              //Create new item based on 'Inc' or 'Exp'
              if (type ==='exp') {
                 newItem = new Expense(ID,des,val);
              } else if (type === 'inc') {
                 newItem = new Income(ID,des,val);
              }

              // Push values to the data structure
              data.allItems[type].push(newItem);

              // Return the new element
              return newItem;
            },
            deleteItem: function(type,id){
              var ids, index;
            //creating a new array with current id's in the array, using map method which returns a new array
            ids = data.allItems[type].map(function(current){
              return current.id;
            });

            // find the original index of the newly arranged array 'ids'
            index = ids.indexOf(id);

            //delete the item from the data structure if index != -1 using splice method
            if (index !== -1) {
                data.allItems[type].splice(index,1);
            }

            },

            calculateBudget: function(){

                  //1.Calculate total income and expenses
                  calculateTotal('exp');
                  calculateTotal('inc');

                  //2.Calculate the budget : income - expenses
                  data.budget = data.totals.inc - data.totals.exp;

                  //3.calculate the percentage of income that we spent
                  if (data.totals.inc > 0 && data.totals.inc > data.totals.exp ) {
                      data.percentage = Math.round((data.totals.exp / data.totals.inc)*100);
                  } else{
                    data.percentage = -1;
                  }

            },

            calclulatePercentages : function(){
              /*
                a =10
                b =20
                c =30
                income = 100
                a = 10/100 = 10%
                b = 20/100 = 20%
                c = 30/100 = 30%
              */

              data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc, data.totals.exp);
              })
            },

            getPercentages: function(){
                var allPerc = data.allItems.exp.map(function(cur){
                  return cur.getPercentage();
                });
                return allPerc;
            },

            getBudget: function(){

                return {
                    budget: data.budget,
                    totalInc: data.totals.inc,
                    totalExp: data.totals.exp,
                    percentage: data.percentage
                }
            },

            testing: function() {
              console.log(data);
            }


        };
















   /*var x = 23;
        //to demonstrate benifits of closures

        var add = function(a) {
              return x + a;
        }

        //this function will return the following function
        return {
          //this will be the function whihc we can call outside of this iife function as this has been nade public
          publicTest: function(b){
            return add(b);
          }
        }*/
 })();

 //UI CONTROLLER
 var UIController = (function(){

      var DOMStrings = {
              inputType: '.add__type',
              inputDescription: '.add__description',
              inputValue: '.add__value',
              inputBtn: '.add__btn',
              incomeContainer: '.income__list',
              expensesContainer: '.expenses__list',
              budgetLabel: '.budget__value',
              incomeLabel: '.budget__income--value',
              expensesLabel: '.budget__expenses--value',
              percentageLabel: '.budget__expenses--percentage',
              container: '.container',
              expensesPercLabel:'.item__percentage',
              dateLabel:'.budget__title--month'
      };

      var formatNumber = function(value, type){
        var valueSplit, int, dec, sign;
          /*
            specify type '+' or '-'
            seperate number with ',' before 3 digits
            decimals after interger with 2 digits after the decimal

            2310.4567 => + 2,310.46
            2000 => + 2,000.00
          */
          value = Math.abs(value);
          value = value.toFixed(2);

            valueSplit = value.split('.');
            int = valueSplit[0];
            if (int.length > 3) {
              int = int.substr(0,int.length-3)+','+int.substr(int.length -3, 3);
            }

            dec = valueSplit[1];

            return (type === 'exp' ? '- ': '+ ' )+ int +'.'+ dec;
      };

      var nodeListForEach = function(list, callback){
          for(i=0;i<list.length;i++){
            callback(list[i],i);
          }
      };
      return {
          getInput: function(){
              return {
                type: document.querySelector(DOMStrings.inputType).value,
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
              };

        },

        addListItem: function(obj, type){
              var html, newHtml ,element;

            // Create HTML string with placeholder text
            if (type === 'inc') {
              element = DOMStrings.incomeContainer;

              html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
              element = DOMStrings.expensesContainer;

              html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }

            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%',obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%',formatNumber(obj.value, type));

            // Insert the HTML into the DOM

            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem: function(selectorID){

            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);

        },

        clearFields: function(){
          var fields, fieldsArr;

          // querySelectorAll method retuns LISTS instead of an Array
          fields = document.querySelectorAll(DOMStrings.inputDescription + ','+ DOMStrings.inputValue);
          // convert this list to an Array
          fieldsArr = Array.prototype.slice.call(fields);
          //fieldsArr is an array now

          //clearing fields using forEach loop
          fieldsArr.forEach(function(cur,ind,arr){
            cur.value = "";
          });
          fieldsArr[0].focus();
        },

        displayBudget: function(obj){
          var type;
            obj.budget > 0 ? type ='inc' : type = "exp";
            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget,type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc,"inc");
            document.querySelector(DOMStrings.expensesLabel).textContent =formatNumber(obj.totalExp, "exp");
            if (obj.percentage >0) {
              document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
              document.querySelector(DOMStrings.percentageLabel).textContent = "--";
            }
        },
        getDOMStrings: function(){
          return DOMStrings;
        },

        displayPercentages: function(percentages){

          var fields = document.querySelectorAll(DOMStrings.expensesPercLabel);


          nodeListForEach(fields,function(current, index){

              if (percentages[index]>0) {
                  current.textContent = percentages[index] + '%';
              }else {
                current.textContent = '---';
              }
          });
        },

        displayMonth: function(){
          var now, year, month, months;
          now = new Date();
          //var christmas = new Date(2016,12, 25 );
          months = ['January', 'February', 'March','April','May','June','July','August','September','October','November','December'];
          month = now.getMonth();
          year = now.getFullYear();
          document.querySelector(DOMStrings.dateLabel).textContent = months[month] +' '+year;
        },

        changedType: function(){

          var fields = document.querySelectorAll(
            DOMStrings.inputType + ','
            + DOMStrings.inputDescription + ','
            + DOMStrings.inputValue
          );

          nodeListForEach(fields,function(cur){
            cur.classList.toggle('red-focus');
          });

          document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
        }
        };

 })();

 //GLOBAL APP CONTROLLER
 var controller = (function(budgetCtrl,UIctrl){

      var setupEventListeners = function(){
      var DOM = UIctrl.getDOMStrings();

          document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);



          document.addEventListener('keypress',function(event){
              if (event.keyCode === 13 || event.which === 13) {
                  ctrlAddItem();
                  }
          });

          document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

          document.querySelector(DOM.inputType).addEventListener('change', UIctrl.changedType);
  };



   var updateBudget = function(){

        //1.Calculate the budget
        budgetCtrl.calculateBudget();
        //2. Return the budget
        var budget = budgetCtrl.getBudget();
        //3. Display the budget on the UI
        UIctrl.displayBudget(budget);
   };
   var updatePercentages = function() {

      //1. Calculate Percentages
      budgetCtrl.calclulatePercentages();
      //2. Read percentages from the budget controller
      var percentages = budgetCtrl.getPercentages();
      //3.Update the UI with new percentages
      UIctrl.displayPercentages(percentages);
   };
   var ctrlAddItem = function() {

       var input, newItem;
       //1. Get the field input data
       input = UIctrl.getInput();

       if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
       //2.Add the item to the budgetController
       newItem = budgetCtrl.addItem(input.type , input.description, input.value);
       //3. Add the item to the UI
       UIctrl.addListItem(newItem, input.type);
       //4. Clear fields
       UIctrl.clearFields();
       //5. Calculate and update the budget
       updateBudget();
       //6. Calculate and update percentages
       updatePercentages();
     }

   };

   var ctrlDeleteItem = function(event){
        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

          //1. Delete the item from the data structure
          budgetCtrl.deleteItem(type, ID);
          //2. Delete the item from the UI
          UIctrl.deleteListItem(itemID);
          //3. Update and show the new budget
          updateBudget();
          //4. Calculate and update percentages
          updatePercentages();
        }
   };


   return {
      init: function(){
        console.log('Application has started');
        UIctrl.displayMonth();
        UIctrl.displayBudget({
          budget: 0,
          totalInc:0 ,
          totalExp: 0,
          percentage:-1
      });
        setupEventListeners();
      }
   };


   /*var z = budgetController.publicTest(5);
   console.log(z);*/
 })(budgetController,UIController);

 controller.init();


















//
