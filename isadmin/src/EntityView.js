import React from 'react';
import ReactDOM from 'react-dom';
import Select from 'react-select';
import 'react-select-css';
import './App.css';
import {Formik, Field} from "formik";
import Entities from "./Model.js"
import Model from "./Model";

const style = {marginBottom: 25};

export function RegionView(props) {
    return (
        <EntityView
            data={props.data}
            id_field="regionId"
            _id={props.data.regionId}
            submitHandler={props.submitHandler}
            title="Region"
            fields={[
                new EntityField("Region Name", "regionName", TextField),
                new EntityField("Region Description", "regionDescription", AreaField),
                new EntityField("Area", "area", DoubleField),
                new EntityField("Population", "population", IntegerField),
                new EntityField("Unemployed", "unemployed", IntegerField),
                new EntityField("Total labour force", "totalLabourForce", IntegerField),
                new EntityField("GDP (Bln. $)", "gdp", DoubleField),
                new EntityField("Average Property Price ($/sq.meter)", "avgPropertyPrice", DoubleField),
                new EntityField("Average Family Income ($/month)", "avgFamilyIncome", DoubleField),
                new EntityField("Image", "imageId", FileDragAndDrop)
            ]}
            options={props.options}
            cls={Model.Region}
        />
    )
}

export function CategoryView(props) {
    return (
        <EntityView
            submitHandler={props.submitHandler}
            data={props.data}
            id_field="catId"
            _id={props.data.catId}
            title="Category"
            fields={[
                new EntityField("Category Name", "catName", TextField),
                new EntityField("Category Description", "catDescription", AreaField),
                new EntityField("Image", "imageId", FileDragAndDrop)
            ]}
            options={props.options}
            cls={Model.Category}
        />
    )
}

export function FacilityView(props) {
    return (
        <EntityView
            submitHandler={props.submitHandler}
            data={props.data}
            id_field="_id"
            _id={props.data._id}
            title="Facility"
            fields={[
                new EntityField("Facility Name", "name", TextField),
                new EntityField("Facility Description", "description", AreaField),
                new EntityField("Employees", "employees", IntegerField),
                new EntityField("Investment Size", "investmentSize", DoubleField),
                new EntityField("Profitability", "profitability", DoubleField),
                new EntityField("Latitude", "lat", DoubleField),
                new EntityField("Longitude", "lng", DoubleField),
                new EntityField("Region", "region", SingleSelect),
                new EntityField("Categories", "categories", MultipleSelect),
                new EntityField("Image", "imageId", FileDragAndDrop)
            ]}
            options={props.options}
            cls={Model.Facility}
            mappers={
                {
                    "categories": x => {
                        if (x == null) return null;
                        return {value: x, label: x.catName}
                    },
                    "region": x => {
                        if (x == null) return null;
                        return {value: x, label: x.regionName}
                    }
                }
            }
        />
    )
}

function EntityView(props) {
    const entityInitialValues = {};
    props.fields.forEach(fld => {
        entityInitialValues[fld.id] = props.data[fld.id];
    });
    return (
        <>
            <Formik
                enableReinitialize="true"
                initialValues={entityInitialValues}
                onSubmit={(values, actions) => {
                    setTimeout(() => {
                        values[props.id_field] = props._id;
                        props.submitHandler.submitForm(props.cls, values);
                        actions.setSubmitting(false);
                    }, 200);
                }}
            >
                {formprops => (
                    <form onSubmit={formprops.handleSubmit}>
                        <h1 style={{marginBottom: 25}}>{props.title} #{props._id}</h1>
                        {props.fields.map(x => x.type({
                            fieldId: x.id,
                            fieldName: x.name,
                            formproperties: formprops,
                            misc: props
                        }))}
                        {formprops.errors.name && <div id="feedback">{formprops.errors.name}</div>}
                        <SubmitButton/>
                    </form>
                )}
            </Formik>
        </>
    );
}

function IntegerField(props) {
    return getTextFieldWithVlidator(props, "Integer")
}

function DoubleField(props) {
    return getTextFieldWithVlidator(props, "Double")
}

function getTextFieldWithVlidator(props, validationType) {
    let validatorPredicate;
    const isNumber = value => !isNaN(value);
    const isInteger = value => isNumber(value) && !value.includes(".");
    if (validationType === "Integer")
        validatorPredicate = isInteger;
    else if (validationType === "Double")
        validatorPredicate = isNumber;
    else throw Error("Not supported validation type: " + validationType);
    return TextField(Object.assign({}, props, {"validatorPredicate": validatorPredicate}));
}

function TextField(props) {
    function withValidation(event, handler) {
        if (props.validatorPredicate !== undefined) {
            if (props.validatorPredicate(event.target.value))
                return handler(event);
            else return;
        }
        return handler(event);
    }

    const onInputEvent = event => withValidation(event, props.formproperties.handleChange);

    return (
        <>
            <label htmlFor={props.fieldId} style={{display: "block"}}>
                {props.fieldName}
            </label>
            < input
                style={style}
                className="form-control"
                placeholder={"Enter " + props.fieldName}
                type="text"
                onKeyDown={onInputEvent}
                onChange={onInputEvent}
                onBlur={props.formproperties.handleBlur}
                value={props.formproperties.values[props.fieldId]}
                name={props.fieldId}
                id={props.fieldId}
            />
        </>
    )
}

