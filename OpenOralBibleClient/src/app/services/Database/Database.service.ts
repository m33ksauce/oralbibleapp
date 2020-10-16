import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';

@Injectable({
    providedIn: 'root',
})

export class DatabaseService {
    private database: string = 'data.db';
    private path: string = 'default';
    constructor(private sqlite: SQLite) {}

    async getConnection() {
        return this.sqlite.create({
            name: 'data.db',
            location: 'default'
        });
    }

    async getValue(key: string) {
        this.getConnection()
            .then((db: SQLiteObject) => {
                db.executeSql('select * from something;')
                .then((data) => console.log(data[0]))
                .catch(e => console.log(e));
            })
            .catch(e => console.log(e));
    }
}