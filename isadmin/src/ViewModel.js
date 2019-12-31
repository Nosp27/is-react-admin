import ReactDOM from "react-dom";
import ModelEntities from "./Model.js";
import {RegionView, CategoryView, FacilityView, EntityList} from "./EntityView.js";
import React from "react";
import Navigator from "./Navigation";
import Model from "./Model";

const _region = ModelEntities.Region;
const _category = ModelEntities.Category;
const _facility = ModelEntities.Facility;

export class ViewModel {
    constructor(nav, list, content) {
        this.nav = nav;
        this.list = list;
        this.content = content;
    }

    entityTypes = [
        {cls: _region, read: "/regions", write: "/region", view: RegionView},
        {cls: _category, read: "/categories", write: "/category", view: CategoryView},
        {cls: _facility, read: "/facilities", write: "/facility", view: FacilityView}
    ];


    caches = {};

    _connector = new ApiConnector();

    async init() {
        ReactDOM.render(<Navigator onClickHandler={this}/>, this.nav);
        for (let i = 0; i < this.entityTypes.length; i++)
            await this._connector.read(this.entityTypes[i].read).then(x => this.caches[this.entityTypes[i].cls] = x);
    }

    navigationSelect(cls) {
        ReactDOM.render(null, this.content);
        ReactDOM.render(EntityList(cls, this.caches[cls], this), this.list);
    }

    entityClickListener(cls, entity) {
        function getProperView(self) {
            switch (cls) {
                case ModelEntities.Region:
                    return <RegionView data={entity} submitHandler={self}/>;
                case ModelEntities.Category:
                    return <CategoryView data={entity} submitHandler={self}/>;
                case ModelEntities.Facility:
                    return (
                        <FacilityView
                            data={entity}
                            submitHandler={self}
                            options={{"categories": self.caches[Model.Category], "region": self.caches[Model.Region]}}
                        />
                    );
                default:
                    throw `Value Error: cls ${cls}`;
            }
        }

        ReactDOM.render(getProperView(this), this.content);
    }

    async submitForm(cls, values) {
        alert("res: " + JSON.stringify(values, null, 2));
        if (values["imageUrl"]) {
            const src = window.URL.createObjectURL(values["imageUrl"]);
            const readFile = file => {
                const reader = new FileReader();

                reader.onload = () => {
                    const binary = new Uint8Array(reader.result);
                    alert(binary);
                };
                reader.readAsArrayBuffer(file);
            };
            readFile(values["imageUrl"]);
        }
    }

    async entitySubmitListener(cls, entity, isNew) {
        if(entity["imageUrl"] !== undefined && entity["imageUrl"] != null) {
            const readFile = file => {
                const reader = new FileReader();

                reader.onload = () => {
                    const binary = new Uint8Array(reader.result);
                    alert(binary);
                };
                reader.readAsArrayBuffer(file);
            };
            readFile(entity["imageUrl"]);

        }
        const imageSuffix = "/image";
        const suffix = this.entityTypes.find(x => x.cls === cls).write;
        if (isNew)
            await this._connector.create(suffix, entity);
        else
            await this._connector.update(suffix, entity);
    }

    async submitImage(imageId, imageData) {
        this._connector.post()
    }
}

class ApiConnector {
    ip = "http://localhost:8080";

    async requestServer(suffix, method, entity) {
        let reqProps = {
            method: method,
            headers: {
                'Access-Control-Allow-Origin': '',
                'Content-Type': 'application/json'
            }
        };
        if (method !== "GET" && entity !== undefined)
            reqProps["body"] = JSON.stringify(entity);
        return (await fetch(this.ip + suffix, reqProps)).json();
    }


    async create(suffix, entity) {
        console.log("saving " + JSON.stringify(entity));
        return await this.requestServer(suffix, "POST", entity);
    }


    async read(suffix) {
        return await this.requestServer(suffix, "GET", null);
    }


    async update(suffix, entity) {
        return await this.requestServer(suffix, "PUT", entity);
    }


    async deleteRequest(suffix, id) {
        await this.requestServer(suffix + "/" + id, "DELETE");
    }
}

