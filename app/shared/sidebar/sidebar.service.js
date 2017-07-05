homeApp.service('sidebarService', function($rootScope){

	this.data = {currentPage : "tdevolution"};
	this.data.repository = null;
	this.data.tags = [];
	this.data.committers = [];
	this.data.debts = ["CODE", "DESIGN"];


	this.setCurrentPage = function(page) {
		this.data.currentPage = page;
	}

	this.getCurrentPage = function() {
		return this.data.currentPage;
	}

	this.setRepository = function(repository) {
		$rootScope.$broadcast("selectRepository", repository);
		this.data.repository = repository;
	}

	this.getRepository = function() {
		return this.data.repository;
	}

	this.addTag = function(tag) {
		this.data.tags.push(tag);
	}

	this.removeTag = function(index) {
		this.data.tags.splice(index,1);
	}

	this.getTags = function() {
		return this.data.tags;
	}

	this.addCommitter = function(committer) {
		this.data.committers.push(committer);
	}

	this.removeCommitter = function(index) {
		this.data.committers.splice(index,1);
	}

	this.getCommitters = function() {
		return this.data.committers;
	}

	this.addDebt = function(debt) {
		this.data.debts.push(debt);
	}

	this.removeDebt = function(index) {
		this.data.debts.splice(index,1);
	}

	this.getDebts = function() {
		return this.data.debts;
	}
});