var amortization = function(N, i){
var a = (Math.pow((1+i),(N+1)) - Math.pow((1+i),(N)))/(Math.pow((1+i),(N)) - 1);

var payments = function(x,n){
x.push(x[x.length -1]*(1+i) + a);
return x;
};

var debts = function(x, n){
x.push(x[x.length -1]*(1+i));
return x;
};

return {
N, N,
i, i,
a: a,
p: (function(){
var payment = [0, a];
for(j = 2; j<N+1; j++)
payment = payments(payment, j);
return payment;
})(N, a),
d: (function(){
var debt = [1], j;
for(j = 1; j<N+1; j++)
debt = debts(debt, j);
return debt;
})(N, a)
};
};


var N = 60;
var r = 0.3;
a = amortization(N, Math.pow(1+r,1/12) - 1);

//var N = 5;
//var r = 0.3;
//a = amortization(N, r);


dashboard('#dashboard', a);
