import { Query } from '../query/query';

export class QueryProject {
    project: string;
    projectId: string;
    files: Array<Query>;

    constructor() {
        this.files = [];
    }
}
