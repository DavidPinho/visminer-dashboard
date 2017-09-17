homeApp = angular.module('homeApp');

homeApp.controller('TDEvolutionCtrl', function ($scope, $http, $q, sidebarService) {
	var thisCtrl = this;

	$scope.currentPage = sidebarService.getCurrentPage();
	$scope.references = [];
	$scope.referencesNames = [];
	$scope.sliderReferences = [];

	$scope.chartCodeDebtSeries = [];
	$scope.chartDesignDebtSeries = [];
	$scope.chartDefectDebtSeries = [];
	$scope.chartTestDebtSeries = [];
	$scope.chartRequirementDebtSeries = [];

	$scope.filtered.repository = sidebarService.getRepository();

	// TODO: Filter the info displayed on the chat based on the filtered references and debts.
	$scope.filtered.references = sidebarService.getReferences();
	$scope.filtered.debts = sidebarService.getDebts();

	thisCtrl.loadEvolutionInformation = function (repository) {
		if (repository) {
		  let requestUrl = 'http://localhost:4040/api/references/enhanced/repository/' + repository._id;
		  $http.get(requestUrl)
			.success(function (referencesWithFiles) {
				$scope.references = referencesWithFiles;
				thisCtrl.loadSlider();
			});
		}
	}

	thisCtrl.loadSlider = function () {
		$scope.slider = {
			minValue: 1,
			maxValue: $scope.references.length,
			options: {
				ceil: $scope.references.length,
				floor: 1,
				showTicksValues: true,
				draggableRange: true,
				onEnd: function () {
					thisCtrl.loadSliderReferences();
				},
				translate: function (value) {
					var name = $scope.references[value - 1].name;
					if (name.length > 7)
						name = name.substring(0, 7);
					return name;
				}
			}
		};
		thisCtrl.loadSliderReferences();
	}

	thisCtrl.loadSliderReferences = function () {
		cleanArrays();
		var j = 0;
		for (var i = $scope.slider.minValue - 1; i < $scope.slider.maxValue; i++) {
			$scope.referencesNames.push($scope.references[i].name);

			var files = $scope.references[i].files;
			var totalCodeDebt = thisCtrl.getTotalOfDebtsByType(files, "CODE_DEBT");
			var totalDesignDebt = thisCtrl.getTotalOfDebtsByType(files, "DESIGN_DEBT");
			var totalDefectDebt = thisCtrl.getTotalOfDebtsByType(files, "DEFECT_DEBT");
			var totalTestDebt = thisCtrl.getTotalOfDebtsByType(files, "TEST_DEBT");
			var totalRequirementDebt = thisCtrl.getTotalOfDebtsByType(files, "REQUIREMENT_DEBT");

			$scope.chartCodeDebtSeries.push(totalCodeDebt);
			$scope.chartDesignDebtSeries.push(totalDesignDebt);
			$scope.chartDefectDebtSeries.push(totalDefectDebt);
			$scope.chartTestDebtSeries.push(totalTestDebt);
			$scope.chartRequirementDebtSeries.push(totalRequirementDebt);

			$scope.references[i].totalDebts = totalCodeDebt + totalDesignDebt + totalDefectDebt + totalRequirementDebt + totalTestDebt;
			thisCtrl.getTotalOfCodeSmells(files, $scope.references[i]);
			$scope.sliderReferences.push($scope.references[i]);
		}
		thisCtrl.loadColumnChart();
	}

	function cleanArrays() {
		$scope.referencesNames = [];
		$scope.sliderReferences = [];
		$scope.chartCodeDebtSeries = [];
		$scope.chartDesignDebtSeries = [];
		$scope.chartDefectDebtSeries = [];
		$scope.chartTestDebtSeries = [];
		$scope.chartRequirementDebtSeries = [];
	}

	thisCtrl.getTotalOfCodeSmells = function (files, reference) {
		var total = 0;
		for (var i = 0; i < files.length; i++) {
			total = total + Object.keys(files[i].indicators).length;
		}
		reference.totalSmells = total;
	}

	thisCtrl.getTotalOfDebtsByType = function (files, debt) {
		var total = 0;
		for (var i = 0; i < files.length; i++) {
			if (files[i].debts.indexOf(debt) != -1) {
				total++;
			}
		}
		return total;
	}

	thisCtrl.loadColumnChart = function () {
		var seriesArray = [];
		seriesArray.push({
			color: '#dd3939',
			name: 'Defect Debt',
			data: $scope.chartDefectDebtSeries
		});
		seriesArray.push({
			color: '#f39c12',
			name: 'Test Debt',
			data: $scope.chartTestDebtSeries
		});
		seriesArray.push({
			color: '#8a6d3b',
			name: 'Requirement Debt',
			data: $scope.chartRequirementDebtSeries
		});
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
				categories: $scope.referencesNames
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
					align: 'center',
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