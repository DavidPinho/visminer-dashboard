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
	$scope.filtered.references = sidebarService.getReferences();
	$scope.filtered.debts = sidebarService.getDebts();

	thisCtrl.loadEvolutionInformation = function (repository) {
		if (repository) {
			thisCtrl.referencesLoad(repository._id);
		}
	}

	// Load all references (versions)
	thisCtrl.referencesLoad = function (repositoryId) {
		let requestUrl = 'http://localhost:4040/api/references/enhanced/repository/' + repositoryId;
		$http.get(requestUrl)
			.success(function (referencesWithFiles) {
				$scope.references = referencesWithFiles;
				thisCtrl.loadSlider();
			});
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
		$scope.referencesNames = [];
		$scope.sliderReferences = [];
		$scope.chartCodeDebtSeries = [];
		$scope.chartDesignDebtSeries = [];
		$scope.chartDefectDebtSeries = [];
		$scope.chartTestDebtSeries = [];
		$scope.chartRequirementDebtSeries = [];
		var j = 0;
		for (var i = $scope.slider.minValue - 1; i < $scope.slider.maxValue; i++) {
			var referenceName = $scope.references[i].name;
			$scope.referencesNames.push(referenceName);

			var files = $scope.references[i].files;
			var totalCodeDebt = thisCtrl.getTotalOfCodeDebts(files);
			var totalDesignDebt = thisCtrl.getTotalOfDesignDebts(files);
			var totalDefectDebt = thisCtrl.getTotalOfDefectDebts(files);
			var totalTestDebt = thisCtrl.getTotalOfTestDebts(files);
			var totalRequirementDebt = thisCtrl.getTotalOfRequirementDebts(files);
			$scope.chartCodeDebtSeries.push(totalCodeDebt);
			$scope.chartDesignDebtSeries.push(totalDesignDebt);
			$scope.chartDefectDebtSeries.push(totalDefectDebt);
			$scope.chartTestDebtSeries.push(totalTestDebt);
			$scope.chartRequirementDebtSeries.push(totalRequirementDebt);

			$scope.references[i].totalDebts = totalCodeDebt + totalDesignDebt + totalDefectDebt + totalRequirementDebt + totalTestDebt;
			thisCtrl.getTotalOfCodeSmells($scope.references[i], files);
			$scope.sliderReferences.push($scope.references[i]);
		}
		thisCtrl.loadColumnChart();
	}

	thisCtrl.getTotalOfCodeSmells = function (reference, files) {
		var total = 0;
		for (var i = 0; i < files.length; i++) {
			total = total + Object.keys(files[i].indicators).length;
		}
		reference.totalSmells = total;
	}

	thisCtrl.getTotalOfDesignDebts = function (files) {
		var total = 0;
		for (var i = 0; i < files.length; i++) {
			if (files[i].debts.indexOf("DESIGN_DEBT") != -1) {
				total++;
			}
		}
		return total;
	}

	thisCtrl.getTotalOfCodeDebts = function (files) {
		var total = 0;
		for (var i = 0; i < files.length; i++) {
			if (files[i].debts.indexOf("CODE_DEBT") != -1) {
				total++;
			}
		}
		return total;
	}

	thisCtrl.getTotalOfDefectDebts = function (files) {
		var total = 0;
		for (var i = 0; i < files.length; i++) {
			if (files[i].debts.indexOf("DEFECT_DEBT") != -1) {
				total++;
			}
		}
		return total;
	}

	thisCtrl.getTotalOfTestDebts = function (files) {
		var total = 0;
		for (var i = 0; i < files.length; i++) {
			if (files[i].debts.indexOf("TEST_DEBT") != -1) {
				total++;
			}
		}
		return total;
	}

	thisCtrl.getTotalOfRequirementDebts = function (files) {
		var total = 0;
		for (var i = 0; i < files.length; i++) {
			if (files[i].debts.indexOf("REQUIREMENT_DEBT") != -1) {
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