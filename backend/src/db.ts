import { Pool } from 'pg';
// import dotenv from 'dotenv'; // No longer needed here

// Verify loading (Keep temporary logging)
console.log('DB Connection Details Used by Process:', {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD ? '******' : undefined,
  database: process.env.DB_NAME,
});

const pool = new Pool({
  // Fallback values are still useful if .env is missing or vars aren't set
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // Recommended settings for robust connection handling
  max: 20, // Max number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // How long to wait for a connection attempt to succeed
});

const initializeSchema = async () => {
  const client = await pool.connect();
  try {
    console.log('Initializing database schema...');

    // Enable UUID generation
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    // Create Projects Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL
      );
    `);
    console.log('Table "projects" ensured.');

    // Create Columns Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS columns (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "projectId" UUID REFERENCES projects(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        "order" INTEGER NOT NULL
      );
    `);
    console.log('Table "columns" ensured.');

    // Create Tasks Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "columnId" UUID REFERENCES columns(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        priority VARCHAR(50) DEFAULT 'Medium',
        "dueDate" DATE,
        "order" INTEGER NOT NULL
      );
    `);
    console.log('Table "tasks" ensured.');

    // --- Seed Default Project (if it doesn't exist) ---
    const projectRes = await client.query('SELECT id FROM projects WHERE name = $1', ['Default Project']);
    let defaultProjectId;
    if (projectRes.rowCount === 0) {
      console.log('Creating Default Project...');
      const insertRes = await client.query('INSERT INTO projects (name) VALUES ($1) RETURNING id', ['Default Project']);
      defaultProjectId = insertRes.rows[0].id;
      console.log('Default Project created with ID:', defaultProjectId);
    } else {
      defaultProjectId = projectRes.rows[0].id;
      console.log('Default Project already exists with ID:', defaultProjectId);
    }

    // --- Seed Default Columns for Default Project (if none exist for it) ---
    const columnRes = await client.query('SELECT id FROM columns WHERE "projectId" = $1', [defaultProjectId]);
    if (columnRes.rowCount === 0) {
      console.log('Seeding default columns for Default Project...');
      const defaultColumns = ['To Do', 'In Progress', 'Done'];
      for (let i = 0; i < defaultColumns.length; i++) {
        await client.query('INSERT INTO columns ("projectId", name, "order") VALUES ($1, $2, $3)', [defaultProjectId, defaultColumns[i], i]);
      }
      console.log('Default columns seeded.');
    } else {
      console.log('Columns already exist for Default Project.');
    }

    console.log('Database schema initialization complete.');
  } catch (err: any) { // Use 'any' or define a more specific error type
    console.error('Error initializing database schema:', err.stack);
    // Consider whether to exit if schema initialization fails critically
    // process.exit(1);
  } finally {
    client.release(); // Release client back to pool
  }
};

// Test the connection and initialize schema
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error acquiring database client', err.stack);
    // Potentially exit the application if DB connection is critical
    // process.exit(1);
  } else {
    console.log('Successfully connected to PostgreSQL database');
    client?.query('SELECT NOW()', (err, result) => {
      // Release client immediately after test query
      release(); 
      if (err) {
        return console.error('Error executing test query', err.stack);
      }
      console.log('Test query result:', result.rows);
      // Initialize schema after successful connection test
      initializeSchema(); 
    });
  }
});

export default pool; 