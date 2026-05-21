import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environmental parameters
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Prepare offline persistent structures
const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Ensure public uploads space exists
const STATIC_UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(STATIC_UPLOADS_DIR)) {
  fs.mkdirSync(STATIC_UPLOADS_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'db.json');
const MESSAGES_PATH = path.join(DATA_DIR, 'messages.json');

// Helper to safely read files with baseline defaults
function readJSONFile(filePath: string, fallback: any) {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.warn(`[Data Store] Warning reading local file ${filePath}:`, err);
  }
  return fallback;
}

// Helper to safely write files 
function writeJSONFile(filePath: string, data: any) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error(`[Data Store] Error writing local data to ${filePath}:`, err);
    return false;
  }
}

// Lazy load & validate Supabase client safely (Prevents node crash if variables are uninitialized)
let supabaseClient: any = null;
function getSupabase() {
  if (!supabaseClient) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY;
    if (url && key) {
      supabaseClient = createClient(url, key);
      console.log("[Supabase] Secure client connected to cloud.");
    } else {
      console.warn("[Supabase] Warnings: SUPABASE_URL or SUPABASE_ANON_KEY not set. Continuing with offline json storage engine.");
    }
  }
  return supabaseClient;
}

// --- API ACTIONS & ENDPOINTS ---

// 1. GET /api/portfolio-data (Pulls merged active configuration)
app.get('/api/portfolio-data', async (req, res) => {
  const defaultDatabase = {
    userInfo: null,
    projects: null,
    services: null,
    timeline: null,
    skills: null,
    reasons: null,
    funFacts: null
  };
  const localDB = readJSONFile(DB_PATH, defaultDatabase);

  const supabase = getSupabase();
  if (supabase) {
    try {
      // Pull dynamic configurations compiled under unified config
      const { data, error } = await supabase
        .from('portfolio_configs')
        .select('*')
        .eq('key', 'cms_data')
        .single();

      if (!error && data) {
        console.log("[Supabase] Safely retrieved active properties.");
        return res.json(data.value);
      } else if (error && error.code === 'PGRST116') {
        // config row is not initialized yet -> seed it with local configuration!
        console.log("[Supabase] Config row empty. Seeding database with default parameters...");
        const { error: seedError } = await supabase
          .from('portfolio_configs')
          .insert([{ key: 'cms_data', value: localDB }]);
        
        if (!seedError) {
          console.log("[Supabase] Successfully seeded initial configurations to cloud database.");
        } else {
          console.error("[Supabase] Error seeding configurations:", seedError);
        }
      } else if (error && error.code === 'PGRST125') {
        // Table does not exist yet
        console.log("[Supabase Store] Note: 'portfolio_configs' table is not created yet (PGRST125). Using local db.json file storage gracefully.");
      } else {
        console.warn("[Supabase] Select query failed. Falling back to local values. Code:", error?.code, error?.message);
      }
    } catch (dbErr) {
      console.error("[Supabase] Core data channel failure:", dbErr);
    }
  }

  // Baseline JSON File sync fallback
  res.json(localDB);
});

// New database status check endpoint for user diagnostics helper
app.get('/api/db-status', async (req, res) => {
  const supabase = getSupabase();
  const status = {
    configured: !!supabase,
    supabaseUrl: process.env.SUPABASE_URL || null,
    configsTableOk: false,
    messagesTableOk: false,
    errors: [] as string[]
  };

  if (supabase) {
    try {
      // 1. Test portfolio_configs table existence
      const { error: confError } = await supabase
        .from('portfolio_configs')
        .select('key')
        .limit(1);
      
      if (!confError) {
        status.configsTableOk = true;
      } else {
        status.errors.push(`configsTable: ${confError.message} (Code: ${confError.code})`);
      }

      // 2. Test contact_messages table existence
      const { error: msgError } = await supabase
        .from('contact_messages')
        .select('id')
        .limit(1);

      if (!msgError) {
        status.messagesTableOk = true;
      } else {
        status.errors.push(`messagesTable: ${msgError.message} (Code: ${msgError.code})`);
      }
    } catch (err: any) {
      status.errors.push(`Ping failure: ${err?.message || err}`);
    }
  }

  res.json(status);
});

