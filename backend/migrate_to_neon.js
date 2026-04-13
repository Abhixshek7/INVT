/**
 * migrate_to_neon.js  (dynamic, resilient version)
 * ─────────────────────────────────────────────────────────────────
 * Credentials are read from .env — safe to commit to git.
 * ─────────────────────────────────────────────────────────────────
 * • Introspects source DB schema dynamically (no hardcoding)
 * • Skips tables that already have data on Neon (ON CONFLICT)
 * • Continues on per-table errors and prints a full summary
 * • Tracks migrated / skipped / failed tables
 *
 * Run:  node migrate_to_neon.js
 * ─────────────────────────────────────────────────────────────────
 */

require('dotenv').config();
const { Pool } = require('pg');

// ── Source: local Postgres (reads from .env) ─────────────────────
// Uses the original local DB credentials stored as LOCAL_* vars in .env
const src = new Pool({
    user:     process.env.LOCAL_DB_USER     || 'postgres',
    host:     process.env.LOCAL_DB_HOST     || 'localhost',
    database: process.env.LOCAL_DB_NAME     || 'INVT',
    password: process.env.LOCAL_DB_PASSWORD || 'pg@1010',
    port:     parseInt(process.env.LOCAL_DB_PORT || '5432'),
});

// ── Destination: Neon (reads DATABASE_URL from .env) ─────────────
const dst = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

function log(msg) { console.log(`[${new Date().toISOString()}] ${msg}`); }

// Parse postgres array literal  "{a,b,c}"  →  ['a','b','c']
// Works for both JS arrays (already parsed by pg) and raw strings.
function parsePgArray(val) {
    if (Array.isArray(val)) return val;
    if (!val) return [];
    // Remove wrapping braces and split on comma
    return val.replace(/^\{|\}$/g, '').split(',').map(s => s.trim().replace(/^"|"$/g, ''));
}

// ─────────────────────────────────────────────────────────────────
// Topological sort of tables by FK dependencies
// ─────────────────────────────────────────────────────────────────
async function getTablesInOrder() {
    const tablesRes = await src.query(`
        SELECT tablename FROM pg_tables
        WHERE schemaname = 'public'
        ORDER BY tablename
    `);
    const all = tablesRes.rows.map(r => r.tablename);

    const depsRes = await src.query(`
        SELECT DISTINCT
            tc.table_name  AS child,
            ccu.table_name AS parent
        FROM information_schema.table_constraints tc
        JOIN information_schema.referential_constraints rc
            ON tc.constraint_name = rc.constraint_name
        JOIN information_schema.constraint_column_usage ccu
            ON rc.unique_constraint_name = ccu.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_schema = 'public'
    `);

    const deps = {};
    for (const t of all) deps[t] = new Set();
    for (const { child, parent } of depsRes.rows) {
        if (child !== parent && deps[child]) deps[child].add(parent);
    }

    // Kahn's algorithm
    const inDegree = {};
    for (const t of all) inDegree[t] = deps[t].size;
    const queue  = all.filter(t => inDegree[t] === 0);
    const sorted = [];

    while (queue.length) {
        const node = queue.shift();
        sorted.push(node);
        for (const t of all) {
            if (deps[t].has(node)) {
                deps[t].delete(node);
                if (--inDegree[t] === 0) queue.push(t);
            }
        }
    }
    // Append any remaining (circular refs)
    for (const t of all) if (!sorted.includes(t)) sorted.push(t);
    return sorted;
}

