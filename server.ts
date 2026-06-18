import express from "express";
import path from "path";
import dns from "dns";
import pg from "pg";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Type definition matches frontend src/types.ts
interface TutorInfo {
  nombre: string;
  dni: string;
  telefono: string;
}

interface BankInfo {
  entidad: string;
  titular: string;
  iban: string;
}

interface ConsentInfo {
  proteccionDatos: boolean;
  tratamientoInformativo: boolean;
  domiciliacionBancaria: boolean;
  fotografiasYVideos: boolean;
}

interface Registration {
  id: string;
  fechaRegistro: string;
  nombre: string;
  dniNia: string;
  fechaNacimiento: string;
  direccion: string;
  codigoPostal: string;
  localidad: string;
  provincia: string;
  telefono: string;
  correo: string;
  esMenor: boolean;
  tutor?: TutorInfo;
  tutorAlt?: TutorInfo;
  esNuevoSocio: boolean;
  modalidadSocio?: string;
  banco: BankInfo;
  consentimientos: ConsentInfo;
}

// In-Memory fallback store
let inMemoryRegistrations: Registration[] = [];

// DB connection pool if DATABASE_URL is available
let pool: pg.Pool | null = null;
let dbConnected = false;
let dbErrorString: string | null = null;

const dbUrl = process.env.DATABASE_URL;

if (dbUrl) {
  console.log("Configured: DATABASE_URL exists. Initializing PostgreSQL pool...");
  pool = new pg.Pool({
    connectionString: dbUrl,
    connectionTimeoutMillis: 5000, // Fail fast if routing is wrong
  });

  // Verify connection on startup to print clean messages
  pool.query("SELECT NOW()")
    .then(async () => {
      console.log("✅ Successfully connected to PostgreSQL database!");
      dbConnected = true;
      dbErrorString = null;

      // Initialize table structure
      try {
        await pool!.query(`
          CREATE TABLE IF NOT EXISTS registrations (
            id VARCHAR(50) PRIMARY KEY,
            fecha_registro VARCHAR(100) NOT NULL,
            nombre VARCHAR(255) NOT NULL,
            dni_nia VARCHAR(50) NOT NULL,
            fecha_nacimiento VARCHAR(50) NOT NULL,
            direccion VARCHAR(255) NOT NULL,
            codigo_postal VARCHAR(20) NOT NULL,
            localidad VARCHAR(150) NOT NULL,
            provincia VARCHAR(150) NOT NULL,
            telefono VARCHAR(50) NOT NULL,
            correo VARCHAR(255) NOT NULL,
            es_menor BOOLEAN NOT NULL,
            tutor_nombre VARCHAR(255),
            tutor_dni VARCHAR(50),
            tutor_telefono VARCHAR(50),
            tutor_nombre_alt VARCHAR(255),
            tutor_dni_alt VARCHAR(50),
            tutor_telefono_alt VARCHAR(50),
            es_nuevo_socio BOOLEAN NOT NULL,
            modalidad_socio VARCHAR(50),
            banco_entidad VARCHAR(255) NOT NULL,
            banco_titular VARCHAR(255) NOT NULL,
            banco_iban VARCHAR(50) NOT NULL,
            consent_proteccion_datos BOOLEAN NOT NULL,
            consent_tratamiento_informativo BOOLEAN NOT NULL,
            consent_domiciliacion_bancaria BOOLEAN NOT NULL,
            consent_fotografias_y_videos BOOLEAN NOT NULL
          );
        `);
        console.log("✅ PostgreSQL table 'registrations' verified and ready.");
      } catch (tableErr: any) {
        console.error("❌ Failed to verify database structure:", tableErr.message);
        dbErrorString = `Failed schema init: ${tableErr.message}`;
      }
    })
    .catch((err: any) => {
      console.error("⚠️ PostgreSQL Connection Failed. Falling back to digital memory storage setup:", err.message);
      dbConnected = false;
      dbErrorString = err.message;
    });
} else {
  console.log("ℹ️ No DATABASE_URL found. Application is operating in In-Memory/Local fallback mode.");
  dbErrorString = "DATABASE_URL environment variable is not defined";
}

