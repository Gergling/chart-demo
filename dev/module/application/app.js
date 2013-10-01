var app = angular.module('app',[
	//"module.dashboard",
]).config(['$routeProvider', function($routeProvider) {
	//var nav = Navigation.getInstance();
	var templateUrl = 'module/dashboard/partial/container.html';
	$routeProvider.when('/', {templateUrl: templateUrl});
	$routeProvider.when('/:module', {templateUrl: templateUrl});
	$routeProvider.when('/:module/:timeFrame', {templateUrl: templateUrl});
	$routeProvider.otherwise({templateUrl: 'module/application/partial/404.html'});
}]).controller('dashboardController', function($scope, dataSummary, navigation) {
	$scope.accountQuantities = dataSummary.data.accounts.quantity;
	$scope.dataSummary = dataSummary;

	$scope.nav = navigation;

	$scope.$on('$routeChangeSuccess', function (scope, current, previous) {
		navigation.setCurrent("primary", current.params.module);
		navigation.setCurrent("secondary", current.params.timeFrame);
	});
}).factory('navigation', function ($rootScope) {
	var navigation = {
		primary: {
			list: {
				"overview": {label: "Overview", templateUrl: 'module/dashboard/partial/overview.html'},
				"opportunities": {label: "Opportunities"},
				"accounts": {label: "Accounts"},
				"contacts": {label: "Contacts"},
				"policies": {label: "Policies"},
				"risks": {label: "Risks"},
				"claims": {label: "Claims"},
				"insurers": {label: "Insurers"},
				"payments": {label: "Payments"},
			},
			order: [
				"overview",
				"opportunities",
				"accounts",
				"contacts",
				"policies",
				"risks",
				"claims",
				"insurers",
				"payments",
			],
			unspecified: "overview",
		},
		secondary: {
			list: {
				weekly: {label:"Weekly"},
				monthly: {label:"Monthly"},
				quarterly: {label:"Quarterly"},
				yearly: {label:"Yearly"},
			},
			order: [
				"weekly",
				"monthly",
				"quarterly",
				"yearly",
			],
			unspecified: "weekly",
		},
	};

	// Populate navigation objects.
	angular.forEach(navigation, function(tier) {
		tier.index = {order:[]};
		tier.current = {};

		angular.forEach(tier.order, function(name) {
			tier.list[name].name = name;
			tier.index.order.push(tier.list[name]);
		});
	});

	// Primary navigation operations.
	angular.forEach(navigation.primary.list, function(item) {
		if (!item.templateUrl) {
			// If this is not specified, populate with module reporting partial.
			item.templateUrl = 'module/dashboard/partial/module-reports.html';
		}
	});

	navigation.setCurrent = function(tier, name) {
		var navTier = navigation[tier];
		if (name) {
			navTier.current = navTier.list[name];
		} else {
			navTier.current = navTier.list[navTier.unspecified];
		}
	};

	return navigation;
}).factory('dataSummary', function ($rootScope, $http) {
	// Ultimately a url will be generated relevant to the resource location, for now we're using fake data all from one source.
	var url = "module/dashboard/summary-mockery.json";
	var getURL = function() {return url;}
	
	var summary = {
		data: {
			accounts: {
				quantity: {
					total:0, 
					max: {type:0},
					type:{},
					age:{},
					producerType:{},
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
		loaded: false,
		getAccountQuantities: function() {
			return summary.data.accounts.quantity;
		},
		fetchAccountSummaries: function() {
			$http.get(getURL("account")).then(function (response) {
				summary.data.accounts.list = response.accounts;
				angular.forEach(response.data.accounts, function(account) {
					if (!summary.data.accounts.quantity.type[account.type]) {summary.data.accounts.quantity.type[account.type] = {name: account.type, total: 0, producerType: {}};}
					summary.data.accounts.quantity.total++;
					summary.data.accounts.quantity.type[account.type].total++;
					summary.data.accounts.quantity.max.type = Math.max(summary.data.accounts.quantity.max.type, summary.data.accounts.quantity.type[account.type].total);

					if (!summary.data.accounts.quantity.type[account.type].producerType[account.producerType]) {summary.data.accounts.quantity.type[account.type].producerType[account.producerType] = {total:0}}
					summary.data.accounts.quantity.type[account.type].producerType[account.producerType].total++;

					if (!summary.data.accounts.quantity.age[account.age]) {summary.data.accounts.quantity.age[account.age] = {name: account.age, total:0};}
					summary.data.accounts.quantity.age[account.age].total++;

					if (!summary.data.accounts.quantity.producerType[account.producerType]) {summary.data.accounts.quantity.producerType[account.producerType] = {name: account.producerType, total:0}}
					summary.data.accounts.quantity.producerType[account.producerType].total++;
				});
				$.each(summary.data.accounts.quantity.type, function(category, account) {
					var accountType = category;
					account.max = account.total/summary.data.accounts.quantity.max.type;
					$.each(account.producerType, function(producerType, obj) {
						obj.value = obj.total/account.total;
						obj.colour = obj.value>0.5?'#27d':'#fd2';
					});

					summary.charts.accounts.quantity.pie.push({category: category, value: account.total});
				});

				summary.loaded = true;

				$rootScope.$broadcast("accountsFetched", summary);
			});
		},
	};

	summary.fetchAccountSummaries();

	return summary;
}).factory('chartOptions', function ($rootScope, $http, dataSummary) {
	var ret = {
		list: {
			accountsByType: {
				options: {
					//dataSource: dataSource,
					series: {
						argumentField: 'category',
						valueField: 'value',
					},
					tooltip: {
						enabled: true,
						percentPrecision: 2,
						customizeText: function (value) {return value.valueText+" of type "+value.argumentText;}
					},
					title: {text: 'Accounts by Type'},
					legend: {
						horizontalAlignment: 'right',
						verticalAlignment: 'top'
					}
				},
				getDataSource: function() {
					var ds = [];
					$.each(dataSummary.data.accounts.quantity.type, function(type, account) {
						ds.push({category: type, value: account.total});
					});
					return ds;
				},
				fnc: "dxPieChart",
			},
			accountsByExecutive: {
				options: {
					rotated: true,
					commonSeriesSettings: {
						argumentField: "name",
						type: "stackedBar"
					},
					series: [
						{ valueField: "corporate", name: "Corporate"},
						{ valueField: "individual", name: "Individual"},
						{ valueField: "reinsurance", name: "Reinsurance"},
						{ valueField: "scheme", name: "Scheme"},
					],
					legend: {
						horizontalAlignment: "center",
						verticalAlignment: "bottom",
					},
					valueAxis: {title: {text: "Quantity"}},
					title: "# Accounts by Executive",
					tooltip: {enabled: true}
				},
				getDataSource: function() {
					var ds = [
						{ name: "Alfred"},
						{ name: "Boris"},
						{ name: "Charlie"},
						{ name: "Daniel"},
						{ name: "Edward"},
						{ name: "Florence"},
						{ name: "Gordon"},
						{ name: "Hannah"},
						{ name: "Inta"},
						{ name: "Jack"},
					];
					angular.forEach(ds, function(ex) {
						var total = 0;
						angular.forEach(ret.list.accountsByExecutive.options.series, function(accountType) {
							var value = Math.floor(Math.random()*30);
							ex[accountType.valueField] = value;
							total += value;
						});
						ex.total = total;
					});
					return ds;
				},
				fnc: "dxChart",
			},
			revenuePanel: {
				options: {
					series: {
						argumentField: "name",
						valueField: "value",
						type: "bar",
						color: "#d00",
					},
					legend: {visible: false,},
					commonAxisSettings: {visible: false,},
					tooltip: {enabled: true}
				},
				getDataSource: function() {
					return [
						{ name: "1", value: 30.354},
						{ name: "2", value: 25.607},
						{ name: "3", value: 20.493},
					];
				},
				fnc: "dxChart",
			},
			policiesSold: {
				options: {
					series: {
						argumentField: "name",
						valueField: "value",
						type: "area",
						color: "#0d0",
					},
					legend: {visible: false,},
					commonAxisSettings: {visible: false,},
					tooltip: {enabled: true}
				},
				getDataSource: function() {
					var ds = [];
					for(var i=0;i<50;i++) {ds.push({ name: i, value: (Math.random()*25)+25});}
					return ds;
				},
				fnc: "dxChart",
			},
			accountsByAge: {
				options: {
					series: {
						argumentField: 'category',
						valueField: 'value',
					},
					tooltip: {
						enabled: true,
						//percentPrecision: 2,
						customizeText: function (value) {return value.valueText+" of age "+value.argumentText;}
					},
					title: {text: 'Accounts by Age'},
					legend: {
						horizontalAlignment: 'right',
						verticalAlignment: 'top'
					}
				},
				getDataSource: function() {
					var ds = [];
					$.each(dataSummary.data.accounts.quantity.age, function(age, account) {
						ds.push({category: age, value: account.total});
					});
					return ds;
				},
				fnc: "dxPieChart",
			},
		},
		getDatasource: function(chartName) {
			return ret.list[chartName].getDataSource(chartName);
		},
		getOptions: function(chartName) {
			var dataSource = ret.getDatasource(chartName);
			var options = ret.list[chartName].options;
			options.dataSource = dataSource;
			return options;
		},
		getConfig: function(chartName) {
			if (!ret.list[chartName]) {throw "Factory chartOptions: No chart named '"+chartName+"'.";}
			return ret.list[chartName];
		},
		appendChart: function(element, chartName) {
			var config = ret.getConfig(chartName);
			var fnc = config.fnc;
			var options = ret.getOptions(chartName);
			element[fnc](options);
		},
	};

	return ret;
}).directive('yoaChart', function() {
	return {
		restrict: 'ACE',
		transclude: true,
		scope: {chartName:"@"},
		controller: function($scope, $element, dataSummary, $attrs, chartOptions) {
			$scope.$watch("$attrs.chartName", function () {
				var appendChart = function() {
					chartOptions.appendChart($element, $attrs.chartName);
				};
				if (dataSummary.loaded) {appendChart();}
				$scope.$on("accountsFetched", function(event, data){
					// The only way to make this work was to ensure the chart name had been updated before the appropriate chart was appended.
					// This behaviour would best be a staple function for all chart displaying directives.
					appendChart();
				});
			});
		},
	};
}).directive('yoaChartPanel', function() {
	return {
		restrict: 'ACE',
		transclude: true,
		scope: {chartName:"@"},
		controller: function($scope, $element, dataSummary, $attrs, chartOptions) {
			$scope.$watch("$attrs.chartName", function () {
				// The only way to make this work was to ensure the chart name had been updated before the appropriate chart was appended.
				// This behaviour would best be a staple function for all chart displaying directives.
				chartOptions.appendChart($element, $attrs.chartName);
			});
		},
	};
}).directive('yoaDoublePanel', function() {
	return {
		restrict: 'ACE',
		scope: {title:'@'},
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
		scope: {bottom:'@', chartName:'@', title:'@'},
		transclude: true,
		templateUrl: 'module/dashboard/partial/panel-single.html',
		controller: function($scope, $attrs) {
			$scope.title = $attrs.title;
			$scope.middle = $attrs.middle;
			$scope.bottom = $attrs.bottom;
			$scope.chartName = $attrs.chartName;
		},
	}
});

// Panel types should have directives
