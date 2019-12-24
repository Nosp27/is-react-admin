import React from 'react';
import ReactDOM from 'react-dom';
import {Formik, Form, useField} from "formik";
import './App.css';

export const getForm = (
    <>
        <h1>Choose Entity to administrate</h1>
        <ul>
            {createButton('Category')}
            {createButton('Region')}
            {createButton('Facility')}
        </ul>
    </>
);

function createButton(entityName) {
    return <li><a href='#' onClick={clicked({entityName})}>{entityName}</a></li>
}

function clicked(entity) {

}