// RESTRICTION: Admin Authorization Middleware for secure endpoints
const adminAuthMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  const expectedPassword = process.env.ADMIN_PASSWORD;
  
  let token = "";
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  } else if (req.headers["x-admin-token"]) {
    token = req.headers["x-admin-token"] as string;
  }

  if (token === expectedPassword) {
    return next();
  }
  
  return res.status(401).json({ error: "No autorizado. Sesión de administrador inválida o requerida." });
};

// API Routes

// 1. Get database connectivity and diagnostic status
app.get("/api/status", (req, res) => {
  res.json({
    postgres_configured: !!dbUrl,
    postgres_connected: dbConnected,
    storage_type: dbConnected ? "PostgreSQL Database" : "In-Memory RAM Store (Fallback)",
    error: dbErrorString,
  });
});

// Helper: Convert Postgres Row back into standard Registration Object
function mapRowToRegistration(row: any): Registration {
  return {
    id: row.id,
    fechaRegistro: row.fecha_registro,
    nombre: row.nombre,
    dniNia: row.dni_nia,
    fechaNacimiento: row.fecha_nacimiento,
    direccion: row.direccion,
    codigoPostal: row.codigo_postal,
    localidad: row.localidad,
    provincia: row.provincia,
    telefono: row.telefono,
    correo: row.correo,
    esMenor: row.es_menor,
    tutor: row.es_menor ? {
      nombre: row.tutor_nombre || "",
      dni: row.tutor_dni || "",
      telefono: row.tutor_telefono || "",
    } : undefined,
    tutorAlt: row.es_menor ? {
      nombre: row.tutor_nombre_alt || "",
      dni: row.tutor_dni_alt || "",
      telefono: row.tutor_telefono_alt || "",
    } : undefined,
    esNuevoSocio: row.es_nuevo_socio,
    modalidadSocio: row.modalidad_socio || undefined,
    banco: {
      entidad: row.banco_entidad,
      titular: row.banco_titular,
      iban: row.banco_iban,
    },
    consentimientos: {
      proteccionDatos: row.consent_proteccion_datos,
      tratamientoInformativo: row.consent_tratamiento_informativo,
      domiciliacionBancaria: row.consent_domiciliacion_bancaria,
      fotografiasYVideos: row.consent_fotografias_y_videos,
    }
  };
}

// 2. Fetch all registrations
app.get("/api/registrations", adminAuthMiddleware, async (req, res) => {
  if (dbConnected && pool) {
    try {
      const result = await pool.query("SELECT * FROM registrations ORDER BY fecha_registro DESC");
      const list = result.rows.map(mapRowToRegistration);
      return res.json(list);
    } catch (err: any) {
      console.error("Database query failed, returning local state:", err.message);
      return res.json(inMemoryRegistrations);
    }
  } else {
    return res.json(inMemoryRegistrations);
  }
});

