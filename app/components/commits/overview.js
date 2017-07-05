function OverviewController() {

}

angular.module('homeApp').component('commitsOverview', {
  templateUrl: 'app/components/commits/overview.html',
  controller: OverviewController,
  bindings: {
    commits: '='
  }
});
