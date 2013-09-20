var app = angular.module('app',[
	//"module.dashboard",
]).factory('dataSummary', function ($rootScope, $http) {
	// Ultimately a url will be generated relevant to the resource location, for now we're using fake data all from one source.
	var url = "module/dashboard/summary-mockery.json";
	var getURL = function() {return url;}
	
	var summary = {
		data: {
			accounts: {
				quantity: {
					total:0, 
					max: {type:0},
					type:{}
				}
			}
		},
		charts: {
			accounts: {
				quantity: {
					pie: [],
				},
			},
		},
		getAccountQuantities: function() {
			return summary.data.accounts.quantity;
		},
		fetchAccountSummaries: function() {
			$http.get(getURL("account")).then(function (response) {
				summary.data.accounts.list = response.accounts;
				angular.forEach(response.data.accounts, function(account) {
					if (!summary.data.accounts.quantity.type[account.type]) {summary.data.accounts.quantity.type[account.type] = {name: account.type, total:0};}
					summary.data.accounts.quantity.total++;
					summary.data.accounts.quantity.type[account.type].total++;
					summary.data.accounts.quantity.max.type = Math.max(summary.data.accounts.quantity.max.type, summary.data.accounts.quantity.type[account.type].total);
				});
				$.each(summary.data.accounts.quantity.type, function(category, account) {
					account.max = account.total/summary.data.accounts.quantity.max.type;
					account.colour = account.max>0.5?'#27d':'#fd2';

					summary.charts.accounts.quantity.pie.push({category: category, value: account.total});
				});
				$rootScope.$broadcast("accountsFetched", summary);
			});
		},
	};

	summary.fetchAccountSummaries();

	return summary;
}).controller('dashboardController', function($scope, dataSummary) {
	// We will want multiple dashboards in the future. They will extend this one.

	// For now, this dashboard controls the (default) page content.
	
	// Widgets:
	// - Number of accounts (number)
	// - Number of accounts by type (pie)
	// - Number of accounts by producer type (pie)
	// - Number of contacts (number)
	// - Number of contacts by gender (pie)

	$scope.accountQuantities = dataSummary.data.accounts.quantity;
	$scope.dataSummary = dataSummary;

	
}).directive('yoaChartPie', function() {
	return {
		restrict: 'ACE',
		transclude: true,
		controller: function($scope, $element, dataSummary, $attrs) {
			var options = {
				dataSource: [],
				series: {
					argumentField: 'category',
					valueField: 'value',
				},
				tooltip: {
					enabled: true,
					percentPrecision: 2,
					customizeText: function (value) {
						return value.percentText;
					}
				},
				title: {
					text: 'Accounts by Type'
				},
				legend: {
					horizontalAlignment: 'right',
					verticalAlignment: 'top'
				}
			};
			$scope.$on("accountsFetched", function(event, data){
				var ds = [];
				$.each(data.data.accounts.quantity.type, function(type, account) {
					ds.push({category: type, value: account.total});
				});
				console.log(options);
				//if (!options) {var options = {};}
				options.dataSource = ds;

				$element.dxPieChart(options);
			});
		},
	}
}).directive('yoaChartBar', function() {
	return {
		restrict: 'ACE',
		transclude: true,
		controller: function($scope, $element, dataSummary, $attrs) {
			var chartDataSource = [
			    { state: "USA", maleyoung: 29.956, malemiddle: 90.354, maleolder: 14.472, femaleyoung: 28.597, femalemiddle: 91.827, femaleolder: 20.362 },
			    { state: "Brazil", maleyoung: 25.607, malemiddle: 55.793, maleolder: 3.727, femaleyoung: 24.67, femalemiddle: 57.598, femaleolder: 5.462 },
			    { state: "Russia", maleyoung: 13.493, malemiddle: 48.983, maleolder: 5.802, femaleyoung: 12.971, femalemiddle: 52.14, femaleolder: 12.61 },
			    { state: "Japan", maleyoung: 9.575, malemiddle: 43.363, maleolder: 9.024, femaleyoung: 9.105, femalemiddle: 42.98, femaleolder: 12.501 },
			    { state: "Mexico", maleyoung: 17.306, malemiddle: 30.223, maleolder: 1.927, femaleyoung: 16.632, femalemiddle: 31.868, femaleolder: 2.391 },
			    { state: "Germany", maleyoung: 6.679, malemiddle: 28.638, maleolder: 5.133, femaleyoung: 6.333, femalemiddle: 27.693, femaleolder: 8.318 },
			    { state: "United Kindom", maleyoung: 5.816, malemiddle: 19.622, maleolder: 3.864, femaleyoung: 5.519, femalemiddle: 19.228, femaleolder: 5.459 }
			];
			var options = {
			    dataSource: chartDataSource,
			    commonSeriesSettings: {
				argumentField: 'year'
			    },
			    commonSeriesSettings: {
				argumentField: "state",
				type: "stackedBar"
			    },
			    series: [
				{ valueField: "maleyoung", name: "Male: 0-14", stack: "male" },
				{ valueField: "malemiddle", name: "Male: 15-64", stack: "male" },
				{ valueField: "maleolder", name: "Male: 65 and older", stack: "male" },
				{ valueField: "femaleyoung", name: "Female: 0-14", stack: "female" },
				{ valueField: "femalemiddle", name: "Female: 15-64", stack: "female" },
				{ valueField: "femaleolder", name: "Female: 65 and older", stack: "female" }
			    ],
			    legend: {
				horizontalAlignment: "right",
				position: "inside",
				border: { visible: true }
			    },
			    valueAxis: {
				title: {
				    text: "Populations, millions"
				}
			    },
			    title: "Population: Age Structure",
			    tooltip: {
				enabled: true
			    }
			};
			$element.dxChart(options);
		}
	};
});