// 3. Register a new student
app.post("/api/registrations", async (req, res) => {
  const data = req.body;
  if (!data.nombre || !data.correo) {
    return res.status(400).json({ error: "Required fields 'nombre' or 'correo' missing." });
  }

  // Assign permanent ID and registration date server-side safely
  const newReg: Registration = {
    ...data,
    id: data.id || `REG-${Math.floor(100000 + Math.random() * 900000)}`,
    fechaRegistro: data.fechaRegistro || new Date().toISOString()
  };

  if (dbConnected && pool) {
    try {
      await pool.query(`
        INSERT INTO registrations (
          id, fecha_registro, nombre, dni_nia, fecha_nacimiento, direccion,
          codigo_postal, localidad, provincia, telefono, correo, es_menor,
          tutor_nombre, tutor_dni, tutor_telefono,  tutor_nombre_alt, tutor_dni_alt, tutor_telefono_alt, es_nuevo_socio, modalidad_socio,
          banco_entidad, banco_titular, banco_iban, consent_proteccion_datos,
          consent_tratamiento_informativo, consent_domiciliacion_bancaria, consent_fotografias_y_videos
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27)
      `, [
        newReg.id,
        newReg.fechaRegistro,
        newReg.nombre,
        newReg.dniNia || "",
        newReg.fechaNacimiento || "",
        newReg.direccion || "",
        newReg.codigoPostal || "",
        newReg.localidad || "",
        newReg.provincia || "",
        newReg.telefono || "",
        newReg.correo,
        newReg.esMenor,
        newReg.tutor?.nombre || null,
        newReg.tutor?.dni || null,
        newReg.tutor?.telefono || null,
        newReg.tutorAlt?.nombre || null,
        newReg.tutorAlt?.dni || null,
        newReg.tutorAlt?.telefono || null,
        newReg.esNuevoSocio,
        newReg.modalidadSocio || null,
        newReg.banco?.entidad || "",
        newReg.banco?.titular || "",
        newReg.banco?.iban || "",
        newReg.consentimientos?.proteccionDatos ?? true,
        newReg.consentimientos?.tratamientoInformativo ?? true,
        newReg.consentimientos?.domiciliacionBancaria ?? true,
        newReg.consentimientos?.fotografiasYVideos ?? false
      ]);
      console.log(`✅ Stored registration in PostgreSQL: ${newReg.nombre}`);
      return res.status(201).json(newReg);
    } catch (err: any) {
      console.error("❌ DB Insert Failed, storing in RAM instead:", err.message);
      inMemoryRegistrations = [newReg, ...inMemoryRegistrations];
      return res.status(201).json(newReg);
    }
  } else {
    // Falls back to in memory stores
    inMemoryRegistrations = [newReg, ...inMemoryRegistrations];
    console.log(`💾 Stored in RAM (Fallback Mode): ${newReg.nombre}`);
    return res.status(201).json(newReg);
  }
});

// 4. Delete specific registration record
app.delete("/api/registrations/:id", async (req, res) => {
  const { id } = req.params;
  if (dbConnected && pool) {
    try {
      const result = await pool.query("DELETE FROM registrations WHERE id = $1", [id]);
      console.log(`🗑️ Deleted record from Postgres: ${id}`);
      return res.json({ success: true, message: `Registration ${id} deleted.` });
    } catch (err: any) {
      console.error("DB delete failed, running local delete filter:", err.message);
      inMemoryRegistrations = inMemoryRegistrations.filter(r => r.id !== id);
      return res.json({ success: true, message: `Registration ${id} removed from memory.` });
    }
  } else {
    inMemoryRegistrations = inMemoryRegistrations.filter(r => r.id !== id);
    return res.json({ success: true, message: `Registration ${id} removed from memory.` });
  }
});

// 5. Delete all records (Vaciar base de datos)
app.post("/api/registrations/clear-all", adminAuthMiddleware, async (req, res) => {
  if (dbConnected && pool) {
    try {
      await pool.query("TRUNCATE TABLE registrations");
      console.log("🗑️ Database table successfully truncated!");
      return res.json({ success: true, message: "All records erased from database." });
    } catch (err: any) {
      console.error("DB truncate failed:", err.message);
      inMemoryRegistrations = [];
      return res.json({ success: true, message: "Erase fallback: Memory space empty." });
    }
  } else {
    inMemoryRegistrations = [];
    return res.json({ success: true, message: "All local in-memory records cleared." });
  }
});

// 2. Admin Login Verification endpoint
app.post("/api/admin/login", (req, res) => {
  const { password } = req.body;
  const expectedPassword = process.env.ADMIN_PASSWORD;
  
  if (password === expectedPassword) {
    // Return verified token (using the password/config value directly to facilitate stateless rest restarts)
    return res.json({ success: true, token: expectedPassword });
  }
  return res.status(401).json({ error: "La contraseña facilitada es incorrecta." });
});


