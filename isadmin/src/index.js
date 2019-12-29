import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Navigator from './Navigation';
import * as serviceWorker from './serviceWorker';
import {RegionView, FacilityView} from "./EntityView";
import {ViewModel} from "./ViewModel";

const navigationElement = document.getElementById("navigation");
const listingElement = document.getElementById("list");
const contentElement = document.getElementById("content");

async function run() {
    const viewModel = new ViewModel(navigationElement, listingElement, contentElement);
    await viewModel.init();
}

run();
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