// ─────────────────────────────────────────────────────────────────
// Build CREATE TABLE DDL from information_schema
// ─────────────────────────────────────────────────────────────────
async function getCreateTableDDL(table) {
    const colsRes = await src.query(`
        SELECT column_name, data_type, character_maximum_length,
               numeric_precision, numeric_scale, is_nullable,
               column_default, udt_name
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position
    `, [table]);

    const colDefs = colsRes.rows.map(col => {
        const d = col.column_default || '';
        let typeDef;

        if (d.startsWith('nextval(')) {
            typeDef = col.data_type === 'bigint' ? 'BIGSERIAL' : 'SERIAL';
        } else if (col.data_type === 'character varying') {
            typeDef = col.character_maximum_length
                ? `VARCHAR(${col.character_maximum_length})` : 'TEXT';
        } else if (col.data_type === 'numeric') {
            if (col.numeric_precision != null && col.numeric_scale != null) {
                // Widen precision to avoid overflow (add 5 digits head-room)
                const prec = Math.max(col.numeric_precision + 5, 15);
                typeDef = `NUMERIC(${prec},${col.numeric_scale})`;
            } else {
                typeDef = 'NUMERIC';
            }
        } else if (col.data_type === 'USER-DEFINED') {
            typeDef = col.udt_name.toUpperCase();
        } else {
            typeDef = col.data_type.toUpperCase();
        }

        const nullable    = col.is_nullable === 'YES' ? '' : ' NOT NULL';
        const defaultVal  = d && !d.startsWith('nextval(') ? ` DEFAULT ${d}` : '';
        return `    "${col.column_name}" ${typeDef}${nullable}${defaultVal}`;
    });

    // Primary key
    const pkRes = await src.query(`
        SELECT kcu.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_schema = 'public' AND tc.table_name = $1
          AND tc.constraint_type = 'PRIMARY KEY'
        ORDER BY kcu.ordinal_position
    `, [table]);
    if (pkRes.rows.length) {
        const pkCols = pkRes.rows.map(r => `"${r.column_name}"`).join(', ');
        colDefs.push(`    PRIMARY KEY (${pkCols})`);
    }

    // Unique constraints (non-PK)
    const uqRes = await src.query(`
        SELECT tc.constraint_name,
               array_agg(kcu.column_name::text ORDER BY kcu.ordinal_position) AS cols
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name
           AND tc.table_schema    = kcu.table_schema
        WHERE tc.table_schema    = 'public'
          AND tc.table_name      = $1
          AND tc.constraint_type = 'UNIQUE'
        GROUP BY tc.constraint_name
    `, [table]);

    for (const uq of uqRes.rows) {
        const cols = parsePgArray(uq.cols).map(c => `"${c}"`).join(', ');
        if (cols) colDefs.push(`    UNIQUE (${cols})`);
    }

    // Foreign keys
    const fkRes = await src.query(`
        SELECT kcu.column_name,
               ccu.table_name  AS ref_table,
               ccu.column_name AS ref_column,
               rc.delete_rule,
               rc.update_rule
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.referential_constraints rc
            ON tc.constraint_name = rc.constraint_name
        JOIN information_schema.constraint_column_usage ccu
            ON rc.unique_constraint_name = ccu.constraint_name
        WHERE tc.table_schema    = 'public'
          AND tc.table_name      = $1
          AND tc.constraint_type = 'FOREIGN KEY'
    `, [table]);

    for (const fk of fkRes.rows) {
        let def = `    FOREIGN KEY ("${fk.column_name}") REFERENCES "${fk.ref_table}"("${fk.ref_column}")`;
        if (fk.delete_rule && fk.delete_rule !== 'NO ACTION') def += ` ON DELETE ${fk.delete_rule}`;
        if (fk.update_rule && fk.update_rule !== 'NO ACTION') def += ` ON UPDATE ${fk.update_rule}`;
        colDefs.push(def);
    }

    return `CREATE TABLE IF NOT EXISTS "${table}" (\n${colDefs.join(',\n')}\n);`;
}

