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
}).factory('chartOptions', function ($rootScope, $http) {
	var options = {
		getDatasource: function(chartName) {
			switch(chartName) {
				//case 
			}
		},
		getOptions: function(chartName) {
			options.getDatasource(chartName);
			return {
				dataSource: dataSource,
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
		},
	};

	return options;
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
	};
}).directive('yoaChartBar', function() {
	return {
		restrict: 'ACE',
		transclude: true,
		controller: function($scope, $element, dataSummary, $attrs) {
			var chartDataSource = [
			    { name: "Alfred", standard: 29.956, declaration: 90.354, "package": 14.472},
			    { name: "Boris", standard: 25.607, declaration: 55.793, "package": 23.727},
			    { name: "Charlie", standard: 13.493, declaration: 48.983, "package": 5.802},
			    { name: "Daniel", standard: 9.575, declaration: 43.363, "package": 9.024},
			    { name: "Edward", standard: 9.575, declaration: 43.363, "package": 9.024},
			    { name: "Florence", standard: 9.575, declaration: 43.363, "package": 9.024},
			    { name: "Gordon", standard: 9.575, declaration: 43.363, "package": 9.024},
			    { name: "Hannah", standard: 9.575, declaration: 43.363, "package": 9.024},
			    { name: "Inta", standard: 9.575, declaration: 43.363, "package": 9.024},
			    { name: "Jack", standard: 9.575, declaration: 43.363, "package": 9.024},
			    { name: "Kevin", standard: 9.575, declaration: 43.363, "package": 9.024},
			    { name: "Langachlacrannachan", standard: 9.575, declaration: 43.363, "package": 9.024},
			];
			
			var options = {
				rotated: true,
			    dataSource: chartDataSource,
			    commonSeriesSettings: {
				argumentField: "name",
				type: "stackedBar"
			    },
			    series: [
				{ valueField: "standard", name: "Standard", stack: "male" },
				{ valueField: "declaration", name: "Declaration", stack: "male" },
				{ valueField: "package", name: "Package", stack: "male" },
			    ],
			    legend: {
				horizontalAlignment: "center",
				verticalAlignment: "bottom",
				//position: "inside",
				//border: { visible: true }
			    },
			    valueAxis: {
				title: {
				    text: "Worth (Naira)"
				}
			    },
			    title: "Agent Sales",
			    tooltip: {
				enabled: true
			    }
			};
			switch($attrs.name) {
				case "revenue": {
				} break;
			}
			$element.dxChart(options);
		}
	};
}).directive('yoaChartPanel', function() {
	return {
		restrict: 'ACE',
		transclude: true,
		scope: {chartName:"@"},
		controller: function($scope, $element, dataSummary, $attrs) {
			var chartDataSource = [
			    { name: "1", value: 30.354},
			    { name: "2", value: 25.607},
			    { name: "3", value: 20.493},
			];
			
			var options = {
			    dataSource: chartDataSource,
			    series: {
				argumentField: "name",
				valueField: "value",
				name: "Revenue",
				type: "bar",
				color: "#d00",
			    },
			    legend: {visible: false,},
			    commonAxisSettings: {visible: false,},
			    tooltip: {
				enabled: true
			    }
			};
			var chart = function (v) {
				console.log("chart panel attrrs", $attrs);
				switch($attrs.chartName) {
					case "policies-sold": {
						options.series.type = "area";
						options.series.color = "#0d0";
						options.dataSource = [];
						for(var i=0;i<50;i++) {options.dataSource.push({ name: i, value: (Math.random()*50)});}
					} break;
				}
				$element.dxChart(options);
			}
			$scope.$watch("$attrs.chartName", chart);
			chart();
		},
	};
}).directive('yoaDoublePanel', function() {
	return {
		restrict: 'ACE',
		scope: true,
		transclude: true,
		templateUrl: 'module/dashboard/partial/panel-double.html',
		controller: function($scope, $attrs) {
			$scope.title = $attrs.title;
			$scope.symbol = $attrs.symbolClass;
			$scope.bottom = $attrs.bottom;
			$scope.right = $attrs.right;
		},
	}
}).directive('yoaSinglePanel', function() {
	return {
		restrict: 'ACE',
		scope: {bottom:'@', chartName:'@'},
		transclude: true,
		templateUrl: 'module/dashboard/partial/panel-single.html',
		controller: function($scope, $attrs) {
			console.log("panel attrrs", $attrs.chartName);
			$scope.title = $attrs.title;
			$scope.middle = $attrs.middle;
			$scope.bottom = $attrs.bottom;
			$scope.chartName = $attrs.chartName;
		},
	}
});

// Panel types should have directives
