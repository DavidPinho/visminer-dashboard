function OverviewController() {

}

angular.module('homeApp').component('commitsOverview', {
  templateUrl: 'components/commits/overview.html',
  controller: OverviewController,
  bindings: {
    commits: '='
  }
});