// 6. Seed mock data convenient endpoint (Cargar ejemplos)
app.post("/api/registrations/mock", adminAuthMiddleware, async (req, res) => {
  const sampleRegistrations: Registration[] = [
    {
      id: "REG-230912",
      fechaRegistro: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      nombre: "María Vicedo Alcaraz",
      dniNia: "48392019H",
      fechaNacimiento: "2015-04-12",
      direccion: "Calle del Pi, 12, 2B",
      codigoPostal: "03698",
      localidad: "Agost",
      provincia: "Alicante",
      telefono: "612402941",
      correo: "maria.vicedo.alcaraz@gmail.com",
      esMenor: true,
      tutor: {
        nombre: "Francisco Vicedo Llopis",
        dni: "22091482E",
        telefono: "612402941"
      },
      esNuevoSocio: true,
      modalidadSocio: "familiar",
      banco: {
        entidad: "Banco Sabadell",
        titular: "Francisco Vicedo Llopis",
        iban: "ES8200810142982001948291"
      },
      consentimientos: {
        proteccionDatos: true,
        tratamientoInformativo: true,
        domiciliacionBancaria: true,
        fotografiasYVideos: true
      }
    },
    {
      id: "REG-721204",
      fechaRegistro: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      nombre: "Carlos Mollá Beltrán",
      dniNia: "21980312F",
      fechaNacimiento: "1994-11-28",
      direccion: "Avda. de la Pau, 41, Esc. C",
      codigoPostal: "03698",
      localidad: "Agost",
      provincia: "Alicante",
      telefono: "644192038",
      correo: "carlos.molla@musicaagost.es",
      esMenor: false,
      esNuevoSocio: true,
      modalidadSocio: "individual",
      banco: {
        entidad: "CaixaBank",
        titular: "Carlos Mollá Beltrán",
        iban: "ES4321000182419028491024"
      },
      consentimientos: {
        proteccionDatos: true,
        tratamientoInformativo: true,
        domiciliacionBancaria: true,
        fotografiasYVideos: false
      }
    }
  ];

  if (dbConnected && pool) {
    try {
      // Loop over samples and inject
      for (const reg of sampleRegistrations) {
        // Only insert if not exists to avoid primary key error
        const exist_check = await pool.query("SELECT id FROM registrations WHERE id = $1", [reg.id]);
        if (exist_check.rows.length === 0) {
          await pool.query(`
            INSERT INTO registrations (
              id, fecha_registro, nombre, dni_nia, fecha_nacimiento, direccion,
              codigo_postal, localidad, provincia, telefono, correo, es_menor,
              tutor_nombre, tutor_dni, tutor_telefono, tutor_nombre_alt, tutor_dni_alt, tutor_telefono_alt,  es_nuevo_socio, modalidad_socio,
              banco_entidad, banco_titular, banco_iban, consent_proteccion_datos,
              consent_tratamiento_informativo, consent_domiciliacion_bancaria, consent_fotografias_y_videos
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
          `, [
            reg.id,
            reg.fechaRegistro,
            reg.nombre,
            reg.dniNia,
            reg.fechaNacimiento,
            reg.direccion,
            reg.codigoPostal,
            reg.localidad,
            reg.provincia,
            reg.telefono,
            reg.correo,
            reg.esMenor,
            reg.tutor?.nombre || null,
            reg.tutor?.dni || null,
            reg.tutor?.telefono || null,
            reg.tutorAlt?.nombre || null,
            reg.tutorAlt?.dni || null,
            reg.tutorAlt?.telefono || null,
            reg.esNuevoSocio,
            reg.modalidadSocio || null,
            reg.banco.entidad,
            reg.banco.titular,
            reg.banco.iban,
            reg.consentimientos.proteccionDatos,
            reg.consentimientos.tratamientoInformativo,
            reg.consentimientos.domiciliacionBancaria,
            reg.consentimientos.fotografiasYVideos
          ]);
        }
      }
      return res.json({ success: true, count: sampleRegistrations.length });
    } catch (err: any) {
      console.error("Failed to seed Postgres mock data:", err.message);
      // fallback RAM seed
      inMemoryRegistrations = [...sampleRegistrations, ...inMemoryRegistrations];
      return res.json({ success: true, count: sampleRegistrations.length, ram: true });
    }
  } else {
    inMemoryRegistrations = [...sampleRegistrations, ...inMemoryRegistrations];
    return res.json({ success: true, count: sampleRegistrations.length });
  }
});

// Configure Vite middleware or serve static dist folder based on environmental phase
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Development mode detected. Launching Vite Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Production mode detected. Serving static assets...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Full-stack express server connected on address http://localhost:${PORT}`);
  });
}

startServer();
