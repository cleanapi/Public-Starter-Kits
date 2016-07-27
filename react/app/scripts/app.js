import React from 'react';
import Home from './components/home';
import Constants from './constants';

window.React = React;
const mountNode = document.getElementById('app');

React.render(<Home/>, mountNode);

console.log(Constants);