import React from 'react';
import Select from 'react-select';
import 'react-select-css';
import './App.css';
import {Formik} from "formik";
import Entities from "./Model.js"
import Model from "./Model";

const style = {marginBottom: 25};

export function RegionView(props) {
    return (
        <EntityView
            data={props.data}
            _id={props.data.regionId}
            submitHandler={props.submitHandler}
            title="Region"
            fields={[
                new EntityField("Region Name", "regionName", TextField),
                new EntityField("Region Description", "regionDescription", AreaField)
            ]}
            cls={Model.Region}
        />
    )
}

export function CategoryView(props) {
    return (
        <EntityView
            submitHandler={props.submitHandler}
            data={props.data}
            _id={props.data.catId}
            title="Category"
            fields={[
                new EntityField("Category Name", "catName", TextField),
                new EntityField("Category Description", "catDescription", AreaField)
            ]}
            cls={Model.Category}
        />
    )
}

export function FacilityView(props) {
    return (
        <EntityView
            submitHandler={props.submitHandler}
            data={props.data}
            _id={props.data._id}
            title="Facility"
            fields={[
                new EntityField("Facility Name", "name", TextField),
                new EntityField("Facility Description", "description", AreaField),
                new EntityField("Latitude", "lat", TextField),
                new EntityField("Longitude", "lng", TextField),
                new EntityField("Categories", "categories", MultipleSelect)
            ]}
            msOptions={props.msOptions}
            cls={Model.Facility}
            mappers={
                {
                    "categories": x => {if (x == null) return null; return {value: x, label: x.catName}}
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
                        props.submitHandler.submitForm(props.cls, values);
                        actions.setSubmitting(false);
                    }, 200);
                }}
            >
                {formprops => (
                    <form onSubmit={formprops.handleSubmit}>
                        <h1 style={{marginBottom: 25}}>{props.title} #{props._id}</h1>
                        {props.fields.map(x => x.type({fieldId: x.id, fieldName: x.name, formproperties: formprops, misc: props}))}
                        {formprops.errors.name && <div id="feedback">{formprops.errors.name}</div>}
                        <SubmitButton/>
                    </form>
                )}
            </Formik>
        </>
    );
}

function TextField(props) {
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
                onChange={props.formproperties.handleChange}
                onBlur={props.formproperties.handleBlur}
                value={props.formproperties.values[props.fieldId]}
                name={props.fieldId}
                id={props.fieldId}
            />
        </>
    )
}

function MultipleSelect(props) {
    return (
        <>
            <label htmlFor={props.fieldId} style={{display: "block"}}>
                {props.fieldName}
            </label>
            <MultipleSelectComponent
                style={style}
                onChange={props.formproperties.setFieldValue}
                onBlur={props.formproperties.handleBlur}
                options={props.misc.msOptions}
                value={props.formproperties.values[props.fieldId]}
                name={props.fieldId}
                id={props.fieldId}
                mapper={props.misc.mappers[props.fieldId]}
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

function SubmitButton() {
    return <button className="btn btn-primary" type="submit">Submit</button>
}

class MultipleSelectComponent extends React.Component {
    handleChange = value => {
        this.props.onChange(this.props.name, value == null ? value : value.map(x=>x.value));
    };

    handleBlur = () => {
        this.props.onBlur(this.props.name, true);
    };

    render() {
        return (
            <div style={{margin: '1rem 0'}}>
                <Select
                    id={this.props.name}
                    options={this.props.options.map(this.props.mapper)}
                    isMulti={true}
                    onChange={this.handleChange}
                    onBlur={this.handleBlur}
                    value={this.props.value?.map(this.props.mapper)}
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
            throw `Value Error in cls. Got ${cls}`;
    }
    return <EntityListComponent entityCls={cls} entityList={entities} entityToRepr={mapping} clickHandler={clickHandler}/>;
}

function EntityListComponent(props) {

    return (
        <>
            <ul>
                {
                    props.entityList.map(
                        el =>
                            <li>
                                <a href="#"
                                   onClick={x => props.clickHandler.entityClickListener(props.entityCls, el)}>{props.entityToRepr(el)}</a>
                            </li>
                    )
                }
            </ul>
        </>
    )
}

