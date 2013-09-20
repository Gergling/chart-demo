var dashboardController = function($scope, dataSummary) {
	// We will want multiple dashboards in the future. They will extend this one.

	// For now, this dashboard controls the (default) page content.
	
	// Widgets:
	// - Number of accounts (number)
	// - Number of accounts by type (pie)
	// - Number of accounts by producer type (pie)
	// - Number of contacts (number)
	// - Number of contacts by gender (pie)
	
	console.log("Data Summary", dataSummary);
	
	$scope.accountQuantities = dataSummary.fetchAccountSummaries();
	$scope.accountQuantities = dataSummary.getAccountQuantities();
};

angular.module("module.dashboard", [
	"factory.dashboard",
]).config(function($routeProvider) {
	// Stuff
	console.log("config");
}).run(function($rootScope, $location) {
	// More stuff
	console.log("run");
})
.controller("dashboardController", dashboardController);

