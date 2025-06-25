
import mysql from 'mysql2/promise';

const dbConfig = {
  host: '184.168.102.2',
  port: 3306,
  user: 'ljr9p52ospz7',
  password: 'Zxk%NnB09l0Y',
  database: 'i9875391_rnpd1',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
};

// Create connection pool
export const pool = mysql.createPool(dbConfig);

// Test connection function
export const testConnection = async () => {
  try {
    console.log('🔄 Testing MySQL connection...');
    const connection = await pool.getConnection();
    console.log('✅ MySQL database connected successfully');
    
    // Test a simple query to verify database access
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM offers_data LIMIT 1');
    console.log('📊 Database query test successful:', rows);
    
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
};

// Generic query function with enhanced logging
export const executeQuery = async (query: string, params: any[] = []) => {
  try {
    console.log('🔍 Executing query:', query.substring(0, 100) + '...');
    console.log('📝 Query parameters:', params);
    
    const [rows] = await pool.execute(query, params);
    console.log('✅ Query executed successfully, rows returned:', Array.isArray(rows) ? rows.length : 'N/A');
    
    return rows;
  } catch (error) {
    console.error('❌ Database query error:', error);
    throw error;
  }
};

// Get database info function
export const getDatabaseInfo = async () => {
  try {
    const [tables] = await pool.execute('SHOW TABLES');
    const [columns] = await pool.execute('DESCRIBE offers_data');
    
    console.log('📋 Available tables:', tables);
    console.log('🏗️ offers_data table structure:', columns);
    
    return { tables, columns };
  } catch (error) {
    console.error('❌ Error getting database info:', error);
    throw error;
  }
};