function SingleSelect(props) {
    props["isMulti"] = false;
    return ConfiguredSelect(props);
}

function MultipleSelect(props) {
    props["isMulti"] = true;
    return ConfiguredSelect(props);
}

function ConfiguredSelect(props) {
    const fieldId = props.fieldId;
    return (
        <>
            <label htmlFor={fieldId} style={{display: "block"}}>
                {props.fieldName}
            </label>
            <SelectComponent
                isMulti={props.isMulti}
                style={style}
                onChange={props.formproperties.setFieldValue}
                onBlur={props.formproperties.handleBlur}
                options={props.misc.options[fieldId]}
                value={props.formproperties.values[fieldId]}
                name={fieldId}
                id={fieldId}
                mapper={props.misc.mappers[fieldId]}
            />
        </>
    )
}

function AreaField(props) {
    return (
        <>
            <label htmlFor={props.fieldId} style={{display: "block"}}>
                {props.fieldName}
            </label>
            <textarea
                style={style}
                className="form-control"
                placeholder={"Enter " + props.fieldName}
                onChange={props.formproperties.handleChange}
                onBlur={props.formproperties.handleBlur}
                value={props.formproperties.values[props.fieldId]}
                name={props.fieldId}
                id={props.fieldId}
            />
        </>
    )
}

function FileDragAndDrop(props) {
    const fieldId = props.fieldId;

    const onChange = (e) => {
        const input = e.target;
        const file = input.files[0];
        const src = file === undefined ? props.misc.options[fieldId] : window.URL.createObjectURL(file);
        const image = document.getElementById("displayImage");
        image.src = src;
        image.hidden = src == null || src === "";
        props.formproperties.setFieldValue(fieldId, file);
    };
    return (
        <>
            <div key={props.misc.data._id}>
                <label htmlFor={fieldId} style={{display: "block"}}>
                    {props.fieldName}
                </label>
                <input
                    style={style}
                    id={fieldId}
                    name={fieldId}
                    type="file"
                    accept={".png, .jpg"}
                    onChange={onChange}
                />
                <img
                    id={"displayImage"}
                    alt=""
                    src={props.misc.options[fieldId]}
                    height={100}
                    width={100}
                    hidden={props.misc.options[fieldId] == null}
                />
            </div>
        </>
    )
}

function SubmitButton() {
    return <button className="btn btn-primary" type="submit">Submit</button>
}

class SelectComponent extends React.Component {
    getMapper(mapper) {
        if (this.props.isMulti)
            return x => x.map(mapper);
        else
            return mapper;
    }

    handleChange = value => {
        this.props.onChange(this.props.name, value == null ? value : this.getMapper(x => x.value)(value));
    };

    handleBlur = () => {
        this.props.onBlur(this.props.name, true);
    };

    render() {
        let value = this.props.value;
        if (value != null)
            value = this.getMapper(this.props.mapper)(value);
        return (
            <div style={{margin: '1rem 0'}}>
                <Select
                    id={this.props.name}
                    options={this.props.options.map(this.props.mapper)}
                    isMulti={this.props.isMulti}
                    onChange={this.handleChange}
                    onBlur={this.handleBlur}
                    value={value}
                />
                {!!this.props.error &&
                this.props.touched && (
                    <div style={{color: 'red', marginTop: '.5rem'}}>{this.props.error}</div>
                )}
            </div>
        );
    }
}

class EntityField {
    constructor(name, id, type) {
        this.name = name;
        this.id = id;
        this.type = type;
    }
}

export function EntityList(cls, entities, clickHandler) {
    let mapping = null;
    switch (cls) {
        case Entities.Region:
            mapping = x => `${x.regionId}: ${x.regionName}`;
            break;
        case Entities.Category:
            mapping = x => `${x.catId}: ${x.catName}`;
            break;
        case Entities.Facility:
            mapping = x => `${x._id}: ${x.name}`;
            break;
        default:
            throw new Error(`Value Error in cls. Got ${cls}`);
    }
    return <EntityListComponent entityCls={cls} entityList={entities} entityToRepr={mapping}
                                clickHandler={clickHandler}/>;
}

export function ErrorNavBar() {

}

function EntityListComponent(props) {
    const textClass = {
        color: "black"
    };
    return (
        <>
            <ul className="list-group">
                {
                    props.entityList.map(
                        el =>
                            <li
                                className="list-group-item list-group-item-action"
                            >
                                <a
                                    onClick={_ => props.clickHandler.entityClickListener(props.entityCls, el)}
                                    href="#"
                                >
                                    {props.entityToRepr(el)}
                                </a>
                                <a className="btn dropdown-toggle"
                                   data-toggle="dropdown">
                                    <span className={"caret"}></span>
                                </a>
                                <ul className="dropdown-menu" role="menu">
                                    <li onClick={_ => {
                                        const answer = window.confirm("Delete " + el.name + "?");
                                        if (answer)
                                            props.clickHandler.entityDeleteListener(props.entityCls, el)
                                    }}
                                    >
                                        <a className={textClass} href="#">Delete</a>
                                    </li>
                                </ul>
                            </li>
                    )
                }
                <li className="list-group-item list-group-item-action">
                    <a
                        className={textClass}
                        href="#"
                        onClick={_ => props.clickHandler.addEntity(props.entityCls)}
                    >
                        New
                    </a>
                </li>
            </ul>
        </>
    )
}