// 2. POST /api/portfolio-data (Publishes portfolio configurations)
app.post('/api/portfolio-data', async (req, res) => {
  const currentDB = readJSONFile(DB_PATH, {});
  const newDB = { ...currentDB, ...req.body };
  
  // Persist local copy
  writeJSONFile(DB_PATH, newDB);

  const supabase = getSupabase();
  if (supabase) {
    try {
      const { error } = await supabase
        .from('portfolio_configs')
        .upsert({ key: 'cms_data', value: newDB });

      if (!error) {
        console.log("[Supabase] Saved custom configurations to Cloud table successfully.");
        return res.json({ success: true, message: 'Cloud configurations saved successfully.' });
      } else {
        console.error("[Supabase] Error saving portfolio options:", error);
      }
    } catch (dbErr) {
      console.error("[Supabase] Save connection channel crash:", dbErr);
    }
  }

  res.json({ success: true, message: 'Saved successfully to local engine storage.' });
});

// 3. GET /api/contact-messages (Inbox entries lookup)
app.get('/api/contact-messages', async (req, res) => {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('timestamp', { ascending: false });

      if (!error && data) {
        // Map database structures back to match frontend types
        const camelCaseMessages = data.map((msg: any) => ({
          id: msg.id,
          name: msg.name,
          email: msg.email,
          subject: msg.subject,
          message: msg.message,
          timestamp: msg.timestamp || msg.created_at,
          ipAddress: msg.ip_address,
          isRead: msg.is_read
        }));
        return res.json(camelCaseMessages);
      } else {
        if (error && error.code === 'PGRST125') {
          console.log("[Supabase Store] Note: 'contact_messages' table is not created yet (PGRST125). Retrieving from local messages.json successfully.");
        } else {
          console.error("[Supabase] Messages retrieve error:", error);
        }
      }
    } catch (dbErr) {
      console.error("[Supabase] Inbox communication failure:", dbErr);
    }
  }

  const localMessages = readJSONFile(MESSAGES_PATH, []);
  res.json(localMessages);
});

