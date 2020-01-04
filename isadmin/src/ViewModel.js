import ReactDOM from "react-dom";
import ModelEntities from "./Model.js";
import {RegionView, CategoryView, FacilityView, EntityList} from "./EntityView.js";
import React from "react";
import Navigator from "./Navigation";
import Model from "./Model";
import ApiConnector from "./ApiConnector";

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
        {cls: _region, read: "/regions", write: "/region", id_field: "regionId", view: RegionView},
        {cls: _category, read: "/categories", write: "/category", id_field: "catId", view: CategoryView},
        {cls: _facility, read: "/facilities", write: "/facility", id_field: "_id", view: FacilityView}
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

    entityClickListener(cls, entity) { //TODO: change image when clicked on another  elemnt
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
                    throw new Error(`Value Error: cls ${cls}`);
            }
        }

        ReactDOM.render(getProperView(this), this.content);
    }

    async submitForm(cls, values) {
        this.entitySubmitListener(cls, values, false);
    }

    async entitySubmitListener(cls, entity, isNew) {
        const typeData = this.entityTypes.find(x => x.cls === cls);
        if (entity["imageId"] !== undefined && entity["imageId"] != null) {
            const readFile = file => {
                const reader = new FileReader();
                reader.readAsArrayBuffer(file);
                return new Uint8Array(reader.result);
            };
            const imageBinary = readFile(entity["imageId"]);
            const id_field_name = typeData.id_field;
            const prototypeEntity = this.caches[cls].find(x => x[id_field_name]===entity[id_field_name]);
            await this.submitImageAndGetId(cls, prototypeEntity[id_field_name], imageBinary)
                .then(x => entity["imageId"] = x)
                .then(_ => console.log("Uploaded image"));
        }

        const suffix = typeData.write;
        if (isNew)
            await this._connector.create(suffix, entity);
        else
            await this._connector.update(suffix, entity);
    }

    async submitImageAndGetId(entityCls, entityId, imageBinary) {
        const imageSuffix = `/image/add/for_entity/${entityCls}/${entityId}`;
        return this._connector.create(imageSuffix, imageBinary);
    }
}

