import angular from 'angular';
import HomeController from './controllers/home_controller';
import Constants from './constants';

var moduleName = 'starter';

angular.module(moduleName, [])
.controller('HomeController', HomeController);


console.log(Constants);