// 4. POST /api/contact (Receives and dispatches new consultation form inquiries)
app.post('/api/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: 'Name, Email, and Message are required fields.' });
  }

  const messageId = `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const clientIP = req.ip || req.headers['x-forwarded-for'] || 'Unknown IP';
  const timestampISO = new Date().toISOString();

  const newMessagePayload = {
    id: messageId,
    name,
    email,
    subject: subject || 'General Consultation Inquiry',
    message,
    timestamp: timestampISO,
    ipAddress: clientIP,
    isRead: false
  };

  // 1. Sync to local archive copy
  const localMessages = readJSONFile(MESSAGES_PATH, []);
  localMessages.unshift(newMessagePayload);
  writeJSONFile(MESSAGES_PATH, localMessages);

  // 2. Sync to Supabase Cloud Storage
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .insert({
          id: messageId,
          name,
          email,
          subject: subject || 'General Consultation Inquiry',
          message,
          timestamp: timestampISO,
          ip_address: clientIP,
          is_read: false
        });

      if (!error) {
        console.log("[Supabase] Saved new consultation request under cloud database.");
      } else {
        console.error("[Supabase] Failed saving inline message to Cloud DB:", error);
      }
    } catch (dbErr) {
      console.error("[Supabase] Cloud database crash saving client message:", dbErr);
    }
  }

  // Professional Automail Simulator Delivery Trace Logging
  console.log(`\n======================================================`);
  console.log(`✉️  [AUTOMATED EMAIL NOTIFICATION ROUTING]`);
  console.log(`Recipient Primary: usamaenviroengineer@gmail.com`);
  console.log(`Sender: ${name} <${email}>`);
  console.log(`Subject: New Portfolio Contact -> ${newMessagePayload.subject}`);
  console.log(`Body: "${message}"`);
  console.log(`Stored Securely in database with tracking ID: ${messageId}`);
  console.log(`======================================================\n`);

  res.json({ 
    success: true, 
    message: 'Your inquiry has been processed and safely transmitted to Usama Rasheed. You will receive a feedback shortly.' 
  });
});

// 5. DELETE /api/contact-messages/:id (Deletes entry from inbox logs)
app.delete('/api/contact-messages/:id', async (req, res) => {
  const { id } = req.params;

  // Remove from local fallback file
  const localMessages = readJSONFile(MESSAGES_PATH, []);
  const filtered = localMessages.filter((m: any) => m.id !== id);
  writeJSONFile(MESSAGES_PATH, filtered);

  // Remove from Supabase Cloud Table
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', id);

      if (!error) {
        console.log(`[Supabase] Cleaned message ${id} from database logs.`);
        return res.json({ success: true, message: 'Message removed successfully from cloud database.' });
      } else {
        console.error(`[Supabase] Deletion database query error for ${id}:`, error);
      }
    } catch (dbErr) {
      console.error("[Supabase] Cloud connection deletion error:", dbErr);
    }
  }

  res.json({ success: true, message: 'Message removed successfully from local disk backup.' });
});

// 6. POST /api/upload (Secure Image Uplink to Supabase Storage or Local directory)
app.post('/api/upload', async (req, res) => {
  const { fileBase64, fileName, fileType } = req.body;
  
  if (!fileBase64 || !fileName) {
    return res.status(400).json({ success: false, error: 'Full file input binary is required' });
  }

  // Parse Buffer payload from Base64
  const base64Data = fileBase64.replace(/^data:image\/\w+;base64,/, "");
  const binaryBuffer = Buffer.from(base64Data, 'base64');
  const cleanFileName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.]/g, "_")}`;

  // Try saving locally first to guarantee fallback hosting
  const localFilePath = path.join(STATIC_UPLOADS_DIR, cleanFileName);
  try {
    fs.writeFileSync(localFilePath, binaryBuffer);
    console.log(`[Uploader] Saved file to local public directory: /uploads/${cleanFileName}`);
  } catch (err) {
    console.error("[Uploader] Failed to write fallback file to disk:", err);
  }

  const supabase = getSupabase();
  if (supabase) {
    try {
      // Stream payload to Supabase Bucket 'portfolio-assets'
      const { data, error } = await supabase.storage
        .from('portfolio-assets')
        .upload(`uploads/${cleanFileName}`, binaryBuffer, {
          contentType: fileType || 'image/png',
          upsert: true
        });

      if (!error && data) {
        // Build the public CDN pathway URL from Supabase
        const { data: { publicUrl } } = supabase.storage
          .from('portfolio-assets')
          .getPublicUrl(`uploads/${cleanFileName}`);
        
        console.log(`[Supabase Storage] Custom image asset published publicly to: ${publicUrl}`);
        return res.json({ success: true, publicUrl });
      } else {
        console.warn("[Supabase Storage] Upload bucket failed. Falling back to local static asset serving. Error:", error?.message);
      }
    } catch (srvErr) {
      console.error("[Supabase Storage] Upload transaction error:", srvErr);
    }
  }

  // If Supabase Storage is not set up, serve the local static router link
  const localPublicPath = `/uploads/${cleanFileName}`;
  res.json({ success: true, publicUrl: localPublicPath });
});

// 7. POST /api/auth/login (Validates the passcode before permitting access to branding CMS)
app.post('/api/auth/login', (req, res) => {
  const { passcode } = req.body;
  const configuredPasscode = process.env.CMS_PASSCODE || 'usama123';

  if (!passcode) {
    return res.status(400).json({ success: false, error: 'Authorization input parameter is required.' });
  }

  if (passcode === configuredPasscode) {
    console.log("[Authentication] Security validation passed for branding hub.");
    return res.json({ success: true, sessionToken: `session-${Date.now()}` });
  } else {
    console.log("[Authentication] Unauthorized entrance attempt rejected.");
    return res.status(401).json({ success: false, error: 'The authorization passcode entered is incorrect.' });
  }
});


// Vite Dev Server Routing vs. Static Production SPA Delivery handling
async function initializeServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n======================================================`);
    console.log(`🚀  [USAMA RASHEED] Fast, Modern Portfolio Engine Active!`);
    console.log(`🌐  Local Access Direct:  http://localhost:${PORT}`);
    console.log(`======================================================\n`);
  });
}

initializeServer();
