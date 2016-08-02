import Constants from '../constants';

class HomeController{
  constructor() {
    this.name = "HomeController";
    this.apiKey = Constants.WRAP_API_KEY;
  }
}

HomeController.$inject = [];
export default HomeController;
