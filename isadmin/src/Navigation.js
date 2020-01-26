import React from 'react';
import Model from "./Model";
import './App.css';

export default function Navigator(props) {
    return props.fine === undefined || props.fine !== "false" ?
        (
            <>
                <NavBar listItems={["Category", "Region", "Facility"]} onClickHandler={props.onClickHandler}/>
            </>
        ) : (<><ErrorNavbar/></>);
}

function NavBar(props) {
    return (
        <>
            <nav className="navbar navbar-expand-sm bg-dark navbar-dark">
                <ul className="navbar-nav">
                    {props.listItems.map(x => createButton(x, false, props.onClickHandler))}
                </ul>
            </nav>
        </>
    )
}

function ErrorNavbar() {
    return (
        <>
            <nav className="navbar navbar-expand-sm bg-dark navbar-dark">
                <ul className="navbar-nav">
                    <p
                        className="nav-link"
                    >
                        Inactive
                    </p>
                </ul>
            </nav>
        </>
    )
}

function createButton(entityName, isActive, onClickHandler) {
    const classname = "nav-item" + isActive ? " active" : "";
    return (
        <li className={classname}>
            <a
                className="nav-link"
                href="#"
                onClick={_ => {
                    onClickHandler.navigationSelect(Model[entityName])
                }}
            >
                {entityName}
            </a>
        </li>
    )
}

