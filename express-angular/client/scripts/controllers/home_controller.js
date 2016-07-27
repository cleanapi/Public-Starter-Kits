import Constants from '../constants';

class HomeController{
  constructor() {
    this.name = "HomeController";
    this.apiKey = Constants.API_KEY;
  }
}

HomeController.$inject = [];
export default HomeController;