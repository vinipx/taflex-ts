import pg from 'pg';
import mysql, { Pool as MysqlPool } from 'mysql2/promise';

/**
 * Manages database connections and query orchestration for PostgreSQL and MySQL.
 */
class DatabaseManager {
  private connections: {
    postgres: pg.Pool | null;
    mysql: MysqlPool | null;
  } = {
    postgres: null,
    mysql: null,
  };

  /**
   * Connects to a PostgreSQL database.
   */
  async connectPostgres(config: pg.PoolConfig): Promise<void> {
    const { Pool } = pg;
    this.connections.postgres = new Pool(config);
    await this.connections.postgres.connect();
  }

  /**
   * Connects to a MySQL database.
   */
  async connectMysql(config: mysql.PoolOptions): Promise<void> {
    this.connections.mysql = mysql.createPool(config);
  }

  /**
   * Executes a parameterized SQL query on the specified database.
   */
  async query(type: 'postgres' | 'mysql', query: string, params: any[] = []): Promise<any[]> {
    if (type === 'postgres') {
      if (!this.connections.postgres) throw new Error('Postgres connection not initialized');
      const res = await this.connections.postgres.query(query, params);
      return res.rows;
    } else if (type === 'mysql') {
      if (!this.connections.mysql) throw new Error('MySQL connection not initialized');
      const [rows] = await this.connections.mysql.execute(query, params);
      return rows as any[];
    } else {
      throw new Error(`Unsupported database type: ${type}`);
    }
  }

  /**
   * Closes all active database connections.
   */
  async close(): Promise<void> {
    if (this.connections.postgres) {
      await this.connections.postgres.end();
      this.connections.postgres = null;
    }
    if (this.connections.mysql) {
      await this.connections.mysql.end();
      this.connections.mysql = null;
    }
  }
}

export const databaseManager = new DatabaseManager();
