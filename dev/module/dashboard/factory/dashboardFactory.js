angular.module("factory.dashboard", [
])
.factory("dataSummary", function ($rootScope, $http) {
	// Ultimately a url will be generated relevant to the resource location, for now we're using fake data all from one source.
	var url = "module/dashboard/summary-mockery.json";
	var getURL = function() {return url;}
	
	var summary = {
		data: {
			accounts: {quantity: {total:0}}
		},
		getAccountQuantities: function() {
			return summary.data.accounts.quantity;
		},
		fetchAccountSummaries: function() {
			console.log("Making request");
			$http.get(getURL("account")).then(function (response) {
				console.log(response);
				summary.data.accounts.list = response.accounts;
				angular.forEach(response.accounts, function(account) {
					if (!summary.data.accounts.quantity[account.type]) {summary.data.accounts.quantity[account.type] = {total:0};}
					summary.data.accounts.quantity.total++;
					summary.data.accounts.quantity[account.type].total++;
				});
			});
		},
	};

	dataSummary.fetchAccountSummaries();
	console.log("wtf");

	return summary;
});