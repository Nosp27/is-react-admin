export default class ApiConnector {
    ip = "http://89.169.32.230:8080";

    async requestServer(suffix, method, entity) {
        let reqProps = {
            method: method,
            credentials: 'include',
            redirect: 'follow',
            headers: {
                'Content-Type': 'application/json',
            }
        };
        if (method !== "GET" && entity !== undefined)
            reqProps["body"] = JSON.stringify(entity);
        const url = this.ip + suffix;
        try {
            return (await fetch(url, reqProps)).json();
        } catch (e) {
            throw Error("Error while connecting to " + url + ": " + e);
        }
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