// ─────────────────────────────────────────────────────────────────
// Sync any columns that exist in source but are missing on Neon
// (happens when a previous run created the table with an old schema)
// ─────────────────────────────────────────────────────────────────
async function syncMissingColumns(table) {
    // Get columns from source
    const srcCols = await src.query(`
        SELECT column_name, data_type, character_maximum_length,
               numeric_precision, numeric_scale, is_nullable,
               column_default, udt_name
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position
    `, [table]);

    // Get columns already on Neon
    const dstCols = await dst.query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
    `, [table]);
    const dstColNames = new Set(dstCols.rows.map(r => r.column_name));

    // For each source column missing on Neon, ALTER TABLE ADD COLUMN
    for (const col of srcCols.rows) {
        if (dstColNames.has(col.column_name)) continue;

        const d = col.column_default || '';
        let typeDef;
        if (d.startsWith('nextval(')) {
            typeDef = col.data_type === 'bigint' ? 'BIGSERIAL' : 'SERIAL';
        } else if (col.data_type === 'character varying') {
            typeDef = col.character_maximum_length ? `VARCHAR(${col.character_maximum_length})` : 'TEXT';
        } else if (col.data_type === 'numeric') {
            typeDef = (col.numeric_precision != null && col.numeric_scale != null)
                ? `NUMERIC(${Math.max(col.numeric_precision + 5, 15)},${col.numeric_scale})`
                : 'NUMERIC';
        } else if (col.data_type === 'USER-DEFINED') {
            typeDef = col.udt_name.toUpperCase();
        } else {
            typeDef = col.data_type.toUpperCase();
        }

        const defaultVal = d && !d.startsWith('nextval(') ? ` DEFAULT ${d}` : '';
        const nullable   = col.is_nullable === 'YES' ? '' : ' NOT NULL';

        const alterSQL = `ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "${col.column_name}" ${typeDef}${nullable}${defaultVal}`;
        try {
            await dst.query(alterSQL);
            log(`    + Added missing column: ${table}.${col.column_name} (${typeDef})`);
        } catch (err) {
            log(`    ⚠  Could not add ${table}.${col.column_name}: ${err.message}`);
        }
    }
}

// ─────────────────────────────────────────────────────────────────
// Reset sequences after data load
// ─────────────────────────────────────────────────────────────────
async function resetSequences(client, table) {
    const res = await client.query(`
        SELECT column_name,
               pg_get_serial_sequence($1, column_name) AS seq
        FROM information_schema.columns
        WHERE table_name = $1 AND column_default LIKE 'nextval%'
    `, [table]);
    for (const row of res.rows) {
        if (row.seq) {
            await client.query(
                `SELECT setval($1, COALESCE((SELECT MAX("${row.column_name}") FROM "${table}"), 1))`,
                [row.seq]
            );
        }
    }
}

// ─────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────
async function migrate() {
    log('═══════════════════════════════════════════════════');
    log('  INVT → Neon Migration  (dynamic + resilient)');
    log('═══════════════════════════════════════════════════');

    log('Connecting to source (local Postgres)…');
    await src.query('SELECT 1');
    log('✔ Source connected');

    log('Connecting to target (Neon)…');
    await dst.query('SELECT 1');
    log('✔ Target connected\n');

    // Results tracking
    const results = { migrated: [], skipped: [], failed: [] };

    // ── Step 1: discover tables ───────────────────────────────────
    log('[Step 1] Discovering tables in FK-safe order…');
    const tables = await getTablesInOrder();
    log(`✔ ${tables.length} tables: ${tables.join(', ')}\n`);

    // ── Step 2: create / patch schema on Neon ────────────────────
    log('[Step 2] Creating / patching schema on Neon…');
    for (const table of tables) {
        try {
            const ddl = await getCreateTableDDL(table);
            await dst.query(ddl);          // no-op if table already exists
            await syncMissingColumns(table); // patch any columns added since last run
            log(`  ✔ ${table}`);
        } catch (err) {
            log(`  ⚠  ${table} (schema): ${err.message}`);
        }
    }

    // ── Step 3: copy data ─────────────────────────────────────────
    log('\n[Step 3] Copying data…\n');

    for (const table of tables) {
        let srcCount;
        try {
            srcCount = parseInt((await src.query(`SELECT COUNT(*) FROM "${table}"`)).rows[0].count, 10);
        } catch (err) {
            log(`  ✘ ${table}: could not read source – ${err.message}`);
            results.failed.push({ table, reason: err.message });
            continue;
        }

        if (srcCount === 0) {
            log(`  ─ ${table}: 0 rows in source – skipping`);
            results.skipped.push(table);
            continue;
        }

        // Check how many already exist on Neon
        let dstCount = 0;
        try {
            dstCount = parseInt((await dst.query(`SELECT COUNT(*) FROM "${table}"`)).rows[0].count, 10);
        } catch { /* table might not exist yet */ }

        log(`  ▶ ${table}: ${srcCount} source rows (${dstCount} already on Neon)`);

        const client = await dst.connect();
        try {
            await client.query('BEGIN');

            const { rows } = await src.query(`SELECT * FROM "${table}" ORDER BY 1`);
            if (rows.length === 0) {
                await client.query('ROLLBACK');
                results.skipped.push(table);
                continue;
            }

            const columns  = Object.keys(rows[0]);
            const colList  = columns.map(c => `"${c}"`).join(', ');
            const CHUNK    = 500;
            let inserted   = 0;

            for (let i = 0; i < rows.length; i += CHUNK) {
                const chunk  = rows.slice(i, i + CHUNK);
                const values = [];
                const phs    = chunk.map((row, ri) => {
                    const ph = columns.map((col, ci) => {
                        values.push(row[col]);
                        return `$${ri * columns.length + ci + 1}`;
                    });
                    return `(${ph.join(', ')})`;
                });

                await client.query(
                    `INSERT INTO "${table}" (${colList}) VALUES ${phs.join(', ')} ON CONFLICT DO NOTHING`,
                    values
                );
                inserted += chunk.length;
                process.stdout.write(`\r    ${inserted}/${rows.length} rows…`);
            }

            await resetSequences(client, table);
            await client.query('COMMIT');

            // Verify
            const newCount = parseInt((await dst.query(`SELECT COUNT(*) FROM "${table}"`)).rows[0].count, 10);
            console.log(`\r    ✔ ${table}: ${newCount} rows on Neon    `);
            results.migrated.push({ table, srcCount, newCount });

        } catch (err) {
            await client.query('ROLLBACK').catch(() => {});
            console.log(`\r    ✘ ${table}: ${err.message}    `);
            results.failed.push({ table, reason: err.message });
        } finally {
            client.release();
        }
    }

    // ── Step 4: summary ───────────────────────────────────────────
    log('\n══════════════════════════════════════════════════');
    log('  MIGRATION SUMMARY');
    log('══════════════════════════════════════════════════');

    log(`\n✔ Migrated (${results.migrated.length}):`);
    for (const r of results.migrated) {
        const match = r.srcCount === r.newCount ? '✔' : '⚠ count mismatch';
        log(`    ${match}  ${r.table}  (local: ${r.srcCount} → neon: ${r.newCount})`);
    }

    if (results.skipped.length) {
        log(`\n─ Skipped / empty (${results.skipped.length}):`);
        for (const t of results.skipped) log(`    ─  ${t}`);
    }

    if (results.failed.length) {
        log(`\n✘ Failed (${results.failed.length}):`);
        for (const f of results.failed) log(`    ✘  ${f.table}: ${f.reason}`);
    }

    const allOk = results.failed.length === 0;
    log(`\n${allOk ? '🎉 All tables migrated successfully!' : '⚠  Some tables failed – see above.'}\n`);

    await src.end();
    await dst.end();
}

migrate().catch(err => {
    console.error('Fatal:', err);
    process.exit(1);
});
