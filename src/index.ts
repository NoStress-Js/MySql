import { Connection, QueryOptions } from 'mysql';
import { IColDef, ISqlTypes } from '../../Core/lib/interfaces';
import { promisify } from 'util';
import { Database } from '../../Core/lib/database';

export class Mysql extends Database {
  public types: { [k: string]: ISqlTypes } = {
    varchar: 'string',
    text: 'string',
    int: 'int',
    tinyint: 'int',
    smallint: 'int',
    mediumint: 'int',
    bit: 'int',
    float: 'decimal',
    double: 'decimal',
  };
  public numbersSize: {
    [k: string]: { signed: { min: number; max: number }; unsigned: { min: number; max: number } };
  } = {
    bit: {
      signed: {
        min: 0,
        max: 1,
      },
      unsigned: {
        min: 0,
        max: 1,
      },
    },
  };
  private query: (arg1: string | QueryOptions) => Promise<unknown>;

  constructor(connection: Connection) {
    super();
    this.query = promisify(connection.query).bind(connection);
  }

  public async GetDbDefinition(table: string): Promise<IColDef[]> {
    try {
      const res = await this.query(
        `SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE, COLUMN_TYPE, EXTRA, COLUMN_DEFAULT FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${table}'`,
      );
      const cols: IColDef[] = [];
      if (Array.isArray(res)) {
        for (const col of res) {
          cols.push({
            name: col.COLUMN_NAME,
            type: col.DATA_TYPE,
            maxChar: col.CHARACTER_MAXIMUM_LENGTH,
            nullable: col.IS_NULLABLE,
            colType: col.COLUMN_TYPE,
            autoIncrement: col.EXTRA == 'auto_increment',
            default: col.COLUMN_DEFAULT,
          });
        }
        return cols;
      }
    } catch (err) {
      console.log(err);
    }
    return [];
  }
}
