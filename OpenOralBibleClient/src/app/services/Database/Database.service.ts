import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { SQLitePorter } from '@ionic-native/sqlite-porter/ngx';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private database: string = 'data.db';
  private path: string = 'default';
  constructor(
    private sqlite: SQLite,
    private sqlitePorter: SQLitePorter
  ) { }

  async getConnection() {
    return this.sqlite.create({
      name: 'data.db',
      location: 'default'
    });
  }

  public async getValue(key: string) {
    var result: string;
    await this.getConnection()
      .then((db: SQLiteObject) => {
        db.executeSql(`select key, value from app_config where key='${key}';`)
          .then((data) => result = data[0])
          .catch(e => console.log(e));
      })
      .catch(e => console.log(e));

    return result;
  }

  public async Initialize() {
    this.getConnection()
      .then((db: SQLiteObject) => {
        this.checkIsInitialized(db);
      })
  }

  private checkIsInitialized(db: SQLiteObject) {
    db
      .executeSql(`
        select key, value
        from app_config
        where key = 'initialized';
      `)
      .then((data) => {
        if (data[1] != 'true') {
          console.log("initializaing db")
          db.close();
          this.setupMetadata();
        }
      });
  }

  private setupMetadata() {
    let sql = `
      CREATE TABLE app_config (
        key text,
        value text
      );
      
      INSERT INTO app_config (key, value) VALUES ('initialized', 'true');
      
      INSERT INTO app_config (key, value) VALUES ('app-name', 'Yetfa Bible');
      `;
    
    this.getConnection().then((db: SQLiteObject) => {
      this.sqlitePorter.importSqlToDb(db, sql)
      .then(() => console.log('Imported'))
      .catch(e => console.error(e));
    })

  }
}
