homeApp = angular.module('homeApp');

homeApp.controller('TDEvolutionCtrl', function ($scope, $http, $q, sidebarService) {
	var thisCtrl = this;

	$scope.currentPage = sidebarService.getCurrentPage();
	$scope.tags = [];
	$scope.tagsNames = [];
	$scope.hashMapTags = {};

	$scope.sliderTags = [];

	$scope.chartCodeDebtSeries = [];
	$scope.chartDesignDebtSeries = [];

	$scope.filtered.repository = sidebarService.getRepository();
	$scope.filtered.tags = sidebarService.getTags();
	$scope.filtered.debts = sidebarService.getDebts();

	thisCtrl.loadEvolutionInformation = function (repository) {
		if (repository) {
			thisCtrl.tagsLoad(repository._id);
		}
	}

	// Load all tags (versions)
	thisCtrl.tagsLoad = function (repositoryId) {
		$http.get('../../data/rm_references.json')
			.success(function (data) {
				console.log('found', data.length, 'tags');
				$scope.tags = data.sort(function (tag1, tag2) {
					return tag1.commits.length - tag2.commits.length;
				});
				for (var i in $scope.tags) {
					var tag = data[i];
					if (tag.repository === repositoryId) {
						$scope.hashMapTags[tag.name] = {
							tag: tag,
							types: [],
							totalSmells: 0,
							totalDebts: 0
						};
					}
				}
				thisCtrl.loadSlider();
			});
	}

	thisCtrl.loadSlider = function () {
		$scope.slider = {
			minValue: 1,
			maxValue: $scope.tags.length,
			options: {
				ceil: $scope.tags.length,
				floor: 1,
				showTicksValues: true,
				draggableRange: true,
				onEnd: function () {
					thisCtrl.loadSliderTags();
				},
				translate: function (value) {
					var name = $scope.tags[value - 1].name;
					if (name.length > 7)
						name = name.substring(0, 7);
					return name;
				}
			}
		};
		thisCtrl.loadSliderTags();
	}

	thisCtrl.loadSliderTags = function () {
		$http.get('../../data/rm_technical_code_debt.json')
			.success(function (data) {
				console.log('found', data.length, 'types');
				for (var i in data) {
					var type = data[i];
					//TODO if (tag.repository === repositoryId)
					$scope.hashMapTags[type.reference_name].types.push(type);
				}

				$scope.tagsNames = [];
				$scope.sliderTags = [];
				$scope.chartCodeDebtSeries = [];
				$scope.chartDesignDebtSeries = [];
				var j = 0;
				for (var i = $scope.slider.minValue - 1; i < $scope.slider.maxValue; i++) {
					var tagName = $scope.tags[i].name;
					$scope.tagsNames.push(tagName);

					var totalCodeDebt = thisCtrl.getTotalOfCodeDebts($scope.hashMapTags[tagName].types);
					var totalDesignDebt = thisCtrl.getTotalOfDesignDebts($scope.hashMapTags[tagName].types)
					$scope.chartCodeDebtSeries.push(totalCodeDebt);
					$scope.chartDesignDebtSeries.push(totalDesignDebt);

					$scope.hashMapTags[tagName].totalDebts = totalCodeDebt + totalDesignDebt;
					thisCtrl.getTotalOfCodeSmells($scope.hashMapTags[tagName], $scope.hashMapTags[tagName].types);
					$scope.sliderTags.push($scope.hashMapTags[tagName]);
				}
				thisCtrl.loadColumnChart();

			});
	}

	/*
	thisCtrl.getListOfTypesByListOfTags = function (list) {
		var ids = [];
		for (var i = $scope.slider.minValue - 1; i < $scope.slider.maxValue; i++) {
			ids.push($scope.tags[i]._id);
		}
		return $http.get('TypeServlet', { params: { "action": "getListOfTypesByListOfTags", "ids": JSON.stringify(ids) } })
			.success(function (data) {
				console.log("success getListOfTypesByListOfTags");
				for (var j = 0; j < data.length; j++)
					list.push(data[j]);
			});
	}*/

	thisCtrl.getTotalOfCodeSmells = function (tag, types) {
		var total = 0;
		for (var i = 0; i < types.length; i++) {
			total = total + Object.keys(types[i].indicators).length;
		}
		tag.totalSmells = total;
	}

	thisCtrl.getTotalOfDesignDebts = function (types) {
		var total = 0;
		for (var i = 0; i < types.length; i++) {
			if (types[i].debts.indexOf("DESIGN_DEBT") != -1) {
				total++;
			}
		}
		return total;
	}

	thisCtrl.getTotalOfCodeDebts = function (types) {
		var total = 0;
		for (var i = 0; i < types.length; i++) {
			if (types[i].debts.indexOf("CODE_DEBT") != -1) {
				total++;
			}
		}
		return total;
	}

	thisCtrl.loadColumnChart = function () {
		var seriesArray = [];
		if ($.inArray('CODE', $scope.filtered.debts) > -1) {
			seriesArray.push({
				color: '#1B93A7',
				name: 'Code Debt',
				data: $scope.chartCodeDebtSeries
			});
		}
		if ($.inArray('DESIGN', $scope.filtered.debts) > -1) {
			seriesArray.push({
				color: '#91A28B',
				name: 'Design Debt',
				data: $scope.chartDesignDebtSeries
			});
		}
		$scope.chartConfig = {
			title: {
				text: 'Technical Debt X Versions'
			},
			xAxis: {
				categories: $scope.tagsNames
			},
			yAxis: {
				min: 0,
				allowDecimals: false,
				title: {
					text: 'Total of classes having Technical Debt'
				},
				stackLabels: {
					enabled: true,
					style: {
						fontWeight: 'bold',
						color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
					}
				}
			},
			options: {
				chart: {
					type: 'column'
				},
				legend: {
					align: 'right',
					x: -70,
					verticalAlign: 'top',
					y: 20,
					floating: true,
					backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || 'white',
					borderColor: '#CCC',
					borderWidth: 1,
					shadow: false
				},
				tooltip: {
					formatter: function () {
						return '<b>' + this.x + '</b><br/>' +
							this.series.name + ': ' + this.y + '<br/>' +
							'Total: ' + this.point.stackTotal;
					}
				},
				plotOptions: {
					column: {
						stacking: 'normal',
						dataLabels: {
							enabled: true,
							color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white',
							style: {
								textShadow: '0 0 3px black, 0 0 3px black'
							}
						}
					}
				}
			},
			series: seriesArray,
			size: {
				height: 350
			}
		};
	}

	thisCtrl.loadColumnChart();
	thisCtrl.loadEvolutionInformation($scope.filtered.repository);

});