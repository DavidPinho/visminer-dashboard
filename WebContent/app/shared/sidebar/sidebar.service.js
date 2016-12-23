homeApp.service('sidebarService', function($rootScope){

	this.data = {currentPage : "tdanalyzer"};
	this.data.repository = null;
	this.data.repositories = [];
	this.data.tags = [];
	this.data.tagTypeSelect = 'Month';
	this.data.tagTypesSelect = ["Month", "Trimester", "Semester", "Year"];
	this.data.commits = [];
	this.data.committers = [];
	this.data.debts = ["CODE", "DESIGN"];

	this.setCurrentPage = function(page) {
		this.data.currentPage = page;
	}

	this.getCurrentPage = function() {
		return this.data.currentPage;
	}

	this.setRepository = function(repository) {
		this.data.repository = repository;
		$rootScope.$broadcast("selectRepository", repository);
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

	this.setTags = function(tags) {
		this.data.tags = tags;
	}

	this.addRepository = function(repository) {
		this.data.repositories.push(repository);
		$rootScope.repositories = this.data.repositories;
	}

	this.setCommits = function(commits) {
		this.data.commits = commits;
	}

	this.getCommits = function() {
		return this.data.commits;
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

	this.setTagTypeSelect = function(tagTypeSelect) {
		this.data.tagTypeSelect = tagTypeSelect;
	}

	this.getTagTypeSelect = function() {
		return this.data.tagTypeSelect;
	}

	this.getTagTypesSelect = function() {
		return this.data.tagTypesSelect